import React from 'react';
import { createRoot } from 'react-dom/client';
import { VibeKanbanWebCompanion } from 'vibe-kanban-web-companion';

let companionRoot = null;

export function mountVibeKanbanWebCompanion() {
    if (!import.meta.env.DEV) {
        return;
    }

    if (companionRoot) {
        return;
    }

    const containerId = 'vibe-kanban-web-companion-root';
    let container = document.getElementById(containerId);

    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        document.body.appendChild(container);
    }

    companionRoot = createRoot(container);
    companionRoot.render(
        <React.StrictMode>
            <VibeKanbanWebCompanion />
        </React.StrictMode>
    );
}

