import React from 'react';
import ReactDOM from 'react-dom';
import Desktop from './Desktop';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Desktop />, div);
});
