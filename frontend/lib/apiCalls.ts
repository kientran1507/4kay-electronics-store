import axios from "axios";
import { 
  AssistantRequest,
  AssistantResponse,
  AuthResponse,
  AuthUser,
  KioskRequest,
  KioskResponse,
  LoginData,
  PaymentSession,
  PricingQuote,
  RegisterData
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://group-15-cnweb.onrender.com/api";


// Public API calls
export const publicApi = {
  getAllProducts: async (params?: { page?: number; limit?: number }) => {
    try {
      let url = `${BASE_URL}/products`;
      
      if (params?.page || params?.limit) {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', String(params.page));
        if (params.limit) queryParams.append('limit', String(params.limit));
        url += `?${queryParams}`;
      }
  
      const res = await axios.get(url);
      return {
        products: res.data.products,
        total: res.data.totalProducts,
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  searchProducts: async (keyword: string, page = 1, limit = 10) => {
    const res = await axios.get(`${BASE_URL}/products/findByName?keyword=${keyword}&page=${page}&limit=${limit}`);
    return res.data;
  },

  getCategoryProducts: async (category: string, params?: { 
    priceRange?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      if (!category) {
        throw new Error('Category is required');
      }
      
      // Use decodeURI first to ensure we don't have any existing encoding
      const decodedCategory = decodeURI(category);
      // Then encode only once
      const query = new URLSearchParams({
        category: decodedCategory,
        page: String(params?.page || 1),
        limit: String(params?.limit || 100),
      });
      if (params?.priceRange) query.set("priceRange", params.priceRange);
      const url = `${BASE_URL}/products/category?${query.toString()}`;
      
      const res = await axios.get(url);
      
      return {
        products: res.data.products || [],
        total: res.data.totalProducts || 0,
        currentPage: res.data.currentPage || 1,
        totalPages: res.data.totalPages || 0
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch category products');
      }
      throw new Error('Network error occurred');
    }
  },

  getProduct: async (id: string) => {
    try {
      const res = await axios.get(`${BASE_URL}/products/${id}`);
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

};

export const customerApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const res = await axios.post(`${BASE_URL}/customers/login`, data);
      const userData: AuthUser = {
        ...res.data.user,
        role: 'customer',
        token: res.data.token
      };
      return {
        user: userData,
        token: res.data.token
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },
  register: async (
    data: RegisterData
  ): Promise<{ user: Omit<AuthUser, "role" | "token">; message?: string }> => {
    try {
      const res = await axios.post(`${BASE_URL}/customers/register`, data);
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

export const adminApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const res = await axios.post(`${BASE_URL}/admins/login`, data);
      const userData: AuthUser = {
        ...res.data.user,
        role: 'admin',
        token: res.data.token
      };
      return {
        user: userData,
        token: res.data.token
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

export const assistantApi = {
  recommend: async (data: AssistantRequest): Promise<AssistantResponse> => {
    const res = await axios.post(`${BASE_URL}/ai/recommend`, data);
    return res.data;
  },
  kiosk: async (data: KioskRequest): Promise<KioskResponse> => {
    const res = await axios.post(`${BASE_URL}/ai/kiosk`, data);
    return res.data;
  }
};

// Protected API factory
export const createProtectedApi = (token: string) => {
  // Create axios instance with default config
  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  // Add response interceptor to handle auth errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Clear local storage and trigger logout
        localStorage.removeItem('user');
        window.location.href = '/customer-sign-in';
      }
      return Promise.reject(error);
    }
  );

  return {
    // Cart operations (for customers only)
    cart: {
      get: async () => {
        const res = await api.get('/cart');
        return res.data;
      },
      
      add: async (productId: string, quantity = 1) => {
        try {
          const res = await api.post('/cart/add', { productId, quantity });
          return res.data;
        } catch (error) {
          console.error('Cart add error:', error);
          throw error;
        }
      },
      
      update: async (productId: string, quantity: number) => {
        const res = await api.put('/cart/updateCartItemQuantity', { productId, quantity });
        return res.data;
      },
      
      remove: async (productId: string) => {
        const res = await api.delete('/cart/removeFromCart', { data: { productId } });
        return res.data;
      }
    },

    // Order operations (for customers only)
    orders: {
      quote: async (orderData: { shippingAddress?: string; voucherCode?: string }): Promise<{ message: string; pricing: PricingQuote }> => {
        const res = await api.post('/orders/quote', orderData);
        return res.data;
      },

      create: async (orderData: any) => {
        const res = await api.post('/orders/createOrder', orderData);
        return res.data;
      },
      
      getUserOrders: async () => {
        const res = await api.get('/orders/userOrders');
        return res.data;
      },
      
      getDetails: async (orderId: string) => {
        const res = await api.get(`/orders/userOrderDetails/${orderId}`);
        return res.data;
      },
      
      cancel: async (orderId: string) => {
        const res = await api.put('/orders/cancelOrder', { orderId });
        return res.data;
      }
    },

    payments: {
      create: async (orderId: string): Promise<PaymentSession> => {
        const res = await api.post('/payments/payos/create', { orderId });
        return res.data;
      },

      getStatus: async (orderId: string): Promise<PaymentSession> => {
        const res = await api.get(`/payments/status/${orderId}`);
        return res.data;
      }
    },

    // Customer profile operations
    customerProfile: {
      get: async (id: string) => {
        const res = await api.get(`/customers/${id}`);
        return res.data;
      },
      
      update: async (data: any) => {
        const res = await api.put('/customers/update', data);
        return res.data;
      }
    },

    // Admin profile operations
    adminProfile: {
      get: async (id: string) => {
        const res = await api.get(`/admins/${id}`);
        return res.data;
      },
      
      update: async (data: any) => {
        const res = await api.put('/admins/update', data);
        return res.data;
      },

      getAllAdmins: async () => {
        const res = await api.get('/admins');
        return res.data;
      }
    },

    // Admin specific operations
    admin: {
      getAllOrders: async () => {
        try {
          const res = await api.get('/orders/');
          return res.data;
        } catch (error) {
          throw handleApiError(error);
        }
      },

      updateOrderStatus: async (orderId: string, status: string) => {
        const res = await api.put('/orderProcessing/status', { orderId, status });
        return res.data;
      },

      createProduct: async (productData: any) => {
        const res = await api.post('/products/create', productData);
        return res.data;
      },

      updateProduct: async (id: string, productData: any) => {
        const res = await api.put(`/products/update/${id}`, productData);
        return res.data;
      },

      deleteProduct: async (id: string) => {
        const res = await api.delete(`/products/delete/${id}`);
        return res.data;
      },

      registerAdmin: async (adminData: RegisterData) => {
        const res = await api.post('/admins/register', adminData);
        return res.data;
      },
      
      getAllAdmins: async () => {
        const res = await api.get('/admins');
        return res.data;
      },

      updateAdmin: async (data: any) => {
        const res = await api.put(`/admins/${data._id}`, data);
        return res.data;
      },

      getAdminById: async (id: string) => {
        const res = await api.get(`/admins/${id}`);
        return res.data;
      },

      deleteAdmin: async (id: string) => {
        const res = await api.delete(`/admins/${id}`);
        return res.data;
      },

      getAllCustomers: async (page?: number, limit?: number) => {
        let url = '/customers';
        const params = new URLSearchParams();
        
        if (page !== undefined) {
          params.append('page', page.toString());
        }
        if (limit !== undefined) {
          params.append('limit', limit.toString());
        }
      
        const queryString = params.toString();
        url = queryString ? `${url}?${queryString}` : url;
        
        const res = await api.get(url);
        return res.data;
      },

      getCustomerById: async (id: string) => {
        const res = await api.get(`/customers/${id}`);
        return res.data;
      },

      deleteCustomer: async (id: string) => {
        const res = await api.delete(`/customers/${id}`);
        return res.data;
      },

      updateCustomer: async (id: string, customerData: any) => {
        const res = await api.put(`/customers/${id}`, customerData);
        return res.data;
      },

      createCustomer: async (customerData: any) => {
        const res = await api.post('/customers/admin', customerData);
        return res.data;
      }
    }
  };
};

// Error handler helper
export const handleApiError = (error: any) => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      throw new Error('Unauthorized access');
    }
    throw new Error(error.response?.data?.message || 'Request failed');
  }
  throw new Error('Network error occurred');
};
