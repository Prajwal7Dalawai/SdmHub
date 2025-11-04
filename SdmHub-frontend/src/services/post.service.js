import { apiService } from './api.service';

class PostService {
  async createPost(postData) {
    return apiService.post('/posts', postData);
  }

  async getPosts() {
    return apiService.get('/posts');
  }
}

export const postService = new PostService(); 