import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ConfigErrorScreen from './components/status/ConfigErrorScreen.tsx';
import { validateEnv } from './config/validateEnv.ts';
import { ErrorBoundary } from './ErrorBoundary.tsx';
import './index.css';
import { registerServiceWorker } from './registerServiceWorker';

const { valid, missing } = validateEnv();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {valid ? (
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    ) : (
      <ConfigErrorScreen missing={missing} />
    )}
  </StrictMode>
);

void registerServiceWorker();
