import React from 'react';
import { fill } from 'lodash';
import Window from './Window/Window';

import './App.scss';

export default class App extends React.Component {
  static displayName = 'App';

  constructor() {
    super();

    this.state = {
      windows: fill(Array(2), { isFocused: false }).map((window, i) => ({ isFocused: i === 0 }))
    };
  }

  updateWindows = (i) => {
    const windows = this.state.windows.map(() => ({ isFocused: false }));
    windows[i].isFocused = true;

    this.setState({
      windows: windows
    });
  }

  render() {
    return (
      <div className='app'>
        <div className='content'>
          {this.state.windows.map((item, i) =>
            <Window key={i} index={i} isFocused={item.isFocused}
                    updateWindows={this.updateWindows}
                    windowsCount={this.state.windows.length}></Window>
          )}
        </div>
      </div>
    );
  }
}
