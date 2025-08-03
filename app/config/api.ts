// app/config/api.ts
// Configuración centralizada de la API

// URL base del servidor - Actualiza esta URL cuando cambies ngrok
export const API_CONFIG = {
  // URL actual de ngrok - actualiza cuando reinicies ngrok
  BASE_URL: 'https://2667b7e4b7b2.ngrok-free.app',

  // Headers comunes para todas las peticiones
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Necesario para ngrok
  },

  // Endpoints específicos
  ENDPOINTS: {
    HEALTH: '/health',
    ORDERS: '/api/orders',
    PAYMENTS_CREATE: '/api/payments/create',
    SIMPLE_PRODUCTS: '/api/simple-products',
    AUTH_LOGIN: '/api/auth/login',
    AUTH_PROFILE: '/api/auth/profile',
  },
};

// Función helper para crear URLs completas
export const createApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Función helper para crear headers con autenticación
export const createAuthHeaders = (token: string | null = null): Record<string, string> => {
  const headers: Record<string, string> = { ...API_CONFIG.DEFAULT_HEADERS };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};