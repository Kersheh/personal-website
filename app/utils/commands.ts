import github from './commands/github';
import linkedin from './commands/linkedin';
import email from './commands/email';
import exit from './commands/exit';
import clear from './commands/clear';
import shutdown from './commands/shutdown';
import ls from './commands/ls';
import cd from './commands/cd';
import pwd from './commands/pwd';
import rm from './commands/rm';
import restore from './commands/restore';
import { CommandRegistry } from './types';

export const COMMANDS: CommandRegistry = {
  github: {
    cmd: 'github',
    description: 'Open my GitHub profile',
    run: github
  },
  linkedin: {
    cmd: 'linkedin',
    description: 'Open my LinkedIn profile',
    run: linkedin
  },
  email: {
    cmd: 'email',
    description: 'Send me an email',
    run: email
  },
  ls: {
    cmd: 'ls',
    description: 'List directory contents',
    run: ls
  },
  cd: {
    cmd: 'cd',
    description: 'Change directory',
    run: cd
  },
  pwd: {
    cmd: 'pwd',
    description: 'Print working directory',
    run: pwd
  },
  rm: {
    cmd: 'rm',
    description: 'Remove files or directories',
    run: rm
  },
  restore: {
    cmd: 'restore',
    description: 'Restore system to last backup',
    run: restore
  },
  clear: {
    cmd: 'clear',
    description: 'Clear the terminal screen',
    run: clear
  },
  help: {
    cmd: 'help',
    description: 'Show this help message',
    run: () => {
      const header = [
        'MNU bash, version 1.0.0',
        'These shell commands are defined internally. Type `help` to see this list.',
        ''
      ];

      const commandLines = Object.values(COMMANDS)
        .filter((cmd) => cmd.cmd !== 'exit' && cmd.cmd !== 'help')
        .map((cmd) => {
          const padding = ' '.repeat(Math.max(1, 9 - cmd.cmd.length));
          return `${cmd.cmd}${padding}- ${cmd.description}`;
        });

      // Add exit at the bottom
      const exitCmd = COMMANDS.exit;
      const exitPadding = ' '.repeat(Math.max(1, 9 - exitCmd.cmd.length));
      commandLines.push(`${exitCmd.cmd}${exitPadding}- ${exitCmd.description}`);

      return [...header, ...commandLines].join('\n');
    }
  },
  exit: {
    cmd: 'exit',
    description: 'Close this terminal',
    run: exit
  },
  shutdown: {
    cmd: 'shutdown',
    description: 'Power off the system',
    run: shutdown
  }
};

interface SubmitOptions {
  closeWindow?: (id: string) => void;
  windowId?: string;
  clearHistory?: () => void;
}

const submit = async (
  input: string,
  options: SubmitOptions = {}
): Promise<string> => {
  const trimmedInput = input.trim();

  // parse command and arguments, respecting quotes
  const { parts, current } = [...trimmedInput].reduce<{
    parts: Array<string>;
    current: string;
    inQuotes: boolean;
    quoteChar: string;
  }>(
    (state, char) => {
      if ((char === '"' || char === "'") && !state.inQuotes) {
        return { ...state, inQuotes: true, quoteChar: char };
      }

      if (char === state.quoteChar && state.inQuotes) {
        return { ...state, inQuotes: false, quoteChar: '' };
      }

      if (char === ' ' && !state.inQuotes) {
        return state.current
          ? { ...state, parts: [...state.parts, state.current], current: '' }
          : state;
      }

      return { ...state, current: state.current + char };
    },
    { parts: [], current: '', inQuotes: false, quoteChar: '' }
  );

  const allParts = current ? [...parts, current] : parts;
  const command = allParts[0];
  const args = allParts.slice(1);

  try {
    return await COMMANDS[command].run({ ...options, args });
  } catch {
    throw new Error(`${command}: command not found (try \`help\`)`);
  }
};

const CommandExecutor = { submit, COMMANDS };

export default CommandExecutor;
