'use client';

import { useMemo } from 'react';
import TerminalInfo from '../TerminalInfo/TerminalInfo';

interface StringPart {
  isUrl: boolean;
  string: string;
}

interface TerminalRowProps {
  io: 'in' | 'out';
  command: string;
}

const TerminalRow = ({ io, command }: TerminalRowProps) => {
  const commandParts = useMemo<StringPart[]>(() => {
    if (io === 'out') {
      const urlRegex = /(https?:\/\/[^\s]+|mailto:[^\s]+)/g;
      const match = command.match(urlRegex);

      if (match) {
        const url = match[0];
        const indexOfUrl = command.indexOf(url);

        const elementPreUrl = command.substring(0, indexOfUrl);
        const elementUrl = command.substring(
          indexOfUrl,
          indexOfUrl + url.length
        );
        const elementPostUrl = command.substring(
          indexOfUrl + url.length,
          command.length
        );

        return [
          { isUrl: false, string: elementPreUrl },
          { isUrl: true, string: elementUrl },
          { isUrl: false, string: elementPostUrl }
        ];
      }
    }
    return [{ isUrl: false, string: command }];
  }, [io, command]);

  return (
    <div className="text-sm tracking-wider text-white/80 font-['Courier_new',_'Courier',_monospace] whitespace-pre-wrap break-words">
      {io === 'in' && <TerminalInfo />}

      <span className="tracking-[1.5px]">
        {commandParts.map((substring, i) =>
          substring.isUrl ? (
            <a
              target="_blank"
              rel="noreferrer noopener"
              key={i}
              href={substring.string}
            >
              {substring.string.startsWith('mailto:')
                ? substring.string.substring(7)
                : substring.string}
            </a>
          ) : (
            substring.string
          )
        )}
      </span>
    </div>
  );
};

export default TerminalRow;
