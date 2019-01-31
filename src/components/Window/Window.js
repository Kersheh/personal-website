import React from 'react';
import Draggable from 'react-draggable';
import Terminal from '../Terminal/Terminal';

import './Window.scss';

export default class Window extends React.Component {
  static displayName = 'Window';

  constructor(props) {
    super(props);

    this.state = {
      isFocused: this.props.isFocused,
      draggableHandle: ''
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

  setDraggableTarget = (target) => {
    this.setState({ draggableHandle: target });
  }

  render() {
    const onWindowHandlers = {
      onBlur: this.onBlur,
      onFocus: this.onFocus
    };

    return (
      <Draggable handle={this.state.draggableHandle}>
        <div className='window' disabled={!this.state.isFocused}
             ref={node => this.node = node} {...onWindowHandlers}
             style={{
               zIndex: this.state.isFocused ? this.props.windowsCount : this.props.index,
               top: this.props.index * 128 + 32, left: this.props.index * 128 + 32
             }}>
          <Terminal autoFocus={this.props.isFocused}
                    setDraggableTarget={this.setDraggableTarget}></Terminal>
        </div>
      </Draggable>
    );
  }
}
