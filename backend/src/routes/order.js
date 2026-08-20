const express = require('express');
const router = express.Router();

router.post('/create', async (req, res) => {
  console.log("--> Received order request on /api/order/create");

  try {
    const { totalAmount } = req.body || {};
    const amount = Number(totalAmount) || 10;
    const razorpayOrderId = 'order_mock_' + Date.now();

    return res.status(200).json({
      success: true,
      orderId: razorpayOrderId,
      amount: amount,
      keyId: 'rzp_test_dummykey123'
    });
  } catch (err) {
    console.error('CRITICAL ERROR in /api/order/create:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal Server Error'
    });
  }
});

module.exports = router;