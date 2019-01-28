import React from 'react';

import '../Terminal.scss';

export default class TerminalRow extends React.Component {
  static INFO = 'guest@matthewbreckon.com $';

  render() {
    return (
      <span className='terminal-row__info'>{TerminalRow.INFO}</span>
    );
  }
}
