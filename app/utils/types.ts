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

export type MenuItemAction =
  | { type: 'onClick'; handler: () => void }
  | { type: 'openChildWindow'; childWindowId: string };

export interface MenuItem {
  label: string;
  action: MenuItemAction;
}

export interface MenuSection {
  title: 'App' | 'File';
  items: Array<MenuItem>;
}
