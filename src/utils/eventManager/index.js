// src/utils/eventManager/index.js
import { events } from './events.js';

let currentEvent = null;
let eventEndTimeout = null;

export function getCurrentEvent() {
    return currentEvent;
}

export function startRandomEvent() {
    const event = events[Math.floor(Math.random() * events.length)];
    currentEvent = event;

    if (eventEndTimeout) clearTimeout(eventEndTimeout);

    eventEndTimeout = setTimeout(() => {
        currentEvent = null;
        // start next event after 5 minutes
        setTimeout(startRandomEvent, 60 * 60 * 1000);
    }, event.durationMs);

    console.log(`[EventManager] Started event: ${event.name} for ${event.durationMs / 60000} minutes`);
}

// Auto-start on bot startup
startRandomEvent();
