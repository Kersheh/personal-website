import github from './commands/github';

const COMMANDS = {
  github: {
    cmd: 'github',
    run: github
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
