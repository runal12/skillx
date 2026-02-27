// Data Security Service - Ensures users only access their own data
import api from './api';

export const dataSecurityService = {
  // Verify user can access specific resource
  verifyResourceAccess: (resourceType, resourceId, userId) => {
    const currentUserId = localStorage.getItem('userId');
    return currentUserId === userId.toString();
  },

  // Filter user-specific data from responses
  filterUserData: (data, currentUserId) => {
    if (!data || !currentUserId) return data;
    
    if (Array.isArray(data)) {
      return data.filter(item => {
        // Filter based on user ownership
        if (item.sender_id || item.receiver_id) {
          return item.sender_id === currentUserId || item.receiver_id === currentUserId;
        }
        if (item.requester_id || item.addressee_id) {
          return item.requester_id === currentUserId || item.addressee_id === currentUserId;
        }
        if (item.user_id) {
          return item.user_id === currentUserId;
        }
        return true; // Default allow if no user fields found
      });
    }
    
    return data;
  },

  // Secure API calls with user validation
  secureGet: async (endpoint, expectedUserId = null) => {
    try {
      const response = await api.get(endpoint);
      
      // Validate that data belongs to current user
      if (expectedUserId) {
        const currentUserId = localStorage.getItem('userId');
        if (response.data.user_id && response.data.user_id !== currentUserId) {
          throw new Error('Access denied: Data does not belong to current user');
        }
      }
      
      return response;
    } catch (error) {
      console.error('Security check failed:', error);
      throw error;
    }
  },

  // Log security events
  logSecurityEvent: (event, details) => {
    const securityLog = {
      timestamp: new Date().toISOString(),
      userId: localStorage.getItem('userId'),
      event,
      details,
      userAgent: navigator.userAgent,
      ip: null // Would need backend to provide this
    };
    
    console.warn('Security Event:', securityLog);
    
    // In production, send to security monitoring service
    // api.post('/security/log', securityLog);
  },

  // Validate user session
  validateSession: () => {
    const token = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      return { valid: false, reason: 'Missing authentication data' };
    }
    
    try {
      // Decode JWT to check expiration (basic check)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      
      if (payload.exp < now) {
        return { valid: false, reason: 'Token expired' };
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, reason: 'Invalid token format' };
    }
  },

  // Clear user data on logout
  clearUserData: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    
    // Clear any cached data
    if (window.caches) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
  }
};

export default dataSecurityService;
