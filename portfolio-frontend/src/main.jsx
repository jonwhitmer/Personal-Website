import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Both v7 behaviours are opted into explicitly. Without these, React Router
        logs two "Future Flag Warning" lines to the console on every single page
        load, which is the first thing an engineer looking at this site would
        see if they opened devtools. Opting in now also means the eventual v7
        upgrade is not a behaviour change. */}
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </BrowserRouter>
  </React.StrictMode>
);