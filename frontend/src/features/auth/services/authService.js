import api from '../../../core/services/api';

const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/signin', { email, password });
    if (response.data.token) {
      localStorage.setItem('zoo_token', response.data.token);
      localStorage.setItem('zoo_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  signup: async (fullName, email, password, mobileNumber) => {
    const response = await api.post('/auth/signup', {
      fullName,
      email,
      password,
      mobileNumber,
      roles: ['user'],
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('zoo_token');
    localStorage.removeItem('zoo_user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('zoo_user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('zoo_token');
  },

  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.roles?.includes('ROLE_ADMIN') || false;
  },
};

export default authService;
