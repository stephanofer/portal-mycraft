export type ServerStatus =
  | { state: 'loading' }
  | { state: 'online'; players: number; capacity: number }
  | { state: 'offline' }
  | { state: 'error' };

export interface ServerStatusResult {
  status: Extract<ServerStatus, { state: 'online' | 'offline' }>;
  expiresAt: number;
}
