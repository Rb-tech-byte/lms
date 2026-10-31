/**
 * OUT LMS Gateway Bridge Server
 * Express entry point for token brokering, payment IPN webhooks, and Moodle CLI integration.
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'OUT LMS Gateway Bridge',
    moodleBackend: process.env.MOODLE_URL || 'http://localhost:8080/moodle',
    timestamp: new Date().toISOString(),
  });
});

// Auth Routes Placeholder
app.post('/api/auth/login', (req, res) => {
  // Exchange credentials for Moodle Token
  res.json({ status: 'OK', message: 'Auth endpoint ready' });
});

// Pesapal & Selcom Payment Order & Webhook Routes
app.post('/api/payment/create-order', (req, res) => {
  const { courseId, amount, gateway, phoneNumber } = req.body;
  const orderId = `OUT-ORD-${Date.now().toString().slice(-6)}`;
  res.json({
    orderId,
    status: 'PENDING',
    amount,
    gateway,
    message: `Order initiated via ${gateway}. Waiting for payment.`,
  });
});

app.post('/api/payment/pesapal/ipn', (req, res) => {
  console.log('Received Pesapal IPN webhook:', req.body);
  // Auto-enrol user in Moodle
  res.json({ status: 'ACKNOWLEDGED' });
});

app.post('/api/payment/selcom/webhook', (req, res) => {
  console.log('Received Selcom Webhook:', req.body);
  // Auto-enrol user in Moodle
  res.json({ status: 'ACKNOWLEDGED' });
});

app.get('/api/payment/status/:orderId', (req, res) => {
  res.json({ orderId: req.params.orderId, status: 'COMPLETED' });
});

app.listen(PORT, () => {
  console.log(`OUT LMS Gateway Bridge running on http://localhost:${PORT}`);
});
