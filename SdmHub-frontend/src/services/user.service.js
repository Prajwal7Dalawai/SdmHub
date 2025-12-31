import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';

class UserService {
  async getChatList() {
      const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      throw new Error("User not found in localStorage");
    }

    const userid = user.id;
    try {
      console.log("user id: ",userid);
      const response = await apiService.get(
        `${API_CONFIG.BASE_URL}/api/messages/chat-list`
      );
      return response.data; // return list of users
    } catch (error) {
      console.error("Error fetching chat list:", error);
      throw error;
    }
  }

  async getTechNews(){
    try {
      const response = await apiService.get(`${API_CONFIG.BASE_URL}/api/news/tech`);
      return response.data;
    } catch(err) {
      console.error("Error fetching news(from frontend).");
      throw err;
    }
  }

}

export const userService = new UserService();