const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message = data?.error?.message || data?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getApiBaseUrl() {
  return apiBaseUrl;
}

export async function fetchAllProducts() {
  return request('/api/products');
}

export async function fetchProductById(id) {
  if (id === undefined || id === null || id === '') {
    throw new Error('A product id is required.');
  }

  return request(`/api/products/${id}`);
}

export async function simulatePayment(paymentDetails = {}) {
  return request('/api/payment/simulate', {
    method: 'POST',
    body: JSON.stringify(paymentDetails),
  });
}

export async function createOrder(orderDetails = {}) {
  return request('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderDetails),
  });
}