const express = require('express');
const router = express.Router();

let jobsQueue = [];

// Endpoint to queue job from frontend after payment
router.post('/create-paid-job', (req, res) => {
  const { orderId, amount, copies, isColor, layout } = req.body;
  const newJob = {
    id: 'job_' + Date.now(),
    orderId,
    amount,
    copies,
    isColor,
    layout,
    status: 'pending',
    createdAt: new Date()
  };
  jobsQueue.push(newJob);
  console.log('--> [SUCCESS] New print job queued:', newJob.id);
  res.json({ success: true, job: newJob });
});

// Endpoint polled by Python agent.py
router.get('/pending', (req, res) => {
  const pendingJobs = jobsQueue.filter(j => j.status === 'pending');
  res.json({ jobs: pendingJobs });
});

// Endpoint called by agent.py when printing is done
router.post('/complete/:id', (req, res) => {
  const job = jobsQueue.find(j => j.id === req.params.id);
  if (job) job.status = 'completed';
  console.log(`--> [COMPLETED] Job ${req.params.id} marked complete.`);
  res.json({ success: true });
});

module.exports = router;