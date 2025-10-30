import { projectId, publicAnonKey } from './supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-b90be4d1`;

export async function apiCall(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<any> {
  let token = localStorage.getItem('accessToken');
  
  // Validate token
  if (!token || token === 'undefined' || token === 'null') {
    token = publicAnonKey;
  }
  
  const url = `${BASE_URL}${endpoint}`;
  console.log(`[API] Calling ${options.method || 'GET'} ${url} (attempt ${retryCount + 1})`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    console.log(`[API] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = 'API call failed';
      try {
        const error = await response.json();
        console.error(`[API] Error response:`, error);
        errorMessage = error.error || errorMessage;
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      // If unauthorized, clear invalid token
      if (response.status === 401) {
        console.warn('[API] Unauthorized request - clearing tokens');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
      }
      
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }

    const data = await response.json();
    console.log(`[API] Success response:`, data);
    return data;
  } catch (error: any) {
    console.error(`[API] Call to ${endpoint} failed:`, {
      message: error?.message,
      status: error?.status,
      endpoint,
      url,
      name: error?.name,
    });
    
    // Retry logic for network errors (not for HTTP errors)
    if (error?.name === 'TypeError' && retryCount < 2) {
      console.log(`[API] Network error detected, retrying in ${(retryCount + 1) * 1000}ms...`);
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
      return apiCall(endpoint, options, retryCount + 1);
    }
    
    // If all retries failed, throw a more helpful error
    if (error?.name === 'TypeError' && error?.message?.includes('Load failed')) {
      const helpfulError = new Error(
        `Impossible de se connecter au serveur. Vérifiez que :\n` +
        `1. Les Edge Functions Supabase sont déployées\n` +
        `2. Les variables d'environnement sont configurées\n` +
        `3. Votre connexion internet fonctionne\n\n` +
        `URL tentée: ${url}`
      );
      (helpfulError as any).originalError = error;
      throw helpfulError;
    }
    
    throw error;
  }
}

export const api = {
  // Auth
  signup: async (data: { email: string; password: string; userType: string; name: string; pseudo: string; profileImage?: File | null }) => {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('userType', data.userType);
    formData.append('name', data.name);
    formData.append('pseudo', data.pseudo);
    if (data.profileImage) {
      formData.append('profileImage', data.profileImage);
    }

    let token = localStorage.getItem('accessToken');
    if (!token || token === 'undefined' || token === 'null') {
      token = publicAnonKey;
    }

    const response = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Erreur lors de l\'inscription';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  // Profile
  getProfile: (userId: string) => apiCall(`/profile/${userId}`),
  
  updateProfile: (userId: string, updates: any) =>
    apiCall(`/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Questionnaire
  submitQuestionnaire: (userId: string, answers: any) =>
    apiCall(`/questionnaire/${userId}`, {
      method: 'POST',
      body: JSON.stringify(answers),
    }),

  // Search
  search: (criteria: any) =>
    apiCall('/search', {
      method: 'POST',
      body: JSON.stringify(criteria),
    }),

  searchProfiles: (criteria: any) =>
    apiCall('/profiles/search', {
      method: 'POST',
      body: JSON.stringify(criteria),
    }),

  // Subscription
  activateSubscription: (userId: string) =>
    apiCall(`/subscription/${userId}`, {
      method: 'POST',
    }),

  // Premium Services
  purchaseServices: (userId: string, serviceIds: string[]) =>
    apiCall(`/services/${userId}/purchase`, {
      method: 'POST',
      body: JSON.stringify({ serviceIds }),
    }),

  // Messages
  sendMessage: (data: { fromUserId: string; toUserId: string; message: string }) =>
    apiCall('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMessages: (userId: string) => apiCall(`/messages/${userId}`),

  getBookings: (userId: string) => apiCall(`/bookings/${userId}`),

  // Applications
  createApplication: (data: any) =>
    apiCall('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getApplications: (userId: string) => apiCall(`/applications/${userId}`),

  updateApplicationStatus: (applicationId: string, status: string) =>
    apiCall(`/applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // AI Scheduling
  generateAISchedule: (userId: string, criteria: any) =>
    apiCall(`/ai-schedule/${userId}`, {
      method: 'POST',
      body: JSON.stringify(criteria),
    }),

  // Contract
  signContract: (userId: string, signature: string) =>
    apiCall(`/contract/${userId}/sign`, {
      method: 'POST',
      body: JSON.stringify({ signature }),
    }),

  // Appointments
  getAvailableSlots: () => apiCall('/appointments/slots'),
  
  getUserAppointments: (userId: string) => apiCall(`/appointments/user/${userId}`),
  
  bookAppointments: (userId: string, slots: any) =>
    apiCall(`/appointments/book`, {
      method: 'POST',
      body: JSON.stringify({ userId, slots }),
    }),

  // Admin
  getAllSlots: () => apiCall('/admin/slots'),
  
  getAllAppointments: () => apiCall('/admin/appointments'),
  
  createSlot: (data: { type: string; dateTime: string; maxCapacity: number }) =>
    apiCall('/admin/slots', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  deleteSlot: (slotId: string) =>
    apiCall(`/admin/slots/${slotId}`, {
      method: 'DELETE',
    }),

  // Get all service orders (admin only)
  getAllOrders: () =>
    apiCall('/admin/orders'),

  // Get all premium service purchases (admin only)
  getAllPremiumPurchases: () =>
    apiCall('/admin/premium-purchases'),

  // Stripe - Create Payment Intent
  createPaymentIntent: (amount: number, description: string, metadata?: any) =>
    apiCall('/stripe/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, description, metadata }),
    }),

  // Stripe - Confirm Payment
  confirmPayment: (paymentIntentId: string) =>
    apiCall('/stripe/confirm-payment', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
    }),

  // Bookings - Create a pro service booking
  createBooking: (data: {
    proUserId: string;
    artistUserId: string;
    date: string;
    duration?: number;
    totalPrice: number;
    serviceName?: string;
    notes?: string;
  }) =>
    apiCall('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Service Validation - Get bookings to validate
  getBookingsToValidate: (artistId: string) =>
    apiCall(`/bookings/to-validate/${artistId}`),

  // Service Validation - Validate booking and rate pro
  validateServiceBooking: (data: {
    bookingId: string;
    rating: number;
    comment: string | null;
    artistId: string;
  }) =>
    apiCall('/bookings/validate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Stripe Connect - Create onboarding link
  createStripeOnboardingLink: () =>
    apiCall('/connect/onboard', {
      method: 'POST',
    }),

  // Stripe Connect - Get account status
  getStripeAccountStatus: (userId: string) =>
    apiCall(`/connect/account-status/${userId}`),

  // Stripe Connect - Create dashboard link
  createStripeDashboardLink: () =>
    apiCall('/connect/dashboard', {
      method: 'POST',
    }),

  // Email - Send visio link email
  sendVisioEmail: (data: {
    appointmentId: string;
    userEmail: string;
    userName: string;
    slotDateTime: string;
    visioLink: string;
    rdvType: string;
  }) =>
    apiCall('/admin/send-visio-email', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Slots - Update visio link
  updateSlotVisioLink: (slotId: string, visioLink: string) =>
    apiCall(`/admin/slots/${slotId}/visio-link`, {
      method: 'PUT',
      body: JSON.stringify({ visioLink }),
    }),

  // Admin - Get all users (for debugging)
  getAllUsers: () => apiCall('/admin/users'),

  // Admin - Check if current user is admin
  checkAdmin: () => apiCall('/auth/check-admin'),

  // Admin - Make current user an admin
  makeAdmin: () => apiCall('/auth/make-admin', { method: 'POST' }),
};
