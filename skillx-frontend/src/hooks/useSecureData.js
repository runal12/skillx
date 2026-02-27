import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import dataSecurityService from '../services/dataSecurity';
import api from '../services/api';

export const useSecureData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Secure fetch for user-specific data
  const secureFetch = useCallback(async (endpoint, options = {}) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      // Validate session first
      const sessionValidation = dataSecurityService.validateSession();
      if (!sessionValidation.valid) {
        throw new Error(sessionValidation.reason);
      }

      const response = await api.get(endpoint, options);
      
      // Filter data to ensure user only sees their own data
      const filteredData = dataSecurityService.filterUserData(response.data, user.id);
      
      // Log successful data access
      dataSecurityService.logSecurityEvent('DATA_ACCESS', {
        endpoint,
        dataType: Array.isArray(filteredData) ? 'array' : 'object',
        itemCount: Array.isArray(filteredData) ? filteredData.length : 1
      });

      return { ...response, data: filteredData };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      setError(errorMessage);
      
      // Log security event for failed access
      dataSecurityService.logSecurityEvent('DATA_ACCESS_DENIED', {
        endpoint,
        error: errorMessage
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Secure fetch conversations (user-specific)
  const fetchConversations = useCallback(async () => {
    return secureFetch('/conversations/');
  }, [secureFetch]);

  // Secure fetch connections (user-specific)
  const fetchConnections = useCallback(async () => {
    return secureFetch('/my-connections/');
  }, [secureFetch]);

  // Secure fetch pending requests (user-specific)
  const fetchPendingRequests = useCallback(async () => {
    return secureFetch('/pending-requests/');
  }, [secureFetch]);

  // Secure fetch user profile (user-specific)
  const fetchUserProfile = useCallback(async (userId = null) => {
    if (userId && userId !== user.id.toString()) {
      throw new Error('Access denied: Cannot access other user profiles');
    }
    return secureFetch('/profile/');
  }, [secureFetch, user]);

  // Verify user owns resource
  const verifyOwnership = useCallback((resource) => {
    if (!user || !resource) return false;
    
    const userId = user.id.toString();
    
    // Check various ownership patterns
    if (resource.sender_id || resource.receiver_id) {
      return resource.sender_id === userId || resource.receiver_id === userId;
    }
    if (resource.requester_id || resource.addressee_id) {
      return resource.requester_id === userId || resource.addressee_id === userId;
    }
    if (resource.user_id) {
      return resource.user_id === userId;
    }
    if (resource.id && resource.id === userId) {
      return true;
    }
    
    return false;
  }, [user]);

  // Filter messages for current user
  const filterUserMessages = useCallback((messages) => {
    if (!user || !Array.isArray(messages)) return messages;
    
    const userId = user.id.toString();
    return messages.filter(msg => 
      msg.sender_id === userId || msg.receiver_id === userId
    );
  }, [user]);

  // Filter connections for current user
  const filterUserConnections = useCallback((connections) => {
    if (!user || !Array.isArray(connections)) return connections;
    
    const userId = user.id.toString();
    return connections.filter(conn => 
      conn.requester_id === userId || conn.addressee_id === userId
    );
  }, [user]);

  return {
    loading,
    error,
    secureFetch,
    fetchConversations,
    fetchConnections,
    fetchPendingRequests,
    fetchUserProfile,
    verifyOwnership,
    filterUserMessages,
    filterUserConnections
  };
};

export default useSecureData;
