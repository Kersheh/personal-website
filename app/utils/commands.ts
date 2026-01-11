import github from './commands/github';
import linkedin from './commands/linkedin';
import email from './commands/email';
import help from './commands/help';

interface Command {
  cmd: string;
  run: () => string | Promise<string>;
}

const COMMANDS: Record<string, Command> = {
  github: {
    cmd: 'github',
    run: github
  },
  linkedin: {
    cmd: 'linkedin',
    run: linkedin
  },
  email: {
    cmd: 'email',
    run: email
  },
  help: {
    cmd: 'help',
    run: help
  }
};

const submit = async (command: string): Promise<string> => {
  try {
    return await COMMANDS[command].run();
  } catch {
    throw new Error(`${command}: command not found`);
  }
};

const CommandExecutor = { submit };

export default CommandExecutor;
