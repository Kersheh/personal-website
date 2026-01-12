export interface CommandOptions {
  closeWindow?: (id: string) => void;
  windowId?: string;
  clearHistory?: () => void;
  args?: Array<string>;
}

export interface Command {
  cmd: string;
  description: string;
  run: (options?: CommandOptions) => string | Promise<string>;
}

export type CommandRegistry = Record<string, Command>;
