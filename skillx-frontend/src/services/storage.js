import { storage } from '../utils/helpers';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  CONVERSATIONS: 'conversations',
  FRIENDS: 'friends',
  SENT_REQUESTS: 'sentRequests',
  RECEIVED_REQUESTS: 'receivedRequests',
  APP_SETTINGS: 'appSettings',
  DRAFT_MESSAGES: 'draftMessages',
  READ_RECEIPTS: 'readReceipts'
};

// Auth storage
export const authStorage = {
  getToken: () => storage.get(STORAGE_KEYS.AUTH_TOKEN),
  setToken: (token) => storage.set(STORAGE_KEYS.AUTH_TOKEN, token),
  removeToken: () => storage.remove(STORAGE_KEYS.AUTH_TOKEN),
  
  getRefreshToken: () => storage.get(STORAGE_KEYS.REFRESH_TOKEN),
  setRefreshToken: (token) => storage.set(STORAGE_KEYS.REFRESH_TOKEN, token),
  removeRefreshToken: () => storage.remove(STORAGE_KEYS.REFRESH_TOKEN),
  
  getUserData: () => storage.get(STORAGE_KEYS.USER_DATA),
  setUserData: (data) => storage.set(STORAGE_KEYS.USER_DATA, data),
  removeUserData: () => storage.remove(STORAGE_KEYS.USER_DATA)
};

// Message storage
export const messageStorage = {
  getConversations: () => storage.get(STORAGE_KEYS.CONVERSATIONS, []),
  setConversations: (conversations) => storage.set(STORAGE_KEYS.CONVERSATIONS, conversations),
  
  getConversation: (conversationId) => {
    const conversations = messageStorage.getConversations();
    return conversations.find(conv => conv.id === conversationId);
  },
  
  setConversation: (conversationId, updates) => {
    const conversations = messageStorage.getConversations();
    const updatedConversations = conversations.map(conv => 
      conv.id === conversationId ? { ...conv, ...updates } : conv
    );
    messageStorage.setConversations(updatedConversations);
  },
  
  addMessage: (conversationId, message) => {
    const conversations = messageStorage.getConversations();
    const conversation = messageStorage.getConversation(conversationId);
    
    if (conversation) {
      conversation.messages.push(message);
      conversation.last_message = message.content;
      conversation.last_activity = message.timestamp;
      conversation.unread_count = conversation.unread_count + (message.receiver_id !== message.sender_id ? 1 : 0);
    }
    
    messageStorage.setConversations(conversations);
  },
  
  markAsRead: (conversationId) => {
    const conversations = messageStorage.getConversations();
    const conversation = messageStorage.getConversation(conversationId);
    
    if (conversation) {
      conversation.unread_count = 0;
      conversation.messages.forEach(msg => {
        if (msg.receiver_id !== msg.sender_id) {
          msg.is_read = true;
        }
      });
    }
    
    messageStorage.setConversations(conversations);
  },
  
  deleteMessage: (conversationId, messageId) => {
    const conversations = messageStorage.getConversations();
    const conversation = messageStorage.getConversation(conversationId);
    
    if (conversation) {
      conversation.messages = conversation.messages.filter(msg => msg.id !== messageId);
      if (conversation.last_message_id === messageId) {
        // Update last message if needed
        const remainingMessages = conversation.messages.filter(msg => msg.id !== messageId);
        if (remainingMessages.length > 0) {
          const lastMessage = remainingMessages[remainingMessages.length - 1];
          conversation.last_message = lastMessage.content;
          conversation.last_activity = lastMessage.timestamp;
        }
      }
    }
    
    messageStorage.setConversations(conversations);
  },
  
  deleteConversation: (conversationId) => {
    const conversations = messageStorage.getConversations();
    const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
    messageStorage.setConversations(updatedConversations);
  }
};

// Friend storage
export const friendStorage = {
  getFriends: () => storage.get(STORAGE_KEYS.FRIENDS, []),
  setFriends: (friends) => storage.set(STORAGE_KEYS.FRIENDS, friends),
  
  getSentRequests: () => storage.get(STORAGE_KEYS.SENT_REQUESTS, []),
  setSentRequests: (requests) => storage.set(STORAGE_KEYS.SENT_REQUESTS, requests),
  
  getReceivedRequests: () => storage.get(STORAGE_KEYS.RECEIVED_REQUESTS, []),
  setReceivedRequests: (requests) => storage.set(STORAGE_KEYS.RECEIVED_REQUESTS, requests),
  
  addFriend: (friend) => {
    const friends = friendStorage.getFriends();
    friends.push(friend);
    friendStorage.setFriends(friends);
  },
  
  removeFriend: (friendId) => {
    const friends = friendStorage.getFriends();
    const updatedFriends = friends.filter(friend => friend.id !== friendId);
    friendStorage.setFriends(updatedFriends);
  },
  
  updateFriend: (friendId, updates) => {
    const friends = friendStorage.getFriends();
    const updatedFriends = friends.map(friend => 
      friend.id === friendId ? { ...friend, ...updates } : friend
    );
    friendStorage.setFriends(updatedFriends);
  }
};

// Settings storage
export const settingsStorage = {
  getSettings: () => storage.get(STORAGE_KEYS.APP_SETTINGS, {
    theme: 'light',
    notifications: true,
    autoSave: true,
    language: 'en'
  }),
  
  setSettings: (settings) => storage.set(STORAGE_KEYS.APP_SETTINGS, settings),
  
  updateSetting: (key, value) => {
    const settings = settingsStorage.getSettings();
    settings[key] = value;
    settingsStorage.setSettings(settings);
  }
};

// Cache management
export const cache = {
  get: (key) => {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting ${key} from sessionStorage:`, error);
      return null;
    }
  },
  
  set: (key, value, ttl = 300000) => { // Default 5 minutes TTL
    try {
      const item = {
        value: value,
        timestamp: Date.now(),
        ttl: ttl
      };
      sessionStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error(`Error setting ${key} in sessionStorage:`, error);
    }
  },
  
  isValid: (key) => {
    try {
      const item = sessionStorage.getItem(key);
      if (!item) return false;
      
      const parsed = JSON.parse(item);
      const now = Date.now();
      
      return (now - parsed.timestamp) < parsed.ttl;
    } catch (error) {
      console.error(`Error checking ${key} in sessionStorage:`, error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from sessionStorage:`, error);
    }
  }
};

// Clear all storage
export const clearAllStorage = () => {
  storage.clear();
  Object.values(STORAGE_KEYS).forEach(key => sessionStorage.removeItem(key));
};
