import React from 'react';
import TerminalRow from './TerminalRow/TerminalRow';
import TerminalInfo from './TerminalInfo/TerminalInfo';

import commands from '../../helpers/commands';

import './Terminal.scss';

export default class Terminal extends React.Component {
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

  async onKeyPress(e) {
    // eslint-disable-next-line
    if(e.key === 'Enter') {
      this.setState({
        value: '',
        bufferValue: '',
        history: this.state.history.concat({ std: 'in', msg: e.target.value }),
        historyIndex: this.state.historyIndex + 1,
        cursorIndex: 0
      });

      this._updateInputLength(0, 0);
      this._updateCursorLocation(0, 0);

      try {
        const response = await commands.submit(e.target.value);
        this.setState({
          history: this.state.history.concat({ std: 'out', msg: response })
        });
      } catch(err) {
        this.setState({
          history: this.state.history.concat({ std: 'out', msg: err.message })
        });
      }
    }
  }

  onKeyDown(e) {
    // eslint-disable-next-line
    switch(e.key) {
      // History upwards
      case 'ArrowUp': {
        if(this.state.historyIndex > 0) {
          const prevValue = this.state.history[this.state.historyIndex - 1].msg;

          this.setState({
            value: prevValue,
            historyIndex: this.state.historyIndex - 1,
            cursorIndex: 0
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
          const nextValue = this.state.history[this.state.historyIndex + 1].msg;

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
          {this.state.history.map((item, i) =>
            <TerminalRow io={item.std} key={i} command={item.msg}></TerminalRow>
          )}

          <div className='terminal-row'>
            <TerminalInfo></TerminalInfo>
            <input ref={this.inputRef} onChange={this.updateInput}
                   className='terminal-row__input' value={this.state.value}
                   onKeyPress={this.onKeyPress} onKeyDown={this.onKeyDown}
                   type='text' spellCheck='false' maxLength='60'
                   autoFocus autoComplete='off'
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
