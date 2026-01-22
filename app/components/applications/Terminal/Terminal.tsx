'use client';

import { useState, useRef, KeyboardEvent, ChangeEvent, useEffect } from 'react';
import { isArray } from 'lodash';
import TerminalRow from './TerminalRow/TerminalRow';
import TerminalInfo from './TerminalInfo/TerminalInfo';
import commands from '@/app/utils/commands';
import { useFileSystemStore } from '@/app/store/fileSystemStore';

interface HistoryItem {
  std: 'in' | 'out';
  msg: string;
}

interface TerminalProps {
  autoFocus: boolean;
  closeWindow: (id: string) => void;
  windowId: string;
  height?: number;
}

const Terminal = ({
  autoFocus,
  closeWindow,
  windowId,
  height
}: TerminalProps) => {
  const [value, setValue] = useState('');
  const [bufferValue, setBufferValue] = useState('');
  const [history, setHistory] = useState<Array<HistoryItem>>([]);
  const [inputHistory, setInputHistory] = useState<Array<string>>([]);
  const [inputHistoryIndex, setInputHistoryIndex] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLSpanElement>(null);
  const [promptWidth, setPromptWidth] = useState(0);

  // reset directory to home on mount
  useEffect(() => {
    useFileSystemStore.getState().setCurrentDirectory('~');
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [history, value]);

  useEffect(() => {
    if (promptRef.current) {
      setPromptWidth(promptRef.current.offsetWidth);
    }
  }, []);

  const contentHeight = Math.max(120, height ?? 360);

  return (
    <div className="[&_a]:text-white/70 [&_a:hover]:text-[#009fef]">
      <div
        ref={scrollContainerRef}
        className="p-2.5 overflow-y-scroll"
        style={{ height: contentHeight, willChange: 'height' }}
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((item, i) => (
          <TerminalRow io={item.std} key={i} command={item.msg} />
        ))}

        <div className="text-sm tracking-wider text-white/80 font-['Courier_new','Courier',monospace] relative select-text">
          <span className="absolute left-0 top-0">
            <TerminalInfo ref={promptRef} />
          </span>
          <div className="min-w-0 w-full relative">
            <span
              className="invisible whitespace-pre-wrap break-all tracking-[1.5px] block"
              style={{ textIndent: promptWidth + 8 }}
            >
              {value || ' '}
            </span>
            <textarea
              className="font-['Courier_new','Courier',monospace] text-sm tracking-[1.5px] p-0 border-none bg-transparent text-white/80 absolute top-0 left-0 w-full resize-none focus:outline-hidden caret-white whitespace-pre-wrap break-all"
              value={value}
              ref={inputRef}
              style={{ textIndent: `${promptWidth + 8}px`, height: '100%' }}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                const newValue = e.target.value.replace(/\n/g, '');
                setValue(newValue);
                setBufferValue(newValue);
                setInputHistoryIndex(inputHistory.length);
              }}
              spellCheck={false}
              autoFocus={autoFocus}
              autoComplete="off"
              autoCapitalize="off"
              onKeyDown={async (e: KeyboardEvent<HTMLTextAreaElement>) => {
                switch (e.key) {
                  case 'Enter':
                    e.preventDefault();
                    const inputValue = (e.target as HTMLTextAreaElement).value;

                    if (!inputValue.trim()) {
                      setValue('');
                      setBufferValue('');
                      setHistory([
                        ...history,
                        { std: 'in', msg: '' },
                        {
                          std: 'out',
                          msg: 'Type `help` to see available commands'
                        }
                      ]);
                      return;
                    }

                    setValue('');
                    setBufferValue('');
                    setHistory([...history, { std: 'in', msg: inputValue }]);
                    setInputHistory([...inputHistory, inputValue]);
                    setInputHistoryIndex(inputHistory.length + 1);

                    try {
                      const response = await commands.submit(inputValue, {
                        closeWindow,
                        windowId,
                        clearHistory: () => setHistory([])
                      });
                      const messages = isArray(response)
                        ? response
                        : response.split('\n');

                      messages.forEach((message) => {
                        setHistory((prev) => [
                          ...prev,
                          { std: 'out', msg: message }
                        ]);
                      });
                    } catch (err) {
                      setHistory((prev) => [
                        ...prev,
                        { std: 'out', msg: (err as Error).message }
                      ]);
                    }
                    break;

                  case 'ArrowUp':
                    e.preventDefault();
                    if (inputHistoryIndex > 0) {
                      const prevValue = inputHistory[inputHistoryIndex - 1];
                      setValue(prevValue);
                      setInputHistoryIndex(inputHistoryIndex - 1);
                      setTimeout(() => {
                        if (inputRef.current) {
                          inputRef.current.selectionStart = prevValue.length;
                          inputRef.current.selectionEnd = prevValue.length;
                        }
                      }, 0);
                    }
                    break;

                  case 'ArrowDown':
                    e.preventDefault();
                    if (inputHistoryIndex === inputHistory.length - 1) {
                      setValue(bufferValue);
                      setInputHistoryIndex(inputHistory.length);
                      setTimeout(() => {
                        if (inputRef.current) {
                          inputRef.current.selectionStart = bufferValue.length;
                          inputRef.current.selectionEnd = bufferValue.length;
                        }
                      }, 0);
                    } else if (inputHistoryIndex < inputHistory.length - 1) {
                      const nextValue = inputHistory[inputHistoryIndex + 1];
                      setValue(nextValue);
                      setInputHistoryIndex(inputHistoryIndex + 1);
                      setTimeout(() => {
                        if (inputRef.current) {
                          inputRef.current.selectionStart = nextValue.length;
                          inputRef.current.selectionEnd = nextValue.length;
                        }
                      }, 0);
                    }
                    break;
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
