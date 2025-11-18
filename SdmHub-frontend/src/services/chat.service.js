import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';

class ChatService{
    async getMessages(reciverId){
        try {
          const response = await apiService.get(
            `${API_CONFIG.BASE_URL}/api/messages/get/${reciverId}`
          );
          return response.data; // return list of users
        } catch (error) {
          console.error("Error fetching chat list:", error);
          throw error;
        }
      }

      async deleteMessage(msgId){
        try{
          await  apiService.delete(`${API_CONFIG.BASE_URL}/api/messages/deleteOne/${msgId}`);
        } catch(err){
          console.error("Error Deleting message", err);
          throw err;
        }
      }

      async sendMessage(payload) {
  try {
    console.log("Payload:", payload);
    const res = await apiService.post(
      `${API_CONFIG.BASE_URL}/api/messages/send`,
      payload   // <-- THIS. Not { payload }
    );
    return res.data;
  } catch (err) {
    console.error("Error sending the sendmessage request", err);
    throw err;
  }
}

}

export const chatService = new ChatService();