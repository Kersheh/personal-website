'use client';

import { useState, useEffect, useRef } from 'react';
import { GearIcon } from '@/app/components/atomic/icons';
import {
  useWindowEvent,
  dispatchWindowEvent
} from '@/app/hooks/useWindowEvent';
import { useMIMPreferencesStore } from './store/preferencesStore';

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
    description: 'Clear all chat messages',
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
  const use24HourFormat = useMIMPreferencesStore(
    (state) => state.use24HourFormat
  );

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

      hasJoinedRef.current = true;

      try {
        const response = await fetch('/api/chat/join', {
          method: 'POST'
        });
        const data = await response.json();

        if (data.success) {
          setUser({ userId: data.userId, username: data.username });
          setIsJoining(false);
        }
      } catch (error) {
        console.error('Failed to join chat:', error);
        hasJoinedRef.current = false;
        setIsJoining(false);
      }
    };

    joinChat();
  }, []);

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
      <div className="flex h-full items-center justify-center bg-slate-900 font-mono text-sm">
        <div className="text-slate-100">Joining chat room...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-900 font-mono text-sm text-red-300">
        <div>Failed to join chat room</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-slate-900 font-mono text-sm text-slate-100">
      <div className="border-b-2 border-slate-700 bg-slate-800 px-3 py-2 flex items-center justify-between">
        <div className="text-slate-100">
          Logged in as:{' '}
          <span className="font-bold text-sky-300">{user.username}</span>
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
        >
          <GearIcon className="w-4 h-4 text-slate-300" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <div className="text-slate-500">No messages yet. Start chatting!</div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded border px-2 py-1 ${
                  msg.isSystem
                    ? 'border-yellow-700 bg-yellow-900/30 text-yellow-100'
                    : msg.userId === user.userId
                      ? 'border-sky-700 bg-sky-900 text-sky-100'
                      : 'border-slate-700 bg-slate-800 text-slate-100'
                }`}
              >
                {!msg.isSystem && (
                  <div className="text-xs font-bold text-slate-200">
                    {msg.username}
                    <span className="ml-2 font-normal text-slate-400">
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
            ))}
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
        className="border-t-2 border-slate-700 bg-slate-800 p-3"
      >
        <div className="flex gap-2">
          <input
            type="text"
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            maxLength={500}
            className="flex-1 border-2 border-slate-600 bg-slate-800 px-2 py-1 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            className="border-2 border-slate-500 bg-slate-700 px-4 py-1 text-slate-100 hover:bg-slate-600 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800 disabled:text-slate-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
