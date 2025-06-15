export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    TIMEOUT: import.meta.env.VITE_API_TIMEOUT || 5000,
    ENDPOINTS: {
        AUTH: {
            SIGNUP: '/auth/signup',
            LOGIN: '/auth/login',
            LOGOUT: '/auth/logout',
            EDIT_PROFILE: '/auth/editprofile'
        }
    }
}; 