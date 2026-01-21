export interface MIMTheme {
  id: string;
  name: string;
  colors: {
    // Background colors
    bg: string;
    bgHeader: string;
    bgInput: string;

    // Message backgrounds
    bgMessageDefault: string;
    bgMessageOwn: string;
    bgMessageSystem: string;

    // Border colors
    borderHeader: string;
    borderInput: string;
    borderMessageDefault: string;
    borderMessageOwn: string;
    borderMessageSystem: string;

    // Text colors
    text: string;
    textHeader: string;
    textUsername: string;
    textTimestamp: string;
    textPlaceholder: string;
    textMessageOwn: string;
    textMessageSystem: string;

    // Accent colors
    accent: string;
  };
}

export const MIM_THEMES: Record<string, MIMTheme> = {
  slate: {
    id: 'slate',
    name: 'Slate (Default)',
    colors: {
      bg: '#0f172a',
      bgHeader: '#1e293b',
      bgInput: '#1e293b',
      bgMessageDefault: '#1e293b',
      bgMessageOwn: '#0c4a6e',
      bgMessageSystem: 'rgba(113, 63, 18, 0.3)',
      borderHeader: '#334155',
      borderInput: '#475569',
      borderMessageDefault: '#334155',
      borderMessageOwn: '#075985',
      borderMessageSystem: '#a16207',
      text: '#f1f5f9',
      textHeader: '#f1f5f9',
      textUsername: '#e0f2fe',
      textTimestamp: '#cbd5e1',
      textPlaceholder: '#64748b',
      textMessageOwn: '#e0f2fe',
      textMessageSystem: '#fef3c7',
      accent: '#0ea5e9'
    }
  },
  atom: {
    id: 'atom',
    name: 'Atom One Dark',
    colors: {
      bg: '#282c34',
      bgHeader: '#21252b',
      bgInput: '#21252b',
      bgMessageDefault: '#21252b',
      bgMessageOwn: '#2c313c',
      bgMessageSystem: 'rgba(209, 154, 102, 0.15)',
      borderHeader: '#181a1f',
      borderInput: '#3e4451',
      borderMessageDefault: '#181a1f',
      borderMessageOwn: '#61afef',
      borderMessageSystem: '#e5c07b',
      text: '#abb2bf',
      textHeader: '#abb2bf',
      textUsername: '#56b6c2',
      textTimestamp: '#5c6370',
      textPlaceholder: '#5c6370',
      textMessageOwn: '#98c379',
      textMessageSystem: '#e5c07b',
      accent: '#c678dd'
    }
  },
  solarized: {
    id: 'solarized',
    name: 'Solarized Dark',
    colors: {
      bg: '#002b36',
      bgHeader: '#073642',
      bgInput: '#073642',
      bgMessageDefault: '#073642',
      bgMessageOwn: '#094453',
      bgMessageSystem: 'rgba(181, 137, 0, 0.15)',
      borderHeader: '#586e75',
      borderInput: '#586e75',
      borderMessageDefault: '#586e75',
      borderMessageOwn: '#268bd2',
      borderMessageSystem: '#b58900',
      text: '#839496',
      textHeader: '#93a1a1',
      textUsername: '#2aa198',
      textTimestamp: '#586e75',
      textPlaceholder: '#586e75',
      textMessageOwn: '#268bd2',
      textMessageSystem: '#b58900',
      accent: '#268bd2'
    }
  },
  rosepine: {
    id: 'rosepine',
    name: 'Rosé Pine',
    colors: {
      bg: '#191724',
      bgHeader: '#1f1d2e',
      bgInput: '#1f1d2e',
      bgMessageDefault: '#1f1d2e',
      bgMessageOwn: '#26233a',
      bgMessageSystem: 'rgba(246, 193, 119, 0.15)',
      borderHeader: '#403d52',
      borderInput: '#524f67',
      borderMessageDefault: '#403d52',
      borderMessageOwn: '#eb6f92',
      borderMessageSystem: '#f6c177',
      text: '#e0def4',
      textHeader: '#e0def4',
      textUsername: '#9ccfd8',
      textTimestamp: '#908caa',
      textPlaceholder: '#6e6a86',
      textMessageOwn: '#ebbcba',
      textMessageSystem: '#f6c177',
      accent: '#eb6f92'
    }
  },
  monokai: {
    id: 'monokai',
    name: 'Monokai Pro',
    colors: {
      bg: '#2d2a2e',
      bgHeader: '#221f22',
      bgInput: '#221f22',
      bgMessageDefault: '#221f22',
      bgMessageOwn: '#3a3740',
      bgMessageSystem: 'rgba(255, 216, 102, 0.15)',
      borderHeader: '#19181a',
      borderInput: '#5b595c',
      borderMessageDefault: '#19181a',
      borderMessageOwn: '#fc9867',
      borderMessageSystem: '#ffd866',
      text: '#fcfcfa',
      textHeader: '#fcfcfa',
      textUsername: '#78dce8',
      textTimestamp: '#939293',
      textPlaceholder: '#727072',
      textMessageOwn: '#fc9867',
      textMessageSystem: '#ffd866',
      accent: '#fc9867'
    }
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula',
    colors: {
      bg: '#282a36',
      bgHeader: '#21222c',
      bgInput: '#21222c',
      bgMessageDefault: '#21222c',
      bgMessageOwn: '#44475a',
      bgMessageSystem: 'rgba(241, 250, 140, 0.15)',
      borderHeader: '#191a21',
      borderInput: '#6272a4',
      borderMessageDefault: '#44475a',
      borderMessageOwn: '#bd93f9',
      borderMessageSystem: '#f1fa8c',
      text: '#f8f8f2',
      textHeader: '#f8f8f2',
      textUsername: '#8be9fd',
      textTimestamp: '#6272a4',
      textPlaceholder: '#6272a4',
      textMessageOwn: '#ff79c6',
      textMessageSystem: '#f1fa8c',
      accent: '#bd93f9'
    }
  },
  nord: {
    id: 'nord',
    name: 'Nord',
    colors: {
      bg: '#2e3440',
      bgHeader: '#3b4252',
      bgInput: '#3b4252',
      bgMessageDefault: '#3b4252',
      bgMessageOwn: '#434c5e',
      bgMessageSystem: 'rgba(235, 203, 139, 0.15)',
      borderHeader: '#4c566a',
      borderInput: '#4c566a',
      borderMessageDefault: '#4c566a',
      borderMessageOwn: '#88c0d0',
      borderMessageSystem: '#ebcb8b',
      text: '#eceff4',
      textHeader: '#eceff4',
      textUsername: '#8fbcbb',
      textTimestamp: '#4c566a',
      textPlaceholder: '#4c566a',
      textMessageOwn: '#88c0d0',
      textMessageSystem: '#ebcb8b',
      accent: '#81a1c1'
    }
  }
};

export const getTheme = (themeId: string): MIMTheme => {
  return MIM_THEMES[themeId] || MIM_THEMES.slate;
};

export const getThemeList = (): Array<{ id: string; name: string }> => {
  return Object.values(MIM_THEMES).map((theme) => ({
    id: theme.id,
    name: theme.name
  }));
};
