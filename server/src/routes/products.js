import { Router } from 'express';
import { products } from '../../data/products.js';

const router = Router();

router.get('/', (request, response) => {
  response.json(products);
});

router.get('/:id', (request, response, next) => {
  const productId = Number(request.params.id);

  if (Number.isNaN(productId)) {
    const error = new Error('Product id must be a number');
    error.status = 400;
    return next(error);
  }

  const product = products.find((item) => item.id === productId);

  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    return next(error);
  }

  response.json(product);
});

export default router;