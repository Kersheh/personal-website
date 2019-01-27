import React from 'react';
import Terminal from './Terminal/Terminal';
import './App.scss';

class App extends React.Component {
  render() {
    return (
      <div className='app'>
        <div className='content'>
          <Terminal></Terminal>
        </div>
      </div>
    );
  }
}
export default App;
