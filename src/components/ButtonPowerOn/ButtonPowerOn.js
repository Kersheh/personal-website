import React from 'react';

import './ButtonPowerOn.scss';
import iconPower from '../../scss/images/icons/icon-power.svg';

export default class ButtonPowerOn extends React.Component {
  static displayName = 'ButtonPowerOn';

  render() {
    return (
      <img onClick={this.props.onClickHandler} src={iconPower} className='button-power-on' alt=''/>
    );
  }
}
