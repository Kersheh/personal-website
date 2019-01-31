import github from './commands/github';
import linkedin from './commands/linkedin';

const COMMANDS = {
  github: {
    cmd: 'github',
    run: github
  },
  linkedin: {
    cmd: 'linkedin',
    run: linkedin
  }
};

export default class Commands {
  static async submit(command) {
    try {
      return COMMANDS[command].run();
    } catch(err) {
      // console.log(err); // ignore actual errors for now
      throw new Error(`command '${command}' not found`);
    }
  }
}
