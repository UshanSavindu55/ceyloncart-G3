import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productsRouter from './routes/products.js';
import paymentRouter from './routes/payment.js';
import ordersRouter from './routes/orders.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
  }),
);
app.use(express.json());

app.get('/api/health', (request, response) => {
  response.json({
    status: 'ok',
    service: 'CeylonCart API',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/products', productsRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/orders', ordersRouter);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`CeylonCart API listening on port ${port}`);
});
