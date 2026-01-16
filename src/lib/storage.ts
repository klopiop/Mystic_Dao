type Message = {
  role: "user" | "assistant";
  content: string;
};

interface Conversation {
  id: string;
  type: 'oracle' | 'tcm';
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'mystic_conversations';

export const conversationStorage = {
  getAll: (): Conversation[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load conversations:', error);
      return [];
    }
  },

  save: (conversation: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>): Conversation => {
    if (typeof window === 'undefined') {
      throw new Error('Cannot save conversation on server');
    }

    const conversations = conversationStorage.getAll();
    const now = new Date().toISOString();
    
    const newConversation: Conversation = {
      ...conversation,
      id: `conv-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    const updatedConversations = [newConversation, ...conversations].slice(0, 50);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConversations));
      return newConversation;
    } catch (error) {
      console.error('Failed to save conversation:', error);
      throw new Error('Failed to save conversation');
    }
  },

  update: (id: string, updates: Partial<Conversation>): void => {
    if (typeof window === 'undefined') return;

    const conversations = conversationStorage.getAll();
    const index = conversations.findIndex(c => c.id === id);
    
    if (index !== -1) {
      conversations[index] = {
        ...conversations[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
      } catch (error) {
        console.error('Failed to update conversation:', error);
      }
    }
  },

  delete: (id: string): void => {
    if (typeof window === 'undefined') return;

    const conversations = conversationStorage.getAll().filter(c => c.id !== id);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear conversations:', error);
    }
  },
};
