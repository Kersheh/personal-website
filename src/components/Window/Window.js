import React from 'react';
import Draggable from 'react-draggable';
import Terminal from '../Terminal/Terminal';

import './Window.scss';

export default class Window extends React.Component {
  static displayName = 'Window';

  constructor(props) {
    super(props);

    this.state = {
      isFocused: this.props.isFocused
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
      this.setState({ isFocused: false });
    }
  }

  onFocus = () => {
    this.setState({ isFocused: true });
    this.props.updateWindows(this.props.index);
  }

  render() {
    const onWindowHandlers = {
      onBlur: this.onBlur,
      onFocus: this.onFocus
    };

    return (
      <Draggable handle='.window-bar'>
        <div className='window' disabled={!this.state.isFocused}
             ref={node => this.node = node} {...onWindowHandlers}
             style={{
               zIndex: this.state.isFocused ? this.props.windowsCount : this.props.index,
               top: this.props.index * 128 + 32, left: this.props.index * 128 + 32
             }}>
          <div className='window-bar'>
            <span className='button button--red'></span>
            <span className='button button--yellow'></span>
            <span className='button button--green'></span>
          </div>

          <Terminal autoFocus={this.props.isFocused}
                    setDraggableTarget={this.setDraggableTarget}></Terminal>
        </div>
      </Draggable>
    );
  }
}
