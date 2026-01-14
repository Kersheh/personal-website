'use client';

import { useRef, useEffect, useState } from 'react';
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
  const promptRef = useRef<HTMLSpanElement>(null);
  const [promptWidth, setPromptWidth] = useState(0);

  useEffect(() => {
    if (io === 'in' && promptRef.current) {
      setPromptWidth(promptRef.current.offsetWidth);
    }
  }, [io]);

  const commandParts: Array<StringPart> = (() => {
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
  })();

  if (io === 'in') {
    return (
      <div className="text-sm tracking-wider text-white/80 font-['Courier_new','Courier',monospace] relative select-text">
        <span ref={promptRef} className="absolute left-0 top-0">
          <TerminalInfo />
        </span>
        <div className="relative whitespace-pre-wrap wrap-break-word min-w-0 w-full">
          <span
            className="invisible block tracking-[1.5px]"
            style={{ textIndent: promptWidth + 8 }}
          >
            {command || ' '}
          </span>
          <span
            className="absolute top-0 left-0 tracking-[1.5px]"
            style={{ textIndent: promptWidth + 8 }}
          >
            {commandParts.map((substring, i) =>
              substring.isUrl ? (
                substring.string.startsWith('mailto:') ? (
                  <button
                    key={i}
                    onClick={() => (window.location.href = substring.string)}
                    className="underline cursor-pointer bg-transparent border-none text-inherit font-inherit p-0 hover:opacity-80"
                  >
                    {substring.string.substring(7)}
                  </button>
                ) : (
                  <a
                    target="_blank"
                    rel="noreferrer noopener"
                    key={i}
                    href={substring.string}
                    className="underline cursor-pointer hover:opacity-80"
                  >
                    {substring.string}
                  </a>
                )
              ) : (
                substring.string
              )
            )}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="text-sm tracking-wider text-white/80 font-['Courier_new','Courier',monospace] whitespace-pre-wrap wrap-break-word select-text">
      <span className="tracking-[1.5px]">
        {commandParts.map((substring, i) =>
          substring.isUrl ? (
            substring.string.startsWith('mailto:') ? (
              <button
                key={i}
                onClick={() => (window.location.href = substring.string)}
                className="underline cursor-pointer bg-transparent border-none text-inherit font-inherit p-0 hover:opacity-80"
              >
                {substring.string.substring(7)}
              </button>
            ) : (
              <a
                target="_blank"
                rel="noreferrer noopener"
                key={i}
                href={substring.string}
                className="underline cursor-pointer hover:opacity-80"
              >
                {substring.string}
              </a>
            )
          ) : (
            substring.string
          )
        )}
      </span>
    </div>
  );
};

export default TerminalRow;
