import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { I18nProvider } from './i18n/I18nProvider';
import './styles/tokens.css';
import './styles/global.css';
import './styles/components.css';

const root = document.getElementById('root');
if (!root) throw new Error('No se encontró el elemento #root');

createRoot(root).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
);
