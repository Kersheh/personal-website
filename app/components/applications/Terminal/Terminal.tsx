'use client';

import { useState, useRef, KeyboardEvent, ChangeEvent, useEffect } from 'react';
import { isArray } from 'lodash';
import TerminalRow from './TerminalRow/TerminalRow';
import TerminalInfo from './TerminalInfo/TerminalInfo';
import commands, { COMMANDS } from '@/app/utils/commands';
import { useFileSystemStore } from '@/app/store/fileSystemStore';
import { DESKTOP_ITEMS } from '@/app/core/Desktop/desktopItems';

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

  // tab completion helper
  const handleTabCompletion = () => {
    const input = value.trim();
    if (!input) {
      return;
    }

    const parts = input.split(' ');
    const isFirstWord = parts.length === 1;

    if (isFirstWord) {
      // command completion
      const partial = parts[0];
      const matchingCommands = Object.keys(COMMANDS).filter((cmd) =>
        cmd.startsWith(partial)
      );

      if (matchingCommands.length === 1) {
        setValue(matchingCommands[0] + ' ');
        setBufferValue(matchingCommands[0] + ' ');
      } else if (matchingCommands.length > 1) {
        // show all matching commands
        setHistory([
          ...history,
          { std: 'in', msg: value },
          { std: 'out', msg: matchingCommands.join('  ') }
        ]);
      }
    } else {
      // file/directory completion
      const command = parts[0];
      const currentDirectory = useFileSystemStore.getState().currentDirectory;
      const desktopItems = useFileSystemStore.getState().desktopItems;

      // only complete files for commands that work with files/directories
      const fileCommands = ['rm', 'cd', 'ls'];
      if (!fileCommands.includes(command)) {
        return;
      }

      let completionOptions: Array<string> = [];

      if (command === 'cd' && currentDirectory === '~') {
        completionOptions = ['Desktop'];
      } else if (
        (command === 'rm' || command === 'ls') &&
        currentDirectory === '~/Desktop'
      ) {
        // get file/directory names from desktop items
        const itemMap = DESKTOP_ITEMS.reduce<Record<string, string>>(
          (acc, item) => {
            if (desktopItems.includes(item.id)) {
              acc[item.id] = item.label;
            }
            return acc;
          },
          {}
        );
        completionOptions = Object.values(itemMap);
      }

      if (completionOptions.length === 0) {
        return;
      }

      // get the partial argument (last word in input)
      const partial = parts[parts.length - 1];
      const matchingOptions = completionOptions.filter((opt) =>
        opt.toLowerCase().startsWith(partial.toLowerCase())
      );

      if (matchingOptions.length === 1) {
        const match = matchingOptions[0];
        const needsQuotes = match.includes(' ');
        const completedArg = needsQuotes ? `'${match}'` : match;

        // replace last word with completion
        const newValue = [...parts.slice(0, -1), completedArg].join(' ') + ' ';
        setValue(newValue);
        setBufferValue(newValue);
      } else if (matchingOptions.length > 1) {
        // show all matching options
        setHistory([
          ...history,
          { std: 'in', msg: value },
          { std: 'out', msg: matchingOptions.join('  ') }
        ]);
      }
    }
  };

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
                  case 'Tab':
                    e.preventDefault();
                    handleTabCompletion();
                    break;

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
