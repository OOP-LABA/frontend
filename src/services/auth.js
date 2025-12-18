import instance from '../axios.js';

export default class AuthService {
  static async login(username, password) {
    return instance.post('auth/login', { username, password })
      .then(response => response.data);
  }

  static async register(username, password, email, firstName, secondName, city) {
    return instance.post('auth/register', { username, password, email, firstName, secondName, city })
      .then(response => response.data);
  }


}
