const API_URL = "https://hungry-news-notice.loca.lt";

async function submitPrintJob() {
  // Grab your existing form inputs by their IDs
  const fileInput = document.getElementById('fileInput'); // Your file input ID
  const copiesInput = document.getElementById('copiesInput'); // Your copies input ID (optional)
  const colorInput = document.getElementById('colorInput'); // Your color checkbox/select (optional)

  if (!fileInput || !fileInput.files[0]) {
    alert("Please select a file to print!");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = async function (e) {
    const base64Data = e.target.result;

    // Collect settings from your original page setup
    const payload = {
      fileName: file.name,
      fileData: base64Data,
      copies: copiesInput ? parseInt(copiesInput.value) || 1 : 1,
      isColor: colorInput ? colorInput.checked : false
    };

    try {
      const res = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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