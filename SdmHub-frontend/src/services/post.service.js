import { apiService } from './api.service';

class PostService {

  // ----------------------
  // CREATE POST
  // ----------------------
  async createPost(postData) {
    return apiService.post('/posts', postData);
  }

  // ----------------------
  // GET FEED POSTS
  // ----------------------
  async getPosts() {
    return apiService.get('/posts');
  }

  // ----------------------
  // LIKE / UNLIKE
  // ----------------------
  async likePost(postId) {
    return apiService.post(`/posts/like/${postId}`);
  }

  // ----------------------
  // COMMENT
  // ----------------------
  async commentPost(postId, content) {
    return apiService.post(`/posts/comment/${postId}`, { content });
  }
  deleteComment(commentId) {
  return axios.delete(`/posts/comment/${commentId}`, {
    withCredentials: true
  });
}


  // ----------------------
  // GET ALL COMMENTS
  // ----------------------
  async getAllComments(postId) {
    return apiService.get(`/posts/comments/${postId}`);
  }

  // ----------------------
  // 🔁 LINKEDIN STYLE REPOST (NEW)
  // ----------------------
  async repostPost(postId, caption = "") {
    return apiService.post(`/posts/repost/${postId}`, { caption });
  }

  getSinglePost(postId) {
  return apiService.get(`/posts/${postId}`);
}


}

export const postService = new PostService();
