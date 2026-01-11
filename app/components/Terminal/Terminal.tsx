'use client';

import { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { isArray } from 'lodash';
import TerminalRow from './TerminalRow/TerminalRow';
import TerminalInfo from './TerminalInfo/TerminalInfo';
import commands from '../../helpers/commands';
import styles from './Terminal.module.scss';

interface HistoryItem {
  std: 'in' | 'out';
  msg: string;
}

interface TerminalProps {
  autoFocus: boolean;
}

export default function Terminal({ autoFocus }: TerminalProps) {
  const [value, setValue] = useState('');
  const [bufferValue, setBufferValue] = useState('');
  const [isFocused, setIsFocused] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [cursorIndex, setCursorIndex] = useState(0);
  const [cursorLocationPx, setCursorLocationPx] = useState(0);
  const [inputLengthPx, setInputLengthPx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateInputLength = (characters: number, width: number) => {
    setInputLengthPx(characters * width);
  };

  const updateCursorLocation = (length: number, index: number) => {
    setCursorLocationPx((length - index) * -10);
  };

  const onTerminalClick = () => {
    inputRef.current?.focus();
  };

  const onBlur = () => {
    setIsFocused(false);
  };

  const onFocus = () => {
    setIsFocused(true);
  };

  const updateInput = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setBufferValue(e.target.value);
    setHistoryIndex(history.length);
    setCursorIndex(cursorIndex + 1);
    updateInputLength(e.target.value.length, 10);
  };

  const onKeyPress = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const inputValue = (e.target as HTMLInputElement).value;

      setValue('');
      setBufferValue('');
      setHistory([...history, { std: 'in', msg: inputValue }]);
      setHistoryIndex(historyIndex + 1);
      setCursorIndex(0);
      updateInputLength(0, 0);
      updateCursorLocation(0, 0);

      try {
        const response = await commands.submit(inputValue);
        const messages = isArray(response) ? response : [response];

        messages.forEach((message) => {
          setHistory((prev) => [...prev, { std: 'out', msg: message }]);
        });
      } catch (err) {
        setHistory((prev) => [
          ...prev,
          { std: 'out', msg: (err as Error).message },
        ]);
      }
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowUp': {
        if (historyIndex > 0) {
          const prevValue = history[historyIndex - 1].msg;

          setValue(prevValue);
          setHistoryIndex(historyIndex - 1);
          setCursorIndex(0);
          updateInputLength(prevValue.length, 10);
          updateCursorLocation(prevValue.length, 0);
        }
        break;
      }
      case 'ArrowDown': {
        if (historyIndex === history.length - 1) {
          setValue(bufferValue);
          setHistoryIndex(historyIndex + 1);
          setCursorIndex(bufferValue.length);
          updateInputLength(bufferValue.length, 10);
          updateCursorLocation(bufferValue.length, bufferValue.length);
        } else if (historyIndex < history.length - 1) {
          const nextValue = history[historyIndex + 1].msg;

          setValue(nextValue);
          setHistoryIndex(historyIndex + 1);
          setCursorIndex(nextValue.length);
          updateInputLength(nextValue.length, 10);
          updateCursorLocation(nextValue.length, nextValue.length);
        }
        break;
      }
      case 'ArrowLeft': {
        if (cursorIndex > 0) {
          setCursorIndex(cursorIndex - 1);
          updateCursorLocation(value.length, cursorIndex - 1);
        }
        break;
      }
      case 'ArrowRight': {
        if (cursorIndex < value.length) {
          setCursorIndex(cursorIndex + 1);
          updateCursorLocation(value.length, cursorIndex + 1);
        }
        break;
      }
    }
  };

  return (
    <div className={styles.terminal}>
      <div className={styles['terminal-body']} onClick={onTerminalClick}>
        {history.map((item, i) => (
          <TerminalRow io={item.std} key={i} command={item.msg} />
        ))}

        <div className={styles['terminal-row']}>
          <TerminalInfo />
          <input
            className={styles['terminal-row__input']}
            value={value}
            ref={inputRef}
            style={{ width: inputLengthPx }}
            onChange={updateInput}
            type="text"
            spellCheck={false}
            maxLength={60}
            autoFocus={autoFocus}
            autoComplete="off"
            onBlur={onBlur}
            onFocus={onFocus}
            onKeyPress={onKeyPress}
            onKeyDown={onKeyDown}
          />
          <span
            className={styles['terminal-row__cursor']}
            style={{ left: cursorLocationPx }}
            data-disabled={!isFocused}
          />
        </div>
      </div>
    </div>
  );
}
