import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';

class ChatService{
    async getMessages(conversationId){
        try {
          const response = await apiService.get(
            `${API_CONFIG.BASE_URL}/api/messages/get/${conversationId}`
          );
          return response.data; // return list of users
        } catch (error) {
          console.error("Error fetching chat list:", error);
          throw error;
        }
      }

      async deleteMessage(msgId){
        try{
          console.log("Delete msg id:",msgId);
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
      
    async createGroup(payload){
      try{
        console.log("Group details:", payload);
        const res = await apiService.post(`${API_CONFIG.BASE_URL}/api/group/create`,payload, {withCredentials: true});
        return res.data;
      }
      catch(err){
        console.error("Error sending the sendmessage request", err);
            throw err;
      }
    }

   async getGroupMessages(conversationId) {
    const res = await apiService.get(`${API_CONFIG.BASE_URL}/api/group/messages/${conversationId}`);
    return res.data;
  }

  async sendGroupMessage({ conversationId, message }) {
    const res = await apiService.post(`${API_CONFIG.BASE_URL}/api/group/send`, {
      conversationId,
      message,
    });
    return res.data;
  }

  async startDM(otherUserId) {
  const res = await apiService.post(
    `${API_CONFIG.BASE_URL}/api/messages/dm/start`,
    { otherUserId }
  );
  return res.data;
}

      

}

export const chatService = new ChatService();