// Multi-endpoint fallback cloud counter
const CLOUD_APIS = {
  abacusAllTime: 'https://abacus.jasoncameron.dev/hit/bmw-g30-530i-sport/all-time',
  abacusAllTimeGet: 'https://abacus.jasoncameron.dev/get/bmw-g30-530i-sport/all-time',
  abacusMonthly: (month: string) => `https://abacus.jasoncameron.dev/hit/bmw-g30-530i-sport/month-${month}`,
  abacusMonthlyGet: (month: string) => `https://abacus.jasoncameron.dev/get/bmw-g30-530i-sport/month-${month}`,
  countApiAllTime: 'https://countapi.mileshilliard.com/api/v1/hit/bmw-g30-530i-sport-alltime-2026',
  countApiAllTimeGet: 'https://countapi.mileshilliard.com/api/v1/get/bmw-g30-530i-sport-alltime-2026',
  countApiMonthly: (month: string) => `https://countapi.mileshilliard.com/api/v1/hit/bmw-g30-530i-sport-month-${month}`,
  countApiMonthlyGet: (month: string) => `https://countapi.mileshilliard.com/api/v1/get/bmw-g30-530i-sport-month-${month}`,
};

export interface GlobalTelemetryStats {
  activeNow: number;
  monthlyTotal: number;
  allTimeTotal: number;
  isSyncing: boolean;
  isLive: boolean;
}

/**
 * Fetch and increment genuine cross-device persistent visitor counts
 */
export async function syncCloudVisitorCounts(): Promise<{ allTime: number; monthly: number }> {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // e.g. "2026-08"
  const isNewSession = !sessionStorage.getItem('bmw_g30_session_counted_2026');

  let allTimeCount = 1;
  let monthlyCount = 1;
  let success = false;

  // 1. Try Abacus API first
  try {
    const allTimeUrl = isNewSession ? CLOUD_APIS.abacusAllTime : CLOUD_APIS.abacusAllTimeGet;
    const monthlyUrl = isNewSession ? CLOUD_APIS.abacusMonthly(currentMonth) : CLOUD_APIS.abacusMonthlyGet(currentMonth);

    const [resAll, resMonth] = await Promise.all([
      fetch(allTimeUrl, { method: 'GET', mode: 'cors' }).then(r => r.json()).catch(() => null),
      fetch(monthlyUrl, { method: 'GET', mode: 'cors' }).then(r => r.json()).catch(() => null)
    ]);

    if (resAll && typeof resAll.value === 'number') {
      allTimeCount = resAll.value;
      success = true;
    }
    if (resMonth && typeof resMonth.value === 'number') {
      monthlyCount = resMonth.value;
      success = true;
    }
  } catch {
    // try fallback
  }

  // 2. Try CountAPI fallback if Abacus was unreachable
  if (!success) {
    try {
      const allTimeUrl = isNewSession ? CLOUD_APIS.countApiAllTime : CLOUD_APIS.countApiAllTimeGet;
      const monthlyUrl = isNewSession ? CLOUD_APIS.countApiMonthly(currentMonth) : CLOUD_APIS.countApiMonthlyGet(currentMonth);

      const [resAll, resMonth] = await Promise.all([
        fetch(allTimeUrl, { method: 'GET', mode: 'cors' }).then(r => r.json()).catch(() => null),
        fetch(monthlyUrl, { method: 'GET', mode: 'cors' }).then(r => r.json()).catch(() => null)
      ]);

      if (resAll && typeof resAll.value === 'number') {
        allTimeCount = resAll.value;
        success = true;
      }
      if (resMonth && typeof resMonth.value === 'number') {
        monthlyCount = resMonth.value;
        success = true;
      }
    } catch {
      // fallback
    }
  }

  // 3. Try Busuanzi as additional verification fallback
  if (!success) {
    try {
      await new Promise<void>((resolve) => {
        const callbackName = `bszCb_${Date.now()}`;
        (window as any)[callbackName] = (data: any) => {
          if (data && (data.site_pv !== undefined || data.site_uv !== undefined)) {
            allTimeCount = Number(data.site_pv) || allTimeCount;
            monthlyCount = Number(data.site_uv) || monthlyCount;
            success = true;
          }
          delete (window as any)[callbackName];
          resolve();
        };

        const script = document.createElement('script');
        script.src = `//busuanzi.ibruce.info/busuanzi/2.0.jsonp?appkey=bmw-g30-530i-garage-live&jsonp=${callbackName}`;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
          delete (window as any)[callbackName];
          resolve();
        };
        document.head.appendChild(script);

        setTimeout(() => {
          if ((window as any)[callbackName]) {
            delete (window as any)[callbackName];
          }
          resolve();
        }, 1500);
      });
    } catch {
      // fallback
    }
  }

  if (isNewSession && success) {
    sessionStorage.setItem('bmw_g30_session_counted_2026', 'true');
  }

  return {
    allTime: Math.max(1, allTimeCount),
    monthly: Math.max(1, monthlyCount)
  };
}

/**
 * Real-time cross-device presence engine
 * Combines ultra-fast WebSockets + global SSE + local BroadcastChannel.
 * Filters out historical messages (ts > 10s old) to guarantee zero ghost peers.
 */
const PRESENCE_TOPIC = 'bmw_g30_530i_live_v5';
const WS_URL = `wss://free.blr2.piesocket.com/v3/${PRESENCE_TOPIC}?api_key=VCXCEuvhGcBDP7XhiJJUDvR1e1D3eiVjgZ9VRiaV&notify_self=0`;
const SSE_URL = `https://ntfy.sh/${PRESENCE_TOPIC}/sse`;
const POST_URL = `https://ntfy.sh/${PRESENCE_TOPIC}`;

function getSessionDeviceId(): string {
  try {
    let id = sessionStorage.getItem('bmw_g30_device_presence_id_v5');
    if (!id) {
      id = `dev_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36).slice(-4)}`;
      sessionStorage.setItem('bmw_g30_device_presence_id_v5', id);
    }
    return id;
  } catch {
    return `dev_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36).slice(-4)}`;
  }
}

export function initRealtimePresence(onCountChange: (count: number) => void): () => void {
  const clientId = getSessionDeviceId();
  const activePeers = new Map<string, number>();
  activePeers.set(clientId, Date.now());

  // Prune peers that haven't sent a heartbeat in > 9 seconds
  const updateAndNotify = () => {
    const now = Date.now();
    for (const [id, lastSeen] of activePeers.entries()) {
      if (id !== clientId && now - lastSeen > 9000) {
        activePeers.delete(id);
      }
    }
    activePeers.set(clientId, now);
    onCountChange(activePeers.size);
  };

  // Process incoming peer signals
  const handleIncomingSignal = (payload: any) => {
    if (!payload || typeof payload !== 'object' || payload.id === clientId) return;

    const now = Date.now();
    // Discard outdated historical messages replayed on connect
    if (payload.ts && Math.abs(now - payload.ts) > 10000) {
      return;
    }

    if (payload.type === 'HEARTBEAT') {
      activePeers.set(payload.id, now);
      updateAndNotify();
    } else if (payload.type === 'OFFLINE') {
      activePeers.delete(payload.id);
      updateAndNotify();
    }
  };

  // Helper to broadcast presence over all available channels
  const broadcast = (type: 'HEARTBEAT' | 'OFFLINE') => {
    const payload = JSON.stringify({ id: clientId, type, ts: Date.now() });

    // 1. Same-device multi-tab BroadcastChannel
    try {
      localChannel?.postMessage({ id: clientId, type, ts: Date.now() });
    } catch {}

    // 2. High-speed WebSocket
    try {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    } catch {}

    // 3. Global HTTP Post (for SSE subscribers)
    if (type === 'OFFLINE' && navigator.sendBeacon) {
      try {
        const blob = new Blob([payload], { type: 'text/plain' });
        navigator.sendBeacon(POST_URL, blob);
        return;
      } catch {}
    }

    try {
      fetch(POST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: payload,
        mode: 'cors',
        keepalive: type === 'OFFLINE'
      }).catch(() => {});
    } catch {}
  };

  // 1. Setup BroadcastChannel
  let localChannel: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      localChannel = new BroadcastChannel('bmw_g30_local_presence_v5');
      localChannel.onmessage = (e) => {
        handleIncomingSignal(e.data);
      };
    }
  } catch {}

  // 2. Setup WebSocket Connection
  let ws: WebSocket | null = null;
  const connectWS = () => {
    try {
      ws = new WebSocket(WS_URL);
      ws.onopen = () => {
        broadcast('HEARTBEAT');
      };
      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          handleIncomingSignal(parsed);
        } catch {}
      };
      ws.onerror = () => {};
      ws.onclose = () => {
        // Will reconnect on next heartbeat cycle if needed
      };
    } catch {}
  };
  connectWS();

  // 3. Setup SSE Stream Backup
  let eventSource: EventSource | null = null;
  try {
    if (typeof EventSource !== 'undefined') {
      eventSource = new EventSource(SSE_URL);
      eventSource.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          let parsed: any = raw;
          if (raw && typeof raw.message === 'string') {
            try {
              parsed = JSON.parse(raw.message);
            } catch {
              parsed = raw;
            }
          }
          handleIncomingSignal(parsed);
        } catch {}
      };
    }
  } catch {}

  // Broadcast initial heartbeat immediately
  broadcast('HEARTBEAT');
  updateAndNotify();

  // Regular heartbeat broadcast every 3 seconds
  const heartbeatTimer = setInterval(() => {
    // Check WS health
    if (!ws || ws.readyState === WebSocket.CLOSED) {
      connectWS();
    }
    broadcast('HEARTBEAT');
    updateAndNotify();
  }, 3000);

  // Prune check every 2 seconds
  const pruneTimer = setInterval(updateAndNotify, 2000);

  // Visibility change: broadcast instantly when user switches back to this tab
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      activePeers.set(clientId, Date.now());
      broadcast('HEARTBEAT');
      updateAndNotify();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Exit cleanup
  const handleUnload = () => {
    broadcast('OFFLINE');
  };

  window.addEventListener('beforeunload', handleUnload);
  window.addEventListener('pagehide', handleUnload);

  // Cleanup handler
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handleUnload);
    window.removeEventListener('pagehide', handleUnload);
    clearInterval(heartbeatTimer);
    clearInterval(pruneTimer);

    handleUnload();

    if (ws) {
      try {
        ws.close();
      } catch {}
    }
    if (eventSource) {
      try {
        eventSource.close();
      } catch {}
    }
    if (localChannel) {
      try {
        localChannel.close();
      } catch {}
    }
  };
}
