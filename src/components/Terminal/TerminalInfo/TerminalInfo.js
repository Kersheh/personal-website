import React from 'react';

import '../Terminal.scss';

export default class TerminalInfo extends React.Component {
  static displayName = 'TerminalInfo';
  static INFO = 'guest@matthewbreckon.com $';

  render() {
    return (
      <span className='terminal-row__info'>{TerminalInfo.INFO}</span>
    );
  }
}
