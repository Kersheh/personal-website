'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

interface MIMProps {
  height: number;
  isFocused: boolean;
}

const MIM = ({ height, isFocused }: MIMProps) => {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Array<ChatMessage>>(() => [
    {
      id: '1',
      sender: 'MIM-bot',
      text: 'Welcome to MIM — your retro chat nook.',
      timestamp: '09:00'
    },
    {
      id: '2',
      sender: 'MIM-bot',
      text: 'Say hi and we will flesh this out later.',
      timestamp: '09:01'
    }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const canSend = draft.trim().length > 0;

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSend) {
      return;
    }

    const now = new Date();
    const nextMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'You',
      text: draft.trim(),
      timestamp: now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setMessages((prev) => [...prev, nextMessage]);
    setDraft('');
  };

  const containerStyles = useMemo(() => ({ height: `${height}px` }), [height]);

  return (
    <div
      className="flex flex-col bg-onyx text-white border border-white/10 rounded-sm"
      style={containerStyles}
    >
      <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
        <div className="font-semibold tracking-wide select-none">MIM Chat</div>
        <div className="text-xs text-white/60 select-none">
          {isFocused ? 'Active' : 'Inactive'}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gradient-to-b from-black/30 to-black/10"
      >
        {messages.map((message) => (
          <div key={message.id} className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-white/50">
              {message.sender} · {message.timestamp}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm leading-relaxed">
              {message.text}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-white/10 px-3 py-2 flex items-center gap-2 bg-black/40"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-carnation"
        />
        <button
          type="submit"
          disabled={!canSend}
          className="px-3 py-2 text-sm font-semibold bg-carnation text-black rounded-sm disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition select-none"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MIM;
