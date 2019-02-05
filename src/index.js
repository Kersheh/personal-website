import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import './scss/index.scss';


ReactDOM.render(
  // naive User Agent detection
  (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ?
    <div className='mobile'>This website is not optimized for mobile.</div> :
    <App />
  ),
  document.getElementById('root')
);
