import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Adjust if your backend runs on a different port/URL

const apiService = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for sending cookies/sessions
});

// Add request interceptor to include JWT token
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Navigate to error page with details
      window.location.href = `/error?state=${encodeURIComponent(JSON.stringify({
        title: 'Authentication Required',
        message: 'Please log in to access this page.',
        code: 'AUTH_401',
        type: 'auth'
      }))}`;
    } else if (error.response?.status === 403) {
      window.location.href = `/error?state=${encodeURIComponent(JSON.stringify({
        title: 'Access Denied',
        message: 'You do not have permission to access this resource.',
        code: 'ACCESS_403',
        type: 'access'
      }))}`;
    } else if (error.response?.status === 404) {
      window.location.href = `/error?state=${encodeURIComponent(JSON.stringify({
        title: 'Page Not Found',
        message: 'The page you are looking for does not exist.',
        code: 'NOT_FOUND_404',
        type: 'notFound'
      }))}`;
    } else if (error.response?.status >= 500) {
      window.location.href = `/error?state=${encodeURIComponent(JSON.stringify({
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again later.',
        code: 'SERVER_500',
        type: 'server'
      }))}`;
    }
    return Promise.reject(error);
  }
);

const uploadService = {
  uploadProfilePic: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiService.post('/upload/profile-pic', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadPostImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiService.post('/upload/post-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

apiService.updateProfilePic = (profile_pic, profile_pic_public_id) => {
  return apiService.post('/auth/update-profile-pic', {
    profile_pic,
    profile_pic_public_id
  });
};

export { apiService, uploadService }; 