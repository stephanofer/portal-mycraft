import { server } from '@/features/play/data/server';
import type { ServerStatusResult } from '@/features/play/types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPlayerCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

export function parseServerStatus(payload: unknown): ServerStatusResult {
  if (!isRecord(payload) || typeof payload.online !== 'boolean') {
    throw new Error('Invalid MCStatus response.');
  }

  const expiresAt = typeof payload.expires_at === 'number' && Number.isFinite(payload.expires_at)
    ? payload.expires_at
    : Date.now() + 60_000;

  if (!payload.online) return { status: { state: 'offline' }, expiresAt };

  if (!isRecord(payload.players) || !isPlayerCount(payload.players.online) || !isPlayerCount(payload.players.max)) {
    throw new Error('Invalid MCStatus player counts.');
  }

  return {
    status: { state: 'online', players: payload.players.online, capacity: payload.players.max },
    expiresAt,
  };
}

export async function fetchServerStatus(signal: AbortSignal): Promise<ServerStatusResult> {
  const url = `https://api.mcstatus.io/v2/status/${server.edition}/${encodeURIComponent(server.address)}`;
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });

  if (!response.ok) throw new Error(`MCStatus returned HTTP ${response.status}.`);

  const payload: unknown = await response.json();
  return parseServerStatus(payload);
}
