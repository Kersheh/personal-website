'use client';

import { useState, useEffect, useRef } from 'react';
import { GearIcon } from '@/app/components/atomic/icons';
import {
  useWindowEvent,
  dispatchWindowEvent
} from '@/app/hooks/useWindowEvent';
import { useMIMStore } from './store/mimStore';
import { getTheme } from './themes';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
  isSystem?: boolean;
}

interface ChatUser {
  userId: string;
  username: string;
}

const POLL_INTERVAL = 2500;

const COMMANDS = {
  help: {
    description: 'Show available commands',
    execute: () => {
      const commandList = Object.entries(COMMANDS)
        .map(([cmd, info]) => `/${cmd} - ${info.description}`)
        .join('\n');
      return `Available commands:\n${commandList}`;
    }
  },
  clear: {
    description: 'Clear all chat messages (for all users)',
    execute: async () => {
      try {
        const response = await fetch('/api/chat/clear', {
          method: 'POST'
        });
        const data = await response.json();

        if (data.success) {
          window.dispatchEvent(new CustomEvent('mim:clear'));
          return 'Chat cleared successfully.';
        } else {
          return `Failed to clear chat: ${data.error}`;
        }
      } catch {
        return 'Failed to clear chat. Please try again.';
      }
    }
  }
};

const handleCommand = async (command: string): Promise<string | null> => {
  const trimmed = command.slice(1).trim().toLowerCase();
  const cmd = COMMANDS[trimmed as keyof typeof COMMANDS];

  if (cmd) {
    return await cmd.execute();
  }

  return `Unknown command: /${trimmed}. Type /help for available commands.`;
};

export default function MIM() {
  const [messages, setMessages] = useState<Array<ChatMessage>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [user, setUser] = useState<ChatUser | null>(null);
  const [isJoining, setIsJoining] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const lastTimestampRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasJoinedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const use24HourFormat = useMIMStore(
    (state) => state.preferences.use24HourFormat
  );
  const themeId = useMIMStore((state) => state.preferences.theme);
  const theme = getTheme(themeId);
  const cachedUsername = useMIMStore((state) => state.user.username);
  const cachedUserId = useMIMStore((state) => state.user.id);
  const setStoredUsername = useMIMStore((state) => state.setUsername);
  const setStoredUserId = useMIMStore((state) => state.setUserId);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    if (use24HourFormat) {
      return date.toLocaleTimeString([], { hour12: false });
    }
    return date.toLocaleTimeString([], { hour12: true });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useWindowEvent('mim:clear', () => {
    setMessages([]);
    lastTimestampRef.current = 0;
  });

  useEffect(() => {
    const joinChat = async () => {
      if (hasJoinedRef.current) {
        return;
      }

      // try to use cached user first
      if (cachedUsername && cachedUserId) {
        setUser({ userId: cachedUserId, username: cachedUsername });
        setIsJoining(false);
        hasJoinedRef.current = true;
        return;
      }

      hasJoinedRef.current = true;

      try {
        const response = await fetch('/api/chat/join', {
          method: 'POST'
        });
        const data = await response.json();

        if (data.success) {
          setUser({ userId: data.userId, username: data.username });
          setStoredUsername(data.username);
          setStoredUserId(data.userId);
          setIsJoining(false);
        }
      } catch (error) {
        console.error('Failed to join chat:', error);
        hasJoinedRef.current = false;
        setIsJoining(false);
      }
    };

    joinChat();
  }, [cachedUsername, cachedUserId, setStoredUsername, setStoredUserId]);

  // update user when cached values change (e.g., when username is changed in preferences)
  useEffect(() => {
    if (
      user &&
      cachedUsername &&
      cachedUserId &&
      user.username !== cachedUsername
    ) {
      setUser({ userId: cachedUserId, username: cachedUsername });
    }
  }, [cachedUsername, cachedUserId, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchMessages = async () => {
      try {
        const url = lastTimestampRef.current
          ? `/api/chat/messages?since=${lastTimestampRef.current}`
          : '/api/chat/messages';

        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.messages.length > 0) {
          setMessages((prev) => {
            const seen = new Set(prev.map((m) => m.id));
            const merged = [...prev];
            for (const message of data.messages) {
              if (!seen.has(message.id)) {
                merged.push(message);
              }
            }
            return merged;
          });
          lastTimestampRef.current = data.timestamp;
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [user]);

  if (isJoining) {
    return (
      <div
        className="flex h-full items-center justify-center font-mono text-sm"
        style={{ backgroundColor: theme.colors.bg, color: theme.colors.text }}
      >
        <div>Joining chat room...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="flex h-full items-center justify-center font-mono text-sm"
        style={{
          backgroundColor: theme.colors.bg,
          color: theme.colors.textMessageSystem
        }}
      >
        <div>Failed to join chat room</div>
      </div>
    );
  }

  return (
    <div
      className="flex h-full flex-col font-mono text-sm"
      style={{ backgroundColor: theme.colors.bg, color: theme.colors.text }}
    >
      <div
        className="border-b-2 px-3 py-2 flex items-center justify-between"
        style={{
          backgroundColor: theme.colors.bgHeader,
          borderColor: theme.colors.borderHeader,
          color: theme.colors.textHeader
        }}
      >
        <div>
          Logged in as:{' '}
          <span
            className="font-bold"
            style={{ color: theme.colors.textUsername }}
          >
            {user.username}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            dispatchWindowEvent('desktop:open-child-window', {
              childWindowId: 'MIM_PREFERENCES',
              parentAppId: 'MIM'
            });
          }}
          className="p-1 hover:opacity-70 transition-opacity cursor-pointer"
          aria-label="Open preferences"
          title="Preferences"
          style={{ color: theme.colors.textTimestamp }}
        >
          <GearIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <div style={{ color: theme.colors.textPlaceholder }}>
            No messages yet. Start chatting!
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => {
              const getMessageStyles = () => {
                if (msg.isSystem) {
                  return {
                    bg: theme.colors.bgMessageSystem,
                    border: theme.colors.borderMessageSystem,
                    text: theme.colors.textMessageSystem
                  };
                }
                if (msg.userId === user.userId) {
                  return {
                    bg: theme.colors.bgMessageOwn,
                    border: theme.colors.borderMessageOwn,
                    text: theme.colors.textMessageOwn
                  };
                }
                return {
                  bg: theme.colors.bgMessageDefault,
                  border: theme.colors.borderMessageDefault,
                  text: theme.colors.text
                };
              };

              const messageStyles = getMessageStyles();

              return (
                <div
                  key={msg.id}
                  className="rounded border px-2 py-1"
                  style={{
                    backgroundColor: messageStyles.bg,
                    borderColor: messageStyles.border,
                    color: messageStyles.text
                  }}
                >
                  {!msg.isSystem && (
                    <div
                      className="text-xs font-bold"
                      style={{ color: theme.colors.textUsername }}
                    >
                      {msg.username}
                      <span
                        className="ml-2 font-normal"
                        style={{ color: theme.colors.textTimestamp }}
                      >
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`break-words ${msg.isSystem ? 'whitespace-pre-line text-xs' : ''}`}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={async (e: React.FormEvent) => {
          e.preventDefault();

          if (!user || !inputMessage.trim() || isSending) {
            return;
          }

          const trimmedMessage = inputMessage.trim();

          if (trimmedMessage.startsWith('/')) {
            const response = await handleCommand(trimmedMessage);
            if (response) {
              const systemMessage: ChatMessage = {
                id: `system-${Date.now()}`,
                userId: 'system',
                username: 'System',
                message: response,
                timestamp: Date.now(),
                isSystem: true
              };
              setMessages((prev) => [...prev, systemMessage]);
              setInputMessage('');
              inputRef.current?.focus();
            }
            return;
          }

          setIsSending(true);

          try {
            const response = await fetch('/api/chat/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                userId: user.userId,
                username: user.username,
                message: trimmedMessage
              })
            });

            const data = await response.json();

            if (data.success && data.message) {
              setInputMessage('');
              setMessages((prev) => [...prev, data.message]);
              inputRef.current?.focus();
            } else {
              console.error('Failed to send message:', data.error);
            }
          } catch (error) {
            console.error('Failed to send message:', error);
          } finally {
            setIsSending(false);
            inputRef.current?.focus();
          }
        }}
        className="border-t-2 p-3"
        style={{
          backgroundColor: theme.colors.bgHeader,
          borderColor: theme.colors.borderHeader
        }}
      >
        <div className="flex gap-2">
          <input
            type="text"
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            maxLength={500}
            className="flex-1 border-2 px-2 py-1 focus:outline-none focus:ring-2"
            style={{
              backgroundColor: theme.colors.bgInput,
              borderColor: theme.colors.borderInput,
              color: theme.colors.text
            }}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            className="border-2 px-4 py-1 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 transition-opacity"
            style={{
              backgroundColor: theme.colors.bgInput,
              borderColor: theme.colors.borderInput,
              color: theme.colors.text
            }}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
