import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import App from './App';

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <SnackbarProvider anchorOrigin={{ horizontal: 'right', vertical: 'top' }}>
      <BrowserRouter basename="/">
        <App />
      </BrowserRouter>
    </SnackbarProvider>
  </>
);
