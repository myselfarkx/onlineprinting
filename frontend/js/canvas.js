// Initialize Fabric.js Canvas with A4 sheet proportions
const canvas = new fabric.Canvas('printCanvas', {
  backgroundColor: '#ffffff',
  selection: true
});

let uploadedImageObject = null;

// Handle image upload and scale to fit nicely on page load
document.getElementById('fileUpload').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    fabric.Image.fromURL(event.target.result, function (img) {
      // Clear previous uploads
      canvas.clear();
      canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));

      // Scale down image if larger than canvas
      if (img.width > canvas.width || img.height > canvas.height) {
        img.scaleToWidth(canvas.width * 0.8);
      }

      uploadedImageObject = img;
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.centerObject(img);
      canvas.renderAll();
    });
  };
  reader.readAsDataURL(file);
});

// Function to extract placement values for backend scaling
function getCanvasData() {
  if (!uploadedImageObject) return null;

  return {
    x: uploadedImageObject.left,
    y: uploadedImageObject.top,
    scaleX: uploadedImageObject.scaleX,
    scaleY: uploadedImageObject.scaleY,
    angle: uploadedImageObject.angle,
    width: uploadedImageObject.width,
    height: uploadedImageObject.height,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height
  };
}