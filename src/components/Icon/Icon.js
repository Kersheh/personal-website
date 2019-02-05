import React from 'react';

import './Icon.scss';

export default class Icon extends React.Component {
  static displayName = 'Icon';

  constructor() {
    super();

    this.state = {
      isSelected: false
    };
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.outsideClickHandler);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.outsideClickHandler);
  }

  outsideClickHandler = e => {
    if(this.node && !this.node.contains(e.target)) {
      this.setState({ isSelected: false });
    }
  }

  onClick = () => {
    this.setState({ isSelected: true });
  }

  onDoubleClick = () => {
    this.props.onDoubleClickHandler();
  }

  render() {
    const onHandlers = {
      onClick: this.onClick,
      onDoubleClick: this.onDoubleClick
    };

    return (
      <div className={'icon icon-' + this.props.iconName + (this.state.isSelected ? ' active' : '')}
           ref={node => this.node = node} {...onHandlers}></div>
    );
  }
}
