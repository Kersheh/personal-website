import React from 'react';
import { isArray } from 'lodash';
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
      cursorIndex: 0,
      cursorLocationPx: 0,
      inputLengthPx: 0
    };

    this.inputRef = React.createRef();
  }

  componentDidMount() {
    this.props.setDraggableTarget('.terminal-bar');
  }

  updateInputLength = (characters, width) => {
    this.setState({ inputLengthPx: characters * width });
  }

  updateCursorLocation = (length, index) => {
    this.setState({ cursorLocationPx: (length - index) * -10 });
  }

  onTerminalClick = () => {
    this.inputRef.current.focus();
  }

  onBlur = () => {
    this.setState({ isFocused: false });
  }

  onFocus = () => {
    this.setState({ isFocused: true });
  }

  updateInput = (e) => {
    this.setState({
      value: e.target.value,
      bufferValue: e.target.value,
      historyIndex: this.state.history.length,
      cursorIndex: this.state.cursorIndex + 1
    });

    this.updateInputLength(e.target.value.length, 10);
  }

  onKeyPress = async (e) => {
    // eslint-disable-next-line
    if(e.key === 'Enter') {
      this.setState({
        value: '',
        bufferValue: '',
        history: this.state.history.concat({ std: 'in', msg: e.target.value }),
        historyIndex: this.state.historyIndex + 1,
        cursorIndex: 0
      });

      this.updateInputLength(0, 0);
      this.updateCursorLocation(0, 0);

      try {
        const response = await commands.submit(e.target.value);
        const messages = isArray(response) ? response : [response];

        messages.forEach(message => {
          this.setState({
            history: this.state.history.concat({ std: 'out', msg: message })
          });
        });
      } catch(err) {
        this.setState({
          history: this.state.history.concat({ std: 'out', msg: err.message })
        });
      }
    }
  }

  onKeyDown = (e) => {
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

          this.updateInputLength(prevValue.length, 10);
          this.updateCursorLocation(prevValue.length, 0);
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

          this.updateInputLength(bufferValue.length, 10);
          this.updateCursorLocation(bufferValue.length, bufferValue.length);
        } else if(this.state.historyIndex < this.state.history.length - 1) {
          const nextValue = this.state.history[this.state.historyIndex + 1].msg;

          this.setState({
            value: nextValue,
            historyIndex: this.state.historyIndex + 1,
            cursorIndex: nextValue.length
          });

          this.updateInputLength(nextValue.length, 10);
          this.updateCursorLocation(nextValue.length, nextValue.length);
        }
        break;
      }
      // Cursor move left
      case 'ArrowLeft': {
        if(this.state.cursorIndex > 0) {
          this.setState({
            cursorIndex: this.state.cursorIndex - 1
          });

          this.updateCursorLocation(this.state.value.length, this.state.cursorIndex - 1);
        }
        break;
      }
      // Cursor move right
      case 'ArrowRight': {
        if(this.state.cursorIndex < this.state.value.length) {
          this.setState({
            cursorIndex: this.state.cursorIndex + 1
          });

          this.updateCursorLocation(this.state.value.length, this.state.cursorIndex + 1);
        }
        break;
      }
    }
  }

  render() {
    const onHandlers = {
      onBlur: this.onBlur,
      onFocus: this.onFocus,
      onKeyPress: (e) => this.onKeyPress(e),
      onKeyDown: (e) => this.onKeyDown(e)
    };

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
            <input className='terminal-row__input' value={this.state.value}
                   ref={this.inputRef} style={{ width: this.state.inputLengthPx }}
                   onChange={this.updateInput} type='text' spellCheck='false'
                   maxLength='60' autoFocus={this.props.autoFocus} autoComplete='off' {...onHandlers}>
            </input>
            <span className='terminal-row__cursor'
                  style={{ left: this.state.cursorLocationPx }}
                  disabled={!this.state.isFocused}>
            </span>
          </div>
        </div>
      </div>
    );
  }
}
