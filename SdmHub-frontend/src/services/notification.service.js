import axios from "axios";

const API = "http://localhost:3000/api/notifications";

export const notificationService = {
  // ✔ Get all notifications
  getNotifications() {
    return axios.get(API, { withCredentials: true });
  },

  // ✔ Mark 1 notification as read
  markAsRead(id) {
    return axios.post(`${API}/${id}/read`, {}, { withCredentials: true });
  },

  // ✔ Clear all notifications
  clearAll() {
    return axios.delete(`${API}/clear`, { withCredentials: true });
  }
};
