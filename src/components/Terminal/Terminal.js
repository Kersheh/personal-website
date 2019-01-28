import React from 'react';
// import commands from '../../helpers/commands';

import './Terminal.scss';

function TerminalInfo() {
  const INFO = 'guest@matthewbreckon.com $';

  return (
    <span className='terminal-row__info'>{INFO}</span>
  );
}

function TerminalRow(props) {
  const info = props.info ? <TerminalInfo></TerminalInfo> : '';
  const command = props.command ? <span>{props.command}</span> : '';

  return (
    <div className='terminal-row'>
      {info}
      <span className='terminal-row__history'>{command}</span>
    </div>
  );
}

class Terminal extends React.Component {
  static displayName = 'Terminal';

  constructor(props) {
    super(props);
    this.state = {
      value: '',
      bufferValue: '',
      isFocused: true,
      history: [],
      historyIndex: 0,
      cursorIndex: 0
    };

    this.inputRef = React.createRef();
    this.cursorRef = React.createRef();

    this.onTerminalClick = this.onTerminalClick.bind(this);
    this.updateFocus = this.updateFocus.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  _updateInputLength(characters, width) {
    this.inputRef.current.setAttribute('style', `width: ${characters * width}px`);
  }

  _updateCursorLocation(length, index) {
    const position = (length - index) * -10;
    this.cursorRef.current.setAttribute('style', `left: ${position}px`);
  }

  onTerminalClick() {
    this.inputRef.current.focus();
  }

  updateFocus(focus) {
    this.setState({
      isFocused: focus
    });
  }

  updateInput(e) {
    this.setState({
      value: e.target.value,
      bufferValue: e.target.value,
      historyIndex: this.state.history.length,
      cursorIndex: this.state.cursorIndex + 1
    });

    this._updateInputLength(e.target.value.length, 10);
  }

  onKeyPress(e) {
    // eslint-disable-next-line
    if(e.key === 'Enter') {
      this.setState({
        value: '',
        bufferValue: '',
        history: this.state.history.concat(e.target.value),
        historyIndex: this.state.historyIndex + 1,
        cursorIndex: 0
      });

      this._updateInputLength(0, 0);
      this._updateCursorLocation(0, 0);
    }
  }

  onKeyDown(e) {
    // eslint-disable-next-line
    switch(e.key) {
      // History upwards
      case 'ArrowUp': {
        if(this.state.historyIndex > 0) {
          const prevValue = this.state.history[this.state.historyIndex - 1];

          this.setState({
            value: prevValue,
            historyIndex: this.state.historyIndex - 1,
            cursorIndex: prevValue.length
          });

          this._updateInputLength(prevValue.length, 10);
          this._updateCursorLocation(prevValue.length, 0);
        }
        break;
      }
      // History downards
      case 'ArrowDown': {
        if(this.state.historyIndex === this.state.history.length - 1) {
          const bufferValue = this.state.bufferValue;

          this.setState({
            value: bufferValue,
            historyIndex: this.state.historyIndex + 1,
            cursorIndex: bufferValue.length
          });

          this._updateInputLength(bufferValue.length, 10);
          this._updateCursorLocation(bufferValue.length, bufferValue.length);
        } else if(this.state.historyIndex < this.state.history.length - 1) {
          const nextValue = this.state.history[this.state.historyIndex + 1];

          this.setState({
            value: nextValue,
            historyIndex: this.state.historyIndex + 1,
            cursorIndex: nextValue.length
          });

          this._updateInputLength(nextValue.length, 10);
          this._updateCursorLocation(nextValue.length, nextValue.length);
        }
        break;
      }
      // Cursor move left
      case 'ArrowLeft': {
        if(this.state.cursorIndex > 0) {
          this.setState({
            cursorIndex: this.state.cursorIndex - 1
          });

          this._updateCursorLocation(this.state.value.length, this.state.cursorIndex - 1);
        }
        break;
      }
      // Cursor move right
      case 'ArrowRight': {
        if(this.state.cursorIndex < this.state.value.length) {
          this.setState({
            cursorIndex: this.state.cursorIndex + 1
          });

          this._updateCursorLocation(this.state.value.length, this.state.cursorIndex + 1);
        }
        break;
      }
    }
  }

  render() {
    return (
      <div className='terminal'>
        <div className='terminal-bar'>
          <span className='button button--red'></span>
          <span className='button button--yellow'></span>
          <span className='button button--green'></span>
        </div>

        <div className='terminal-body' onClick={this.onTerminalClick}>
          {this.state.history.map((cmd, i) =>
            <TerminalRow info="true" key={i} command={cmd}></TerminalRow>
          )}

          <div className='terminal-row'>
            <TerminalInfo></TerminalInfo>
            <input id="test" ref={this.inputRef} onChange={this.updateInput} autoFocus
                   className='terminal-row__input' value={this.state.value}
                   onKeyPress={this.onKeyPress} onKeyDown={this.onKeyDown}
                   type='text' spellCheck='false' maxLength='60'
                   onBlur={() => this.updateFocus(false)}
                   onFocus={() => this.updateFocus(true)}>
            </input>
            <span ref={this.cursorRef} className='terminal-row__cursor'
                  disabled={!this.state.isFocused}>
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default Terminal;
