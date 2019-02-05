import React from 'react';
import { get } from 'lodash';
import uuid from 'uuid';
import Window from '../Window/Window';
import Icon from '../Icon/Icon';
import ButtonPower from '../ButtonPower/ButtonPower';

import './Desktop.scss';

export default class Desktop extends React.Component {
  static displayName = 'Desktop';

  constructor() {
    super();

    this.state = {
      windows: [],
      powerOn: true
    };
  }

  updateWindows = (i) => {
    const windows = this.state.windows.map(window =>
      window !== null ? { ...window, isFocused: false } : null);

    windows[i].isFocused = true;

    this.setState({ windows: windows });
  }

  openNewWindow = name => {
    const windows = this.state.windows.map(window =>
      window !== null ? { ...window, isFocused: false } : null);

    windows.push({
      name: name,
      isFocused: true,
      uuid: uuid()
    });

    this.setState({ windows: windows });
  }

  closeWindow = (uuid) => {
    const windows = this.state.windows.map(window => uuid === get(window, 'uuid') ? null : window);

    this.setState({ windows: windows });
  }

  timedPowerOff = () => {
    this.setState({ powerOn: false });
    setTimeout(this.props.powerOff, 550);
  }

  render() {
    return (
      <div className={'desktop' + (this.state.powerOn ? '' : ' turn-off')} ref={node => this.node = node}>
        <div className='content'>
          <ButtonPower on={false} onClickHandler={this.timedPowerOff}></ButtonPower>
          <Icon iconName='iterm' onDoubleClickHandler={() => this.openNewWindow('iterm')}></Icon>

          {this.state.windows.map((item, i) => {
            return item === null ? item : (
              <Window key={i} index={i} uuid={item.uuid} isFocused={item.isFocused}
                      updateWindows={this.updateWindows} parentNode={this.node}
                      windowsCount={this.state.windows.length}
                      closeWindow={this.closeWindow}></Window>
            );
          })}
        </div>
      </div>
    );
  }
}
