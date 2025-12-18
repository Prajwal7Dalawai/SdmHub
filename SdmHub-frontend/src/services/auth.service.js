import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import axios from "axios";


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
    return apiService.get( `${import.meta.env.VITE_API_BASE_URL}/auth/profile`);
}

async googleLogin() {
    try {
        const result = await signInWithPopup(auth, googleProvider);

        const user = result.user;
        const idToken = await user.getIdToken();

        // 🔥 Send token to backend
        const res = await axios.post(
            "http://localhost:3000/auth/google",
            { idToken },
            { withCredentials: true }
        );
        return res;

    } catch (err) {
        console.error("Google login failed", err);
    }
}
}

export const authService = new AuthService(); 