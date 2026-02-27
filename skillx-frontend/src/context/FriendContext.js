import React, { createContext, useContext, useReducer } from 'react';
import api from '../services/api';

// Initial state
const initialState = {
  friends: [],
  sentRequests: [],
  receivedRequests: [],
  onlineFriends: [],
  loading: false,
  error: null
};

// Action types
const FRIEND_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_FRIENDS: 'SET_FRIENDS',
  ADD_FRIEND: 'ADD_FRIEND',
  REMOVE_FRIEND: 'REMOVE_FRIEND',
  SET_SENT_REQUESTS: 'SET_SENT_REQUESTS',
  SET_RECEIVED_REQUESTS: 'SET_RECEIVED_REQUESTS',
  ADD_SENT_REQUEST: 'ADD_SENT_REQUEST',
  REMOVE_SENT_REQUEST: 'REMOVE_SENT_REQUEST',
  ACCEPT_REQUEST: 'ACCEPT_REQUEST',
  REJECT_REQUEST: 'REJECT_REQUEST',
  SET_ONLINE_FRIENDS: 'SET_ONLINE_FRIENDS',
};

// Reducer
const friendReducer = (state = initialState, action) => {
  switch (action.type) {
    case FRIEND_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case FRIEND_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case FRIEND_ACTIONS.SET_FRIENDS:
      return { ...state, friends: action.payload };
    
    case FRIEND_ACTIONS.ADD_FRIEND:
      return { ...state, friends: [...state.friends, action.payload] };
    
    case FRIEND_ACTIONS.REMOVE_FRIEND:
      return { ...state, friends: state.friends.filter(friend => friend.id !== action.payload) };
    
    case FRIEND_ACTIONS.SET_SENT_REQUESTS:
      return { ...state, sentRequests: action.payload };
    
    case FRIEND_ACTIONS.ADD_SENT_REQUEST:
      return { ...state, sentRequests: [...state.sentRequests, action.payload] };
    
    case FRIEND_ACTIONS.REMOVE_SENT_REQUEST:
      return { ...state, sentRequests: state.sentRequests.filter(req => req.id !== action.payload) };
    
    case FRIEND_ACTIONS.SET_RECEIVED_REQUESTS:
      return { ...state, receivedRequests: action.payload };
    
    case FRIEND_ACTIONS.ACCEPT_REQUEST:
      return {
        ...state,
        receivedRequests: state.receivedRequests.filter(req => req.id !== action.payload),
        friends: [...state.friends, action.payload.friend]
      };
    
    case FRIEND_ACTIONS.REJECT_REQUEST:
      return {
        ...state,
        receivedRequests: state.receivedRequests.filter(req => req.id !== action.payload)
      };
    
    case FRIEND_ACTIONS.SET_ONLINE_FRIENDS:
      return { ...state, onlineFriends: action.payload };
    
    default:
      return state;
  }
};

// Context
const FriendContext = createContext();

// Provider component
export const FriendProvider = ({ children }) => {
  const [state, dispatch] = useReducer(friendReducer, initialState);

  // Actions
  const sendFriendRequest = async (receiverId, message = '') => {
    dispatch({ type: FRIEND_ACTIONS.SET_LOADING, payload: true });
    
    try {
      const response = await api.post('/friend-requests/', {
        receiver_id: receiverId,
        message: message
      });
      
      const request = {
        id: response.data.id,
        receiver: response.data.receiver,
        sender: response.data.sender,
        status: 'pending',
        created_at: response.data.created_at,
        message: message
      };
      
      dispatch({
        type: FRIEND_ACTIONS.ADD_SENT_REQUEST,
        payload: request
      });
      
      return response.data;
    } catch (error) {
      dispatch({ type: FRIEND_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: FRIEND_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      const response = await api.post(`/friend-requests/${requestId}/accept/`);
      
      const friend = response.data.friend;
      
      dispatch({
        type: FRIEND_ACTIONS.ACCEPT_REQUEST,
        payload: { requestId, friend }
      });
      
      return response.data;
    } catch (error) {
      dispatch({ type: FRIEND_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const rejectFriendRequest = async (requestId) => {
    try {
      await api.post(`/friend-requests/${requestId}/reject/`);
      
      dispatch({
        type: FRIEND_ACTIONS.REJECT_REQUEST,
        payload: requestId
      });
      
      return true;
    } catch (error) {
      dispatch({ type: FRIEND_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const unfriend = async (friendId) => {
    try {
      await api.delete(`/friends/${friendId}/`);
      
      dispatch({
        type: FRIEND_ACTIONS.REMOVE_FRIEND,
        payload: friendId
      });
      
      return true;
    } catch (error) {
      dispatch({ type: FRIEND_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const fetchFriends = async () => {
    dispatch({ type: FRIEND_ACTIONS.SET_LOADING, payload: true });
    
    try {
      const response = await api.get('/friends/');
      dispatch({
        type: FRIEND_ACTIONS.SET_FRIENDS,
        payload: response.data
      });
    } catch (error) {
      dispatch({ type: FRIEND_ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: FRIEND_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const fetchSentRequests = async () => {
    try {
      const response = await api.get('/friend-requests/sent/');
      dispatch({
        type: FRIEND_ACTIONS.SET_SENT_REQUESTS,
        payload: response.data
      });
    } catch (error) {
      dispatch({ type: FRIEND_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const fetchReceivedRequests = async () => {
    try {
      const response = await api.get('/friend-requests/received/');
      dispatch({
        type: FRIEND_ACTIONS.SET_RECEIVED_REQUESTS,
        payload: response.data
      });
    } catch (error) {
      dispatch({ type: FRIEND_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const value = {
    ...state,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    unfriend,
    fetchFriends,
    fetchSentRequests,
    fetchReceivedRequests,
    dispatch
  };

  return (
    <FriendContext.Provider value={value}>
      {children}
    </FriendContext.Provider>
  );
};

// Hook
export const useFriend = () => {
  const context = useContext(FriendContext);
  if (!context) {
    throw new Error('useFriend must be used within a FriendProvider');
  }
  return context;
};

export { FRIEND_ACTIONS };
