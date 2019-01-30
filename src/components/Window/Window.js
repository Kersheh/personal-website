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

  onBlur = () => {
    this.setState({ isFocused: false });
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
        <div className='window' disabled={!this.state.isFocused} {...onWindowHandlers}
             style={{ zIndex: this.state.isFocused ? this.props.windowsCount : this.props.index }}>
          <Terminal autoFocus={this.props.isFocused}
                    setDraggableTarget={this.setDraggableTarget}></Terminal>
        </div>
      </Draggable>
    );
  }
}
