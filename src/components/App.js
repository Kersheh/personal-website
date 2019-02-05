import React from 'react';
import Desktop from './Desktop/Desktop';
import ButtonPower from './ButtonPower/ButtonPower';

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
          <div className='app--off'>
            <ButtonPower on={true} onClickHandler={this.powerOn}></ButtonPower>
          </div>
        }
      </div>
    );
  }
}
