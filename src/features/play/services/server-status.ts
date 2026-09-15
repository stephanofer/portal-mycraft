import { fetchServerStatus } from '@/features/play/services/mcstatus';
import type { ServerStatus } from '@/features/play/types';

type Listener = (status: ServerStatus) => void;

const listeners = new Set<Listener>();
const refreshInterval = 60_000;
let status: ServerStatus = { state: 'loading' };
let nextRefreshAt = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
let request: AbortController | undefined;

function publish(nextStatus: ServerStatus) {
  status = nextStatus;
  listeners.forEach((listener) => listener(status));
}

function scheduleRefresh() {
  clearTimeout(timer);
  if (!listeners.size || document.hidden) return;
  timer = setTimeout(refresh, Math.max(0, nextRefreshAt - Date.now()));
}

async function refresh() {
  if (request || !listeners.size || document.hidden) return;

  const controller = new AbortController();
  request = controller;
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const result = await fetchServerStatus(controller.signal);
    if (request !== controller) return;
    publish(result.status);
    // Respect the API cache while bounding delays caused by clock skew.
    nextRefreshAt = Date.now() + Math.min(300_000, Math.max(refreshInterval, result.expiresAt - Date.now()));
  } catch {
    if (request !== controller) return;
    publish({ state: 'error' });
    nextRefreshAt = Date.now() + refreshInterval;
  } finally {
    clearTimeout(timeout);
    if (request === controller) {
      request = undefined;
      scheduleRefresh();
    }
  }
}

function onVisibilityChange() {
  if (document.hidden) clearTimeout(timer);
  else scheduleRefresh();
}

export function subscribeToServerStatus(listener: Listener) {
  listeners.add(listener);
  listener(status);

  if (listeners.size === 1) {
    document.addEventListener('visibilitychange', onVisibilityChange);
    scheduleRefresh();
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size) return;

    clearTimeout(timer);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    const pendingRequest = request;
    request = undefined;
    pendingRequest?.abort();
  };
}
