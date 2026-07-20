import { randomUUID } from 'crypto';
import { Router } from 'express';
import { orders } from '../../data/orders.js';

const router = Router();

function createValidationError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw createValidationError('Cart items are required.');
  }

  const hasValidItems = items.every((item) => {
    return (
      item &&
      typeof item === 'object' &&
      item.id !== undefined &&
      item.name &&
      Number.isFinite(Number(item.price)) &&
      Number.isFinite(Number(item.quantity))
    );
  });

  if (!hasValidItems) {
    throw createValidationError('Cart items are invalid.');
  }

  return items;
}

function normalizeCustomer(customer) {
  if (!customer || typeof customer !== 'object') {
    throw createValidationError('Customer information is required.');
  }

  const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'postalCode'];
  const hasAllFields = requiredFields.every((fieldName) => typeof customer[fieldName] === 'string' && customer[fieldName].trim());

  if (!hasAllFields) {
    throw createValidationError('Customer information is incomplete.');
  }

  return customer;
}

router.get('/', (request, response) => {
  response.json(orders);
});

router.post('/', (request, response, next) => {
  try {
    const customer = normalizeCustomer(request.body?.customer);
    const items = normalizeItems(request.body?.items);
    const total = Number(request.body?.total);

    if (!Number.isFinite(total)) {
      throw createValidationError('Order total is required.');
    }

    const order = {
      orderId: randomUUID(),
      customer,
      items,
      total,
      date: new Date().toISOString(),
      paymentStatus: request.body?.paymentStatus || 'pending',
    };

    orders.push(order);
    response.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

export default router;