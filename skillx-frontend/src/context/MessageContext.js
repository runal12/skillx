import React, { createContext, useContext, useReducer } from 'react';
import api from '../services/api';

// Initial state
const initialState = {
  conversations: [],
  messages: {},
  onlineUsers: {},
  typingUsers: {},
  unreadCounts: {},
  loading: false,
  error: null
};

// Action types
const MESSAGE_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_MESSAGE: 'UPDATE_MESSAGE',
  DELETE_MESSAGE: 'DELETE_MESSAGE',
  MARK_READ: 'MARK_READ',
  SET_CONVERSATIONS: 'SET_CONVERSATIONS',
  ADD_CONVERSATION: 'ADD_CONVERSATION',
  UPDATE_CONVERSATION: 'UPDATE_CONVERSATION',
  DELETE_CONVERSATION: 'DELETE_CONVERSATION',
  SET_ONLINE_USERS: 'SET_ONLINE_USERS',
  SET_TYPING_USERS: 'SET_TYPING_USERS',
};

// Reducer
const messageReducer = (state = initialState, action) => {
  switch (action.type) {
    case MESSAGE_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case MESSAGE_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case MESSAGE_ACTIONS.ADD_MESSAGE:
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: [
            ...(state.messages[action.payload.conversationId] || []),
            action.payload.message
          ]
        }
      };
    
    case MESSAGE_ACTIONS.UPDATE_MESSAGE:
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: state.messages[action.payload.conversationId]?.map(msg =>
            msg.id === action.payload.messageId ? action.payload.updates : msg
          )
        }
      };
    
    case MESSAGE_ACTIONS.DELETE_MESSAGE:
      const { [action.payload.conversationId, messageId] } = action.payload;
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: state.messages[action.payload.conversationId]?.filter(msg => msg.id !== messageId)
        }
      };
    
    case MESSAGE_ACTIONS.MARK_READ:
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: state.messages[action.payload.conversationId]?.map(msg =>
            msg.id === action.payload.messageId ? { ...msg, is_read: true } : msg
          )
        }
      };
    
    case MESSAGE_ACTIONS.SET_CONVERSATIONS:
      return { ...state, conversations: action.payload };
    
    case MESSAGE_ACTIONS.ADD_CONVERSATION:
      return {
        ...state,
        conversations: [...state.conversations, action.payload]
      };
    
    case MESSAGE_ACTIONS.UPDATE_CONVERSATION:
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.conversationId ? action.payload.updates : conv
        )
      };
    
    case MESSAGE_ACTIONS.DELETE_CONVERSATION:
      return {
        ...state,
        conversations: state.conversations.filter(conv => conv.id !== action.payload.conversationId),
        messages: Object.keys(state.messages).reduce((acc, convId) => {
          if (convId === action.payload.conversationId) {
            delete acc[convId];
          }
          return acc;
        }, state.messages)
      };
    
    case MESSAGE_ACTIONS.SET_ONLINE_USERS:
      return { ...state, onlineUsers: action.payload };
    
    case MESSAGE_ACTIONS.SET_TYPING_USERS:
      return { ...state, typingUsers: action.payload };
    
    default:
      return state;
  }
};

// Context
const MessageContext = createContext();

// Provider component
export const MessageProvider = ({ children }) => {
  const [state, dispatch] = useReducer(messageReducer, initialState);

  // Actions
  const sendMessage = async (conversationId, receiverId, content) => {
    dispatch({ type: MESSAGE_ACTIONS.SET_LOADING, payload: true });
    
    try {
      const response = await api.post('/send-message/', {
        receiver_id: receiverId,
        content: content
      });
      
      const message = {
        id: Date.now(), // Temporary ID
        sender_id: JSON.parse(localStorage.getItem('user')).id,
        receiver_id: receiverId,
        content: content,
        timestamp: new Date().toISOString(),
        is_read: false,
        conversation_id: conversationId
      };
      
      dispatch({
        type: MESSAGE_ACTIONS.ADD_MESSAGE,
        payload: { conversationId, message }
      });
      
      // Store in localStorage
      const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
      const convIndex = conversations.findIndex(conv => conv.id === conversationId);
      if (convIndex !== -1) {
        conversations[convIndex].messages.push(message);
        conversations[convIndex].last_message = content;
        conversations[convIndex].last_activity = new Date().toISOString();
        localStorage.setItem('conversations', JSON.stringify(conversations));
      }
      
      return response.data;
    } catch (error) {
      dispatch({ type: MESSAGE_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: MESSAGE_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const markMessageAsRead = async (conversationId, messageId) => {
    try {
      await api.patch(`/messages/${messageId}/`, { is_read: true });
      dispatch({
        type: MESSAGE_ACTIONS.MARK_READ,
        payload: { conversationId, messageId }
      });
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const deleteMessage = async (conversationId, messageId) => {
    try {
      await api.delete(`/messages/${messageId}/`);
      dispatch({
        type: MESSAGE_ACTIONS.DELETE_MESSAGE,
        payload: { conversationId, messageId }
      });
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      await api.delete(`/conversations/${conversationId}/`);
      dispatch({
        type: MESSAGE_ACTIONS.DELETE_CONVERSATION,
        payload: { conversationId }
      });
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const value = {
    ...state,
    sendMessage,
    markMessageAsRead,
    deleteMessage,
    deleteConversation,
    dispatch
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};

// Hook
export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};

export { MESSAGE_ACTIONS };
