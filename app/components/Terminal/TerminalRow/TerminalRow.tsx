'use client';

import { useMemo } from 'react';
import TerminalInfo from '../TerminalInfo/TerminalInfo';
import styles from '../Terminal.module.scss';

interface StringPart {
  isUrl: boolean;
  string: string;
}

interface TerminalRowProps {
  io: 'in' | 'out';
  command: string;
}

export default function TerminalRow({ io, command }: TerminalRowProps) {
  const commandParts = useMemo<StringPart[]>(() => {
    if (io === 'out') {
      // Naively finds first URL in output
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const match = command.match(urlRegex);

      if (match) {
        const url = match[0];
        const indexOfUrl = command.indexOf(url);

        const elementPreUrl = command.substring(0, indexOfUrl);
        const elementUrl = command.substring(indexOfUrl, indexOfUrl + url.length);
        const elementPostUrl = command.substring(
          indexOfUrl + url.length,
          command.length
        );

        return [
          { isUrl: false, string: elementPreUrl },
          { isUrl: true, string: elementUrl },
          { isUrl: false, string: elementPostUrl },
        ];
      }
    }
    return [{ isUrl: false, string: command }];
  }, [io, command]);

  return (
    <div className={styles['terminal-row']}>
      {io === 'in' && <TerminalInfo />}

      <span className={styles['terminal-row__history']}>
        {commandParts.map((substring, i) =>
          substring.isUrl ? (
            <a
              target="_blank"
              rel="noreferrer noopener"
              key={i}
              href={substring.string}
            >
              {substring.string}
            </a>
          ) : (
            substring.string
          )
        )}
      </span>
    </div>
  );
}
