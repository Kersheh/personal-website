import { useEffect, useRef } from 'react';

type EventHandler<T = unknown> = (event: CustomEvent<T>) => void;

/**
 * Hook for subscribing to window events with automatic cleanup.
 * Keeps the handler reference stable to avoid re-subscribing on every render.
 *
 * @param eventName - The name of the window event to listen for
 * @param handler - The event handler function
 */
export const useWindowEvent = <T = unknown>(
  eventName: string,
  handler: EventHandler<T>
) => {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventHandler = (event: Event) => {
      handlerRef.current(event as CustomEvent<T>);
    };

    window.addEventListener(eventName, eventHandler);
    return () => {
      window.removeEventListener(eventName, eventHandler);
    };
  }, [eventName]);
};

/**
 * Dispatch a custom window event with typed payload.
 *
 * @param eventName - The name of the event to dispatch
 * @param detail - The event payload
 */
export const dispatchWindowEvent = <T = unknown>(
  eventName: string,
  detail?: T
) => {
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
};
