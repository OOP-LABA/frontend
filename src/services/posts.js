import instance from '../axios.js';

export default class PostsService {
  static async postpost(title, content, category, file, goal, accountDetails){
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content ?? '');
    formData.append('category', category ?? '');
    formData.append('goal', String(goal ?? 0));
    formData.append('accountDetails', accountDetails ?? '');
    if (file) formData.append('image', file);

    return instance.post('posts', formData)
     .then(response => response.data);
  }
  static async getPosts(){
    return instance.get('posts')
     .then(response => response.data);
  }
  static async getPost(id){
    return instance.get(`posts/${id}`)
     .then(response => response.data);
  }
}
