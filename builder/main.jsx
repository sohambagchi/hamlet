import React from 'react';
import ReactDOM from 'react-dom/client';
import { VibeKanbanWebCompanion } from 'vibe-kanban-web-companion';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
        {import.meta.env.DEV ? <VibeKanbanWebCompanion /> : null}
    </React.StrictMode>,
);
