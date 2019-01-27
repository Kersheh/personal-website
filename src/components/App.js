import React from 'react';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      total: null,
      next: null,
      operation: null,
    };
  }

  render() {
    return (
      <div className='component-app'>
        Velkommen!
      </div>
    );
  }
}
export default App;
