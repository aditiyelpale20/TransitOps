import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('transitops_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('transitops_token');
      localStorage.removeItem('transitops_user');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

const handleError = (err) => {
  const detail = err?.response?.data?.detail || err?.message || 'Request failed';
  throw { response: { data: { detail } } };
};

export const authAPI = {
  login: async (email, password) => {
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await API.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      handleError(err);
    }
  },
  register: async (payload) => {
    try {
      const response = await API.post('/auth/register', payload);
      return response.data;
    } catch (err) {
      handleError(err);
    }
  },
  getMe: async () => {
    try {
      const response = await API.get('/users/me');
      return response.data;
    } catch (err) {
      handleError(err);
    }
  }
};

export const usersAPI = {
  list: async (params = {}) => {
    try {
      const response = await API.get('/users', { params });
      return response.data;
    } catch (err) {
      handleError(err);
    }
  },
  delete: async (id) => {
    try {
      await API.delete(`/users/${id}`);
      return { success: true };
    } catch (err) {
      handleError(err);
    }
  }
};

export const vehiclesAPI = {
  list: async (params = {}) => {
    try {
      const response = await API.get('/vehicles', { params });
      return response.data;
    } catch (err) {
      handleError(err);
    }
  },
  get: async (id) => {
    try {
      const response = await API.get(`/vehicles/${id}`);
      return response.data;
    } catch (err) {
      handleError(err);
    }
  },
  create: async (data) => {
    try {
      const response = await API.post('/vehicles', data);
      return response.data;
    } catch (err) {
      handleError(err);
    }
  },
  update: async (id, data) => {
    try {
      const response = await API.put(`/vehicles/${id}`, data);
      return response.data;
    } catch (err) {
      handleError(err);
    }
  },
  delete: async (id) => {
    try {
      await API.delete(`/vehicles/${id}`);
      return { success: true };
    } catch (err) {
      handleError(err);
    }
  }
};

export const driversAPI = {
  list: async (params = {}) => {
    try {
      const response = await API.get('/drivers', { params });
      return response.data;
    } catch (err) {
      handleError(err);
    }
  },
  create: async (data) => {
    try {
      const response = await API.post('/drivers', data);
      return response.data;
    } catch (err) {
      handleError(err);
    }
  },
  update: async (id, data) => {
    try {
      const response = await API.put(`/drivers/${id}`, data);
      return response.data;
    } catch (err) {
      handleError(err);
    }
  },
  delete: async (id) => {
    try {
      await API.delete(`/drivers/${id}`);
      return { success: true };
    } catch (err) {
      handleError(err);
    }
  }
};

export const tripsAPI = {
  list: async (params = {}) => {
    try {
      const response = await API.get('/trips', { params });
      return response.data;
    } catch (err) {
      handleError(err);
    }
  },
  create: async (data) => {
    try {
      const response = await API.post('/trips', data);
      return response.data;
    } catch (err) {
      handleError(err);
    }
  },
  update: async (id, data) => {
    try {
      const response = await API.put(`/trips/${id}`, data);
      return response.data;
    } catch (err) {
      handleError(err);
    }
  },
  delete: async (id) => {
    try {
      await API.delete(`/trips/${id}`);
      return { success: true };
    } catch (err) {
      handleError(err);
    }
  },
  getTelemetry: async (id) => {
    try {
      const response = await API.get(`/trips/${id}/telemetry`);
      return response.data;
    } catch (err) {
      handleError(err);
    }
  }
};

export const maintenanceAPI = {
  list: async (params = {}) => {
    try {
      const response = await API.get('/maintenance', { params });
      return response.data;
    } catch (err) {
      handleError(err);
    }
  },
  create: async (data) => {
    try {
      const response = await API.post('/maintenance', data);
      return response.data;
    } catch (err) {
      handleError(err);
    }
  },
  update: async (id, data) => {
    try {
      const response = await API.put(`/maintenance/${id}`, data);
      return response.data;
    } catch (err) {
      handleError(err);
    }
  },
  delete: async (id) => {
    try {
      await API.delete(`/maintenance/${id}`);
      return { success: true };
    } catch (err) {
      handleError(err);
    }
  }
};

export const fuelAPI = {
  list: async () => {
    try {
      const response = await API.get('/fuel-logs');
      return response.data;
    } catch (err) {
      handleError(err);
    }
  },
  create: async (data) => {
    try {
      const response = await API.post('/fuel-logs', data);
      return response.data;
    } catch (err) {
      handleError(err);
    }
  },
  delete: async (id) => {
    try {
      await API.delete(`/fuel-logs/${id}`);
      return { success: true };
    } catch (err) {
      handleError(err);
    }
  }
};

export const expensesAPI = {
  list: async () => {
    try {
      const response = await API.get('/expenses');
      return response.data;
    } catch (err) {
      handleError(err);
    }
  },
  create: async (data) => {
    try {
      const response = await API.post('/expenses', data);
      return response.data;
    } catch (err) {
      handleError(err);
    }
  },
  delete: async (id) => {
    try {
      await API.delete(`/expenses/${id}`);
      return { success: true };
    } catch (err) {
      handleError(err);
    }
  }
};

export const reportsAPI = {
  getKpis: async () => {
    try {
      const response = await API.get('/reports/dashboard-kpis');
      return response.data;
    } catch (err) {
      handleError(err);
    }
  },
  getAnalytics: async () => {
    try {
      const response = await API.get('/reports/analytics-summary');
      return response.data;
    } catch (err) {
      handleError(err);
    }
  },
  getCostCenters: async () => {
    try {
      const response = await API.get('/reports/cost-centers');
      return response.data;
    } catch (err) {
      handleError(err);
    }
  },
  exportCsvUrl: (resource) => {
    return `http://localhost:8000/reports/export/csv/${resource}`;
  },
  exportCsv: async (resource) => {
    try {
      const response = await API.get(`/reports/export/csv/${resource}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (err) {
      handleError(err);
    }
  }
};
