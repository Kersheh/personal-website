'use client';

import {
  useState,
  useRef,
  KeyboardEvent,
  ChangeEvent,
  useEffect,
  useCallback
} from 'react';
import { isArray } from 'lodash';
import TerminalRow from './TerminalRow/TerminalRow';
import TerminalInfo from './TerminalInfo/TerminalInfo';
import commands from '../../utils/commands';

interface HistoryItem {
  std: 'in' | 'out';
  msg: string;
}

interface TerminalProps {
  autoFocus: boolean;
}

const CHAR_WIDTH = 10;

const Terminal = ({ autoFocus }: TerminalProps) => {
  const [value, setValue] = useState('');
  const [bufferValue, setBufferValue] = useState('');
  const [isFocused, setIsFocused] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [cursorOffset, setCursorOffset] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateCursorPosition = useCallback(() => {
    if (inputRef.current) {
      const cursorPos = inputRef.current.selectionStart || 0;
      const inputLength = inputRef.current.value.length;
      const offset = (inputLength - cursorPos) * -CHAR_WIDTH;
      setCursorOffset(offset);
    }
  }, []);

  useEffect(() => {
    updateCursorPosition();
  }, [updateCursorPosition]);

  return (
    <div className="[&_a]:text-white/70 [&_a:hover]:text-[#009fef]">
      <div
        className="p-2.5 h-[360px] overflow-x-hidden overflow-y-scroll"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((item, i) => (
          <TerminalRow io={item.std} key={i} command={item.msg} />
        ))}

        <div className="h-[18px] text-sm tracking-wider text-white/80 font-['Courier_new',_'Courier',_monospace]">
          <TerminalInfo />
          <input
            className="font-['Courier_new',_'Courier',_monospace] text-sm tracking-[1.5px] p-0 border-none bg-transparent inline-block text-transparent [text-shadow:0_0_0_white] relative left-[0.1px] focus:outline-none"
            value={value}
            ref={inputRef}
            style={{ width: value.length * CHAR_WIDTH }}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setValue(e.target.value);
              setBufferValue(e.target.value);
              setHistoryIndex(history.length);
              setTimeout(updateCursorPosition, 0);
            }}
            type="text"
            spellCheck={false}
            maxLength={60}
            autoFocus={autoFocus}
            autoComplete="off"
            onBlur={() => setIsFocused(false)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={async (e: KeyboardEvent<HTMLInputElement>) => {
              if (
                [
                  'ArrowLeft',
                  'ArrowRight',
                  'Home',
                  'End',
                  'Backspace',
                  'Delete'
                ].includes(e.key)
              ) {
                setTimeout(updateCursorPosition, 0);
              }

              if (e.key === 'Enter') {
                e.preventDefault();
                const inputValue = (e.target as HTMLInputElement).value;

                setValue('');
                setBufferValue('');
                setHistory([...history, { std: 'in', msg: inputValue }]);
                setHistoryIndex(historyIndex + 1);
                setCursorOffset(0);

                if (!inputValue.trim()) {
                  return;
                }

                try {
                  const response = await commands.submit(inputValue);
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
                return;
              }

              switch (e.key) {
                case 'ArrowUp':
                  e.preventDefault();
                  if (historyIndex > 0) {
                    const prevValue = history[historyIndex - 1].msg;
                    setValue(prevValue);
                    setHistoryIndex(historyIndex - 1);
                    setTimeout(() => {
                      if (inputRef.current) {
                        inputRef.current.selectionStart = prevValue.length;
                        inputRef.current.selectionEnd = prevValue.length;
                        updateCursorPosition();
                      }
                    }, 0);
                  }
                  break;

                case 'ArrowDown':
                  e.preventDefault();
                  if (historyIndex === history.length - 1) {
                    setValue(bufferValue);
                    setHistoryIndex(historyIndex + 1);
                    setTimeout(() => {
                      if (inputRef.current) {
                        inputRef.current.selectionStart = bufferValue.length;
                        inputRef.current.selectionEnd = bufferValue.length;
                        updateCursorPosition();
                      }
                    }, 0);
                  } else if (historyIndex < history.length - 1) {
                    const nextValue = history[historyIndex + 1].msg;
                    setValue(nextValue);
                    setHistoryIndex(historyIndex + 1);
                    setTimeout(() => {
                      if (inputRef.current) {
                        inputRef.current.selectionStart = nextValue.length;
                        inputRef.current.selectionEnd = nextValue.length;
                        updateCursorPosition();
                      }
                    }, 0);
                  }
                  break;
              }
            }}
            onClick={updateCursorPosition}
          />
          <span
            className="inline-block relative bg-white align-top w-2.5 h-[18px] data-[disabled=true]:hidden animate-[blink_1s_step-end_infinite]"
            style={{ left: cursorOffset }}
            data-disabled={!isFocused}
          />
        </div>
      </div>
    </div>
  );
};

export default Terminal;
