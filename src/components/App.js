import React from 'react';
import Desktop from './Desktop/Desktop';
import ButtonPowerOn from './ButtonPowerOn/ButtonPowerOn';

import './App.scss';

export default class App extends React.Component {
  static displayName = 'App';

  constructor() {
    super();

    this.state = {
      poweredOn: false
    };
  }

  powerOn = () => {
    this.setState({ poweredOn: true });
  }

  powerOff = () => {
    this.setState({ poweredOn: false });
  }

  render() {
    return (
      <div className='app'>
        {this.state.poweredOn ?
          <Desktop powerOff={this.powerOff}></Desktop> :
          <div className='app-button__container'>
            <ButtonPowerOn onClickHandler={this.powerOn}></ButtonPowerOn>
          </div>
        }
      </div>
    );
  }
}
