import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/app';

const root = createRoot(document.querySelector('#root') as HTMLElement);
root.render(<App />);
