import sys
import os
import subprocess

def send_to_printer(file_path, copies=1):
    """
    Routes a PDF file directly to the default OS printer spooler.
    Works natively on Windows (via pywin32) and macOS/Linux (via CUPS lpr).
    """
    if not os.path.exists(file_path):
        print(f"[Error] Target file does not exist: {file_path}")
        return False

    try:
        # Windows OS Execution
        if sys.platform.startswith('win32'):
            import win32api
            import win32print

            default_printer = win32print.GetDefaultPrinter()
            print(f"[Printer] Sending to Windows Default Printer: {default_printer}")

            for _ in range(copies):
                win32api.ShellExecute(
                    0,
                    "print",
                    file_path,
                    f'/d:"{default_printer}"',
                    ".",
                    0
                )
            return True

        # macOS / Linux CUPS Execution
        elif sys.platform.startswith('darwin') or sys.platform.startswith('linux'):
            print(f"[Printer] Sending to CUPS spooler via lpr...")
            cmd = ["lpr", "-#", str(copies), file_path]
            subprocess.run(cmd, check=True)
            return True

        else:
            print(f"[Error] Unsupported operating system: {sys.platform}")
            return False

    except Exception as e:
        print(f"[Printer Error] Could not send to spooler: {e}")
        return False