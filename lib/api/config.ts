export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const API_ROUTES = {
  AUTH: {
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    VERIFY_CODE: '/api/auth/verify-code',
    RESET_PASSWORD: '/api/auth/reset-password',
    RESEND_CODE: '/api/auth/resend-code',
  },
  PRODUCTS: {
    LIST: '/api/products',
    IBU_DATA: '/api/ibudata-full',
  },
} as const;

// Helper function to build full API URLs when needed
export const buildApiUrl = (path: string) => {
  return `${API_BASE_URL}${path}`;
};
