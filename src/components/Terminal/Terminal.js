import React from 'react';

import './Terminal.scss';

function TerminalInfo() {
  return <span className='terminal-row__info'>guest@matthewbreckon.com $</span>;
}

function TerminalRow(props) {
  const command = props.command ? <span>{props.command}</span> : '';

  return (
    <div className='terminal-row'>
      <TerminalInfo></TerminalInfo>
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
      history: [],
      isFocused: true
    };

    this.updateFocus = this.updateFocus.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.submit = this.submit.bind(this);
  }

  onTerminalClick() {
    const input = document.getElementsByTagName('input')[0];
    input.focus();
  }

  updateFocus(focus) {
    this.setState({
      isFocused: focus
    });
  }

  updateInput(e) {
    this.setState({
      value: e.target.value
    });

    const input = document.getElementsByTagName('input')[0];
    const length = e.target.value.length;
    input.setAttribute('style', `width: ${length * 10}px`);
    input.setAttribute('style', `width: ${length * 10}px`);
  }

  submit(e) {
    if(e.key === 'Enter') {
      this.setState({
        value: '',
        history: this.state.history.concat(e.target.value)
      });

      const input = document.getElementsByTagName('input')[0];
      input.setAttribute('style', 'width: 0');
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
          {this.state.history.map((cmd, i) => <TerminalRow key={i} command={cmd}></TerminalRow>)}
          <div className='terminal-row'>
            <TerminalInfo></TerminalInfo>
            <input className='terminal-row__input' value={this.state.value}
                   onChange={this.updateInput} autoFocus onKeyPress={this.submit}
                   type='text' spellCheck='false' maxLength='60'
                   onBlur={() => this.updateFocus(false)}
                   onFocus={() => this.updateFocus(true)}>
            </input>
            <span className='terminal-row__cursor'
                  disabled={!this.state.isFocused}>
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default Terminal;
