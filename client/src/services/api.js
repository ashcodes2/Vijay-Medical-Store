const rawApi = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const cleanApi = rawApi.replace(/\/+$/, '');
const API_URL = cleanApi.endsWith('/api') ? cleanApi : `${cleanApi}/api`;

// --- Helper to make API requests ---
// Wraps fetch() so we don't repeat headers/error-handling in every component.
const apiRequest = async (endpoint, options = {}) => {
  const { method = 'GET', body, token } = options;

  const headers = { 'Content-Type': 'application/json' };

  // If a token is provided, attach it as a Bearer token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  // If the server returned an error status, throw it so the caller can catch it
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// --- Convenience functions for each API call we need ---

// Orders
export const createOrder = (orderData) => {
  return apiRequest('/orders', { method: 'POST', body: orderData });
};

// Admin auth
export const adminLogin = (credentials) => {
  return apiRequest('/admin/login', { method: 'POST', body: credentials });
};

// Products (admin)
export const getProducts = () => apiRequest('/products');

export const createProduct = (productData, token) => {
  return apiRequest('/products', { method: 'POST', body: productData, token });
};

export const updateProduct = (id, productData, token) => {
  return apiRequest(`/products/${id}`, { method: 'PUT', body: productData, token });
};

export const deleteProduct = (id, token) => {
  return apiRequest(`/products/${id}`, { method: 'DELETE', token });
};

// Orders (admin)
export const getOrders = (token) => {
  return apiRequest('/orders', { method: 'GET', token });
};

export const updateOrderStatus = (id, status, token) => {
  return apiRequest(`/orders/${id}/status`, { method: 'PUT', body: { status }, token });
};

// Categories (admin)
export const getCategories = () => apiRequest('/categories');

export const createCategory = (data, token) => {
  return apiRequest('/categories', { method: 'POST', body: data, token });
};

export const deleteCategory = (id, token) => {
  return apiRequest(`/categories/${id}`, { method: 'DELETE', token });
};
