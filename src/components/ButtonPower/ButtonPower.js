import React from 'react';

import './ButtonPower.scss';
import iconPower from '../../scss/images/icons/icon-power.svg';

export default class ButtonPower extends React.Component {
  static displayName = 'ButtonPower';

  render() {
    return (
      <img onClick={this.props.onClickHandler} src={iconPower}
           className={'button-power button-power' + (this.props.on ? '__on' : '__off')} alt=''/>
    );
  }
}
