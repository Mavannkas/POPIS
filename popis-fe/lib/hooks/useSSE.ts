import { useEffect, useRef, useState } from 'react';
import { API_URL } from '../http';

interface SSEMessage {
  id?: string;
  type: string;
  message: string;
  event?: any;
  createdAt?: string;
  read?: boolean;
}

interface UseSSEOptions {
  enabled?: boolean;
  onMessage?: (message: SSEMessage) => void;
  onError?: (error: Error) => void;
  onConnected?: () => void;
}

export function useSSE(endpoint: string, options: UseSSEOptions = {}) {
  const { enabled = true, onMessage, onError, onConnected } = options;
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const connect = () => {
      try {
        const url = `${API_URL}${endpoint}`;
        console.log('[SSE] Connecting to:', url);

        // For React Native, we'll use fetch with ReadableStream
        // EventSource is not available in React Native
        const connectWithFetch = async () => {
          try {
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'Accept': 'text/event-stream',
                'Cache-Control': 'no-cache',
              },
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            setConnected(true);
            setError(null);
            reconnectAttemptsRef.current = 0;
            onConnected?.();

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
              throw new Error('No response body reader available');
            }

            // Read stream
            const processStream = async () => {
              let buffer = '';

              try {
                while (true) {
                  const { done, value } = await reader.read();

                  if (done) {
                    console.log('[SSE] Stream completed');
                    break;
                  }

                  // Decode chunk
                  buffer += decoder.decode(value, { stream: true });

                  // Process complete messages
                  const lines = buffer.split('\n');
                  buffer = lines.pop() || ''; // Keep incomplete line in buffer

                  for (const line of lines) {
                    if (line.startsWith('data: ')) {
                      const data = line.slice(6);
                      try {
                        const message = JSON.parse(data) as SSEMessage;
                        console.log('[SSE] Received message:', message);
                        onMessage?.(message);
                      } catch (err) {
                        console.error('[SSE] Failed to parse message:', err);
                      }
                    }
                  }
                }
              } catch (err) {
                console.error('[SSE] Stream reading error:', err);
                throw err;
              }
            };

            await processStream();
          } catch (err) {
            console.error('[SSE] Connection error:', err);
            const error = err instanceof Error ? err : new Error('Unknown error');
            setError(error);
            setConnected(false);
            onError?.(error);

            // Attempt reconnect
            if (reconnectAttemptsRef.current < maxReconnectAttempts) {
              reconnectAttemptsRef.current++;
              const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
              console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);

              reconnectTimeoutRef.current = setTimeout(() => {
                connect();
              }, delay);
            } else {
              console.error('[SSE] Max reconnection attempts reached');
            }
          }
        };

        connectWithFetch();
      } catch (err) {
        console.error('[SSE] Setup error:', err);
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        onError?.(error);
      }
    };

    connect();

    // Cleanup
    return () => {
      console.log('[SSE] Cleaning up connection');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      setConnected(false);
    };
  }, [endpoint, enabled, onMessage, onError, onConnected]);

  return { connected, error };
}
