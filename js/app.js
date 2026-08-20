const API_URL = "https://cornball-marshy-refusal.ngrok-free.dev";

async function submitPrintJob() {
  const fileInput = document.getElementById('fileInput');
  const copiesInput = document.getElementById('copiesInput');
  const colorInput = document.getElementById('colorInput');

  if (!fileInput || !fileInput.files[0]) {
    alert("Please select a file to print!");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = async function (e) {
    const base64Data = e.target.result;

    const payload = {
      fileName: file.name,
      fileData: base64Data,
      copies: copiesInput ? parseInt(copiesInput.value) || 1 : 1,
      isColor: colorInput ? colorInput.checked : false
    };

    try {
      const res = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Payment successful! Job sent to printer queue.");
      } else {
        alert(`Server error (${res.status}). Make sure backend was restarted.`);
      }
    } catch (err) {
      alert("Cannot connect to server. Ensure 'node server.js' is running.");
    }
  };

  reader.readAsDataURL(file);
}