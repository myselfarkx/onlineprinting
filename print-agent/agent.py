import time
import os
import base64
import requests
import win32api
import win32print
import win32ui
from PIL import Image, ImageWin

BACKEND_URL = "http://127.0.0.1:5000"

print("=" * 60)
print(" Local Print Agent (DIRECT EPSON SPOOLER ACTIVE)")
try:
    default_printer = win32print.GetDefaultPrinter()
    print(f" Detected Printer: {default_printer}")
except Exception:
    print(" WARNING: No default printer detected!")
print("=" * 60)

def print_image_direct(file_path):
    printer_name = win32print.GetDefaultPrinter()
    try:
        print(f" [SPOOLING] Sending {file_path} directly to {printer_name}...")
        
        img = Image.open(file_path)
        if img.mode != "RGB":
            img = img.convert("RGB")

        hDC = win32ui.CreateDC()
        hDC.CreatePrinterDC(printer_name)
        
        hDC.StartDoc(file_path)
        hDC.StartPage()
        
        horz_res = hDC.GetDeviceCaps(8)
        vert_res = hDC.GetDeviceCaps(10)
        
        img_w, img_h = img.size
        img_ratio = img_w / img_h
        page_ratio = horz_res / vert_res
        
        if img_ratio > page_ratio:
            new_w = horz_res
            new_h = int(horz_res / img_ratio)
        else:
            new_h = vert_res
            new_w = int(vert_res * img_ratio)
            
        x_offset = (horz_res - new_w) // 2
        y_offset = (vert_res - new_h) // 2
        
        dib = ImageWin.Dib(img)
        dib.draw(hDC.GetHandleOutput(), (x_offset, y_offset, x_offset + new_w, y_offset + new_h))
        
        hDC.EndPage()
        hDC.EndDoc()
        hDC.DeleteDC()
        print(" [SUCCESS] Physical print job sent to EPSON printer.")
        return True
    except Exception as e:
        print(f" Direct GDI error: {e}. Attempting shell fallback...")
        try:
            win32api.ShellExecute(0, "print", file_path, None, ".", 0)
            return True
        except Exception as shell_err:
            print(f" Shell print failed: {shell_err}")
            return False

def poll_and_print():
    while True:
        try:
            res = requests.get(f"{BACKEND_URL}/api/jobs/pending", timeout=5)
            if res.status_code == 200:
                jobs = res.json().get("jobs", [])
                
                for job in jobs:
                    job_id = job.get("id")
                    file_data = job.get("fileData")
                    file_name = job.get("fileName", "print_job.jpg")
                    copies = job.get("copies", 1)
                    
                    print(f"\n[JOB RECEIVED] Processing Job ID: {job_id}")
                    
                    temp_path = os.path.join(os.getcwd(), file_name)
                    if file_data and "," in file_data:
                        file_data = file_data.split(",")[1]
                    
                    if file_data:
                        with open(temp_path, "wb") as f:
                            f.write(base64.b64decode(file_data))
                        
                        for i in range(copies):
                            print(f" Printing Copy {i+1} of {copies}...")
                            print_image_direct(temp_path)
                            time.sleep(1)
                    
                    requests.post(f"{BACKEND_URL}/api/jobs/complete/{job_id}")
                    print(f" [COMPLETED] Job {job_id} removed from queue.")
                        
        except Exception as e:
            print(f"Polling error: {e}")

        time.sleep(3)

if __name__ == "__main__":
    poll_and_print()