import React from 'react';

import '../Window.scss';

export default class WindowButton extends React.Component {
  static displayName = 'WindowButton';

  render() {
    const className = 'button' + (this.props.color ? ` button--${this.props.color}` : '');

    const onHandlers = {
      onMouseEnter: this.onMouseEnter,
      onMouseLeave: this.onMouseLeave
    };

    return (
      <span className={className} {...onHandlers} onClick={this.props.onButtonClick}></span>
    );
  }
}
