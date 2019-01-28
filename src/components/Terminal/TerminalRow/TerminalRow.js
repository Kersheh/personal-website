import React from 'react';
import TerminalInfo from '../TerminalInfo/TerminalInfo';

import urlRegex from 'url-regex';

import '../Terminal.scss';

export default class TerminalRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      command: {
        strings: [{
          isUrl: false,
          string: props.command
        }]
      }
    };
  }

  componentDidMount() {
    if(this.props.io === 'out') {
      const command = this.state.command.strings[0].string;

      // naively only finds first potential url
      if(urlRegex().test(command)) {
        const url = command.match(urlRegex())[0];
        const indexOfUrl = command.indexOf(url);

        const elementPreUrl = command.substring(0, indexOfUrl);
        const elementUrl = command.substring(indexOfUrl, indexOfUrl + url.length);
        const elementPostUrl = command.substring(indexOfUrl + url.length, command.length);

        this.setState({
          command: {
            strings: [{
              isUrl: false,
              string: elementPreUrl
            }, {
              isUrl: true,
              string: elementUrl
            }, {
              isUrl: false,
              string: elementPostUrl
            }]
          }
        });
      }
    }
  }

  render() {
    return (
      <div className='terminal-row'>
        {this.props.io === 'in' ? <TerminalInfo></TerminalInfo> : ''}

        <span className='terminal-row__history'>
          {this.state.command.strings.map((substring, i) => {
            return substring.isUrl ?
              <a target='_blank' rel='noreferrer noopener' key={i}
                 href={substring.string}>{substring.string}
              </a> :
              substring.string;
          })}
        </span>
      </div>
    );
  }
}
