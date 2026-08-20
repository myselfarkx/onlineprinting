const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { generatePrintReadyPDF } = require('../services/pdfBuilder');

router.post('/', express.json(), async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
  if (secret) {
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== req.headers['x-razorpay-signature']) {
      return res.status(400).json({ status: 'failure', reason: 'Invalid signature' });
    }
  }

  const event = req.body.event;
  if (event === 'order.paid' || event === 'payment.captured') {
    const paymentData = req.body.payload.payment.entity;
    const orderId = paymentData.order_id;

    if (global.printJobs[orderId]) {
      global.printJobs[orderId].status = 'PAID';
      await generatePrintReadyPDF(orderId);
      console.log(`Print job ready for Order ID: ${orderId}`);
    }
  }

  res.status(200).json({ status: 'ok' });
});

module.exports = router;