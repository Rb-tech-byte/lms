import React from 'react';
import ReactDOM from 'react-dom/client';
import "./style/css/feather.css";
import "./style/css/iconsax.css";
import ALLRoutes from './feature-module/router/router';
import { BrowserRouter } from 'react-router-dom';
import { base_path } from './environment';
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import './index.scss';
import { Provider } from 'react-redux';
import store from './core/redux/store';
import { AuthProvider } from './core/auth/authContext';
import "../node_modules/@tabler/icons-webfont/dist/tabler-icons.css";
import "../node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "../node_modules/@fortawesome/fontawesome-free/css/all.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter basename={base_path}>
          <ALLRoutes />
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
