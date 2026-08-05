import { Router } from 'express';

const router = Router();
const SUCCESS_CARD_NUMBER = '4242424242424242';
const FAILURE_CARD_NUMBER = '4000000000000002';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

router.post('/simulate', async (request, response) => {
  try {
    const normalizedCardNumber = String(request.body?.cardNumber || '')
      .replace(/\s+/g, '')
      .trim();

    if (!normalizedCardNumber) {
      return response.status(400).json({ success: false, message: 'cardNumber is required' });
    }

    // Simulate processing delay
    await delay(1000);

    if (normalizedCardNumber === SUCCESS_CARD_NUMBER) {
      return response.json({ success: true, message: 'Payment succeeded.' });
    }

    if (normalizedCardNumber === FAILURE_CARD_NUMBER) {
      return response.status(402).json({ success: false, message: 'Payment declined.' });
    }

    return response.status(402).json({ success: false, message: 'Payment declined.' });
  } catch (err) {
    // Log unexpected errors for easier debugging while keeping response generic
    // eslint-disable-next-line no-console
    console.error('Payment simulation error:', err?.stack || err);
    return response.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;