// API service for BragBoard (authentication + shoutouts)
const API_BASE_URL = 'http://127.0.0.1:8000';

class ApiService {
  // -------------------- AUTHENTICATION --------------------
  async register(userData) {
    try {
      console.log('Attempting registration with data:', userData);
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const result = await response.json();
      console.log('Registration successful:', result);
      return result;
    } catch (error) {
      console.error('Registration fetch error:', error);
      throw new Error(error.message || 'Network error during registration');
    }
  }

  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const result = await response.json();
      console.log('Login successful:', result);
      return result;
    } catch (error) {
      console.error('Login fetch error:', error);
      throw new Error(error.message || 'Network error during login');
    }
  }

  async getUserProfile() {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch user profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw new Error(error.message || 'Network error during profile fetch');
    }
  }

  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) throw new Error('Server health check failed');
      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      throw new Error('Cannot connect to server');
    }
  }

  // -------------------- SHOUTOUTS --------------------

  async getShoutouts(department = 'all', skip = 0, limit = 10) {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_BASE_URL}/shoutouts/feed?department=${department}&skip=${skip}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch shoutouts');
      }

      return await response.json();
    } catch (error) {
      console.error('Get shoutouts error:', error);
      throw new Error(error.message || 'Network error during fetching shoutouts');
    }
  }

  async createShoutout({ title, message, receiver_id, tagged_user_ids = [], category, is_public }) {
    try {
      const token = localStorage.getItem('access_token');
      const payload = { title, message, receiver_id, tagged_user_ids, category, is_public };

      console.log('Creating shoutout with data:', payload);

      const response = await fetch(`${API_BASE_URL}/shoutouts/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create shoutout');
      }

      const result = await response.json();
      console.log('Shoutout created successfully:', result);
      return result;
    } catch (error) {
      console.error('Create shoutout error:', error);
      throw new Error(error.message || 'Network error during shoutout creation');
    }
  }

  async getMyShoutouts(type = 'all') {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/shoutouts/my-shoutouts?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch my shoutouts');
      }

      return await response.json();
    } catch (error) {
      console.error('Get my shoutouts error:', error);
      throw new Error(error.message || 'Network error during fetching my shoutouts');
    }
  }

  async searchUsers(department = 'all', search = '') {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_BASE_URL}/shoutouts/users/search?department=${department}&search=${search}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to search users');
      }

      return await response.json();
    } catch (error) {
      console.error('Search users error:', error);
      throw new Error(error.message || 'Network error during user search');
    }
  }
  
  async getAllUsers() {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return await response.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  }
  
}

export default new ApiService();
