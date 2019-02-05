import React from 'react';

import '../Window.scss';

export default class WindowButton extends React.Component {
  static displayName = 'WindowButton';

  constructor() {
    super();

    this.state = {
      hover: false
    };
  }

  onMouseEnter = () => {
    this.setState({ hover: true });
  }

  onMouseLeave = () => {
    this.setState({ hover: false });
  }

  render() {
    const className = 'button' +
      (this.props.color ? ` button--${this.props.color}` : '') +
      (this.state.hover ? ' hover' : '');

    const onHandlers = {
      onMouseEnter: this.onMouseEnter,
      onMouseLeave: this.onMouseLeave
    };

    return (
      <span className={className} {...onHandlers} onClick={this.props.onButtonClick}></span>
    );
  }
}
