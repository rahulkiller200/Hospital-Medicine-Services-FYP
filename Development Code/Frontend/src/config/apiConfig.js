/**
 * API Configuration
 * Consolidates all backend endpoints for easy deployment switching.
 */

const isProduction = import.meta.env.PROD;

// In production, this should be your deployed backend URL (e.g., https://your-hms-api.render.com)
// In development, it defaults to your local server.
export const API_BASE_URL = isProduction 
  ? import.meta.env.VITE_API_URL || 'https://hospital-medicine-services-api.onrender.com' 
  : 'http://localhost:3001';

export const API_V1_URL = `${API_BASE_URL}/api/v1`;

export default {
  API_BASE_URL,
  API_V1_URL,
};
