import os

# Backend server address and polling frequency
BACKEND_URL = "http://localhost:5000"
POLL_INTERVAL_SECONDS = 5

# Local directory where downloaded PDFs are stored before printing
DOWNLOAD_DIR = os.path.join(os.path.dirname(__file__), "temp_downloads")

# Create directory automatically if it doesn't exist
os.makedirs(DOWNLOAD_DIR, exist_ok=True)