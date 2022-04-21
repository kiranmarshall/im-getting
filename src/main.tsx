import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { ErrorProvider } from './contexts';

ReactDOM.render(
   <React.StrictMode>
      <ErrorProvider>
         <App />
      </ErrorProvider>
   </React.StrictMode>,
   document.getElementById('root')
);
