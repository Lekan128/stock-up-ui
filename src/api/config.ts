const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// const AUTH_BASE = `${BASE_URL.replace("/api", "")}/auth`;

export const endpoints = {
  register: `${BASE_URL}/auth/register`,
  login: `${BASE_URL}/auth/login`,
  refresh: `${BASE_URL}/auth/refresh-token`,
  base: `${BASE_URL}`,
  // Add other API endpoints here when needed
  // categories: `${BASE_URL}/categories`,
  // products: `${BASE_URL}/products`,
};
