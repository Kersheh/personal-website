import github from './commands/github';
import linkedin from './commands/linkedin';
import email from './commands/email';
import exit from './commands/exit';
import clear from './commands/clear';
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
  exit: {
    cmd: 'exit',
    description: 'Close this terminal',
    run: exit
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

      const commandLines = Object.values(COMMANDS).map((cmd) => {
        const padding = ' '.repeat(Math.max(1, 9 - cmd.cmd.length));
        return `${cmd.cmd}${padding}- ${cmd.description}`;
      });

      return [...header, ...commandLines].join('\n');
    }
  }
};

const submit = async (
  command: string,
  closeWindow?: (id: string) => void,
  windowId?: string,
  clearHistory?: () => void
): Promise<string> => {
  try {
    return await COMMANDS[command].run({ closeWindow, windowId, clearHistory });
  } catch {
    throw new Error(`${command}: command not found (try help)`);
  }
};

const CommandExecutor = { submit, COMMANDS };

export default CommandExecutor;
