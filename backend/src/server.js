const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
// Increased body limit to handle image and PDF file uploads
app.use(express.json({ limit: '50mb' }));

let pendingJobs = [];

// Get queued jobs (Polled by Python agent)
app.get('/api/jobs/pending', (req, res) => {
  res.json({ jobs: pendingJobs });
});

// Receive job from frontend
app.post('/api/jobs', (req, res) => {
  const { fileName, fileData, copies, isColor, pageSize } = req.body;
  
  const newJob = {
    id: 'job_' + Date.now(),
    fileName: fileName || 'document.png',
    fileData: fileData || null,
    copies: copies || 1,
    isColor: isColor || false,
    pageSize: pageSize || 'A4'
  };

  pendingJobs.push(newJob);
  console.log(`[JOB QUEUED] ${newJob.fileName} (${newJob.copies} copies)`);
  res.status(201).json({ success: true, job: newJob });
});

// Clear completed job (Called by Python agent)
app.post('/api/jobs/complete/:id', (req, res) => {
  const { id } = req.params;
  pendingJobs = pendingJobs.filter(job => job.id !== id);
  res.json({ success: true });
});

app.listen(5000, () => {
  console.log('Server running on http://127.0.0.1:5000');
});