const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const AUTH_TOKEN_STORAGE_KEY = 'ceyloncart-auth-token';

function getStoredAuthToken() {
  try {
    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    }
  } catch {
    // Ignore storage failures.
  }
}

export function clearAuthToken() {
  try {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

async function request(path, options = {}) {
  const token = getStoredAuthToken();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

export async function fetchOrders() {
  return request('/api/orders');
}

export async function loginUser(credentials = {}) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function registerUser(registration = {}) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(registration),
  });
}

export async function fetchCurrentUser() {
  return request('/api/auth/me');
}