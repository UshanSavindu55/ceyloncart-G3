import { Router } from 'express';

const router = Router();
const SUCCESS_CARD_NUMBER = '4242424242424242';
const FAILURE_CARD_NUMBER = '4000000000000002';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

router.post('/simulate', async (request, response) => {
  const normalizedCardNumber = String(request.body?.cardNumber || '')
    .replace(/\s+/g, '')
    .trim();

  await delay(1000);

  if (normalizedCardNumber === SUCCESS_CARD_NUMBER) {
    return response.json({
      success: true,
      message: 'Payment succeeded.',
    });
  }

  if (normalizedCardNumber === FAILURE_CARD_NUMBER) {
    return response.json({
      success: false,
      message: 'Payment failed.',
    });
  }

  return response.json({
    success: false,
    message: 'Payment failed.',
  });
});

export default router;