import { generateId } from '@/app/utils/id';

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
}

export interface ChatUser {
  userId: string;
  username: string;
  joinedAt: number;
}

class ChatCache {
  private MAX_MESSAGES = 100;
  private messages: Array<ChatMessage> = [];
  private users: Map<string, ChatUser> = new Map();

  addMessage(userId: string, message: string): ChatMessage | null {
    const user = this.users.get(userId);
    if (!user) {
      return null;
    }

    const chatMessage: ChatMessage = {
      id: generateId(),
      userId,
      username: user.username,
      message,
      timestamp: Date.now()
    };

    this.messages.push(chatMessage);

    if (this.messages.length > this.MAX_MESSAGES) {
      this.messages.shift();
    }

    return chatMessage;
  }

  getMessages(since?: number): Array<ChatMessage> {
    if (since) {
      return this.messages.filter((msg) => msg.timestamp > since);
    }
    return [...this.messages];
  }

  addUser(userId: string, username: string): ChatUser {
    const user: ChatUser = {
      userId,
      username,
      joinedAt: Date.now()
    };
    this.users.set(userId, user);
    return user;
  }

  getUser(userId: string): ChatUser | undefined {
    return this.users.get(userId);
  }

  removeUser(userId: string): void {
    this.users.delete(userId);
  }

  getActiveUsers(): Array<ChatUser> {
    return Array.from(this.users.values());
  }

  clearMessages(): void {
    this.messages = [];
  }
}

// use globalThis to maintain cache across hot reloads in development
const globalForChatCache = globalThis as typeof globalThis & {
  chatCache?: ChatCache;
};

export const chatCache = (globalForChatCache.chatCache ??= new ChatCache());
