import github from './commands/github';
import linkedin from './commands/linkedin';

interface Command {
  cmd: string;
  run: () => string | Promise<string>;
}

interface Commands {
  [key: string]: Command;
}

const COMMANDS: Commands = {
  github: {
    cmd: 'github',
    run: github,
  },
  linkedin: {
    cmd: 'linkedin',
    run: linkedin,
  },
};

class CommandExecutor {
  static async submit(command: string): Promise<string> {
    try {
      return await COMMANDS[command].run();
    } catch {
      throw new Error(`command '${command}' not found`);
    }
  }
}

export default CommandExecutor;
