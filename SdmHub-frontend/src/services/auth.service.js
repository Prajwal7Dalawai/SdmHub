import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';

class AuthService {
    async signup(userData) {
        return apiService.post(API_CONFIG.ENDPOINTS.AUTH.SIGNUP, userData);
    }

    async login(credentials) {
        return apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
    }

    async logout() {
        return apiService.get(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    }

    async editProfile(profileData) {
        return apiService.post(API_CONFIG.ENDPOINTS.AUTH.EDIT_PROFILE, profileData);
    }

    async getProfile() {
        return apiService.get('/auth/profile');
    }
}

export const authService = new AuthService(); 