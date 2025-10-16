const API_BASE_URL = 'http://127.0.0.1:8000';

class ApiService {
  // -------------------- AUTHENTICATION --------------------
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error((await response.json()).detail || 'Registration failed');
      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) throw new Error((await response.json()).detail || 'Login failed');
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getUserProfile() {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error((await response.json()).detail || 'Failed to fetch profile');
      return await response.json();
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
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

  // -------------------- IMAGE UPLOAD --------------------
  async uploadImage(file) {
    try {
      const token = localStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${API_BASE_URL}/shoutouts/upload-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // Do NOT set Content-Type for FormData
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Image upload failed");
      }

      const data = await response.json();
      return data.image_url;
    } catch (err) {
      console.error("Image upload error:", err);
      throw err;
    }
  }

  // -------------------- SHOUTOUTS --------------------
  async createShoutout({ title, message, receiver_id, tagged_user_ids = [], category, is_public, imageFile }) {
    try {
      const token = localStorage.getItem("access_token");

      // Upload image if provided
      let image_url = null;
      if (imageFile) {
        image_url = await this.uploadImage(imageFile);
      }

      // JSON payload for /create endpoint
      const payload = { title, message, receiver_id, tagged_user_ids, category, is_public };
      if (image_url) payload.image_url = image_url;

      const response = await fetch(`${API_BASE_URL}/shoutouts/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create shoutout");
      }

      return await response.json();
    } catch (error) {
      console.error("Create shoutout error:", error);
      throw error;
    }
  }

  async getShoutouts(department = 'all', skip = 0, limit = 10) {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_BASE_URL}/shoutouts/feed?department=${department}&skip=${skip}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error((await response.json()).detail || 'Failed to fetch shoutouts');
    return await response.json();
  }

  async getMyShoutouts(type = 'all') {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_BASE_URL}/shoutouts/my-shoutouts?type=${type}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error((await response.json()).detail || 'Failed to fetch my shoutouts');
    return await response.json();
  }

  async searchUsers(department = 'all', search = '') {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_BASE_URL}/shoutouts/users/search?department=${department}&search=${search}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error((await response.json()).detail || 'Failed to search users');
    return await response.json();
  }

  // -------------------- REACTIONS & COMMENTS --------------------
  async addReaction(shoutout_id, type) {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${API_BASE_URL}/shoutouts/${shoutout_id}/reactions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    if (!res.ok) throw new Error("Failed to add reaction");
    return await res.json();
  }

  async removeReaction(shoutout_id, type) {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${API_BASE_URL}/shoutouts/${shoutout_id}/reactions`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    if (!res.ok) throw new Error("Failed to remove reaction");
    return await res.json();
  }

  async addComment(shoutout_id, comment) {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${API_BASE_URL}/shoutouts/${shoutout_id}/comments`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ comment }),
    });
    if (!res.ok) throw new Error("Failed to add comment");
    return await res.json();
  }

  async deleteComment(comment_id) {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${API_BASE_URL}/shoutouts/comments/${comment_id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete comment");
    return await res.json();
  }

  async getDashboardStats() {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${API_BASE_URL}/shoutouts/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch dashboard stats");
    return await res.json();
  }
  
}

export default new ApiService();
