import { apiService } from './api.service';

class PostService {

  // Create a new post
  async createPost(postData) {
    return apiService.post('/posts', postData);
  }

  // Get all posts
  async getPosts() {
    return apiService.get('/posts');
  }

  // ---------------------------------------
  // 🔥 NEW METHODS ADDED (like, comment, share)
  // ---------------------------------------

  // Like or unlike a post
  async likePost(postId) {
    return apiService.post(`/posts/like/${postId}`);
  }

  // Add a comment
  async commentPost(postId, content) {
    return apiService.post(`/posts/comment/${postId}`, { content });
  }
  deleteComment(commentId) {
  return axios.delete(`/posts/comment/${commentId}`, {
    withCredentials: true
  });
}


  // Share a post
  async sharePost(postId) {
    return apiService.post(`/posts/share/${postId}`);
  }

  getAllComments(postId) {
  return apiService.get(`/posts/comments/${postId}`);
}

}

export const postService = new PostService();
