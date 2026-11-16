// API Client - Secure JWT Communications with Backend & MongoDB
const TOKEN_KEY = 'tmh_jwt_token_v2';
const USER_KEY = 'tmh_user_profile_v2';

export const api = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  setAuth(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getCurrentUser() {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  updateCurrentUser(updates) {
    const user = this.getCurrentUser();
    if (user) {
      const updated = { ...user, ...updates };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    }
    return null;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`/api${endpoint}`, {
        ...options,
        headers
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Request failed with status ${res.status}`);
      }
      return data;
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err.message);
      throw err;
    }
  },

  // Auth
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) {
      this.setAuth(data.token, data.user);
    }
    return data;
  },

  async register(payload) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (data.token) {
      this.setAuth(data.token, data.user);
    }
    return data;
  },

  async changePassword(newPassword, confirmPassword) {
    const data = await this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword, confirmPassword })
    });
    this.updateCurrentUser({ mustChangePassword: false });
    return data;
  },

  async getMe() {
    const data = await this.request('/auth/me');
    if (data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
    return data.user;
  },

  async updateProfile(profilePayload) {
    const data = await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profilePayload)
    });
    if (data.user) {
      this.updateCurrentUser(data.user);
    }
    return data;
  },

  async getBrothers() {
    const data = await this.request('/auth/brothers');
    return data.brothers || [];
  },

  // Dynamic Cars Fleet
  async getCars() {
    const data = await this.request('/cars');
    return data.cars || [];
  },

  async createCar(carPayload) {
    const data = await this.request('/cars', {
      method: 'POST',
      body: JSON.stringify(carPayload)
    });
    return data.car;
  },

  async deleteCar(id) {
    return await this.request(`/cars/${id}`, {
      method: 'DELETE'
    });
  },

  // Trips (with Notes field)
  async getTrips() {
    const data = await this.request('/trips');
    return data.trips || [];
  },

  async createTrip(tripPayload) {
    const data = await this.request('/trips', {
      method: 'POST',
      body: JSON.stringify(tripPayload)
    });
    return data.trip;
  },

  async updateTrip(id, updates) {
    const data = await this.request(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return data.trip;
  },

  async deleteTrip(id) {
    return await this.request(`/trips/${id}`, {
      method: 'DELETE'
    });
  }
};
