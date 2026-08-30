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
 * Combines 3 independent real-time sync channels:
 * 1. Server-Sent Events (SSE) Global Pub/Sub via ntfy.sh (Cross-IP/Cross-Device real-time push with zero CORS issues)
 * 2. Fallback WebSockets (PieSocket real-time channel)
 * 3. Local BroadcastChannel (Same-device multi-tab synchronization)
 */
const PRESENCE_SSE_TOPIC = 'bmw_g30_530i_garage_presence_v2';
const PRESENCE_SSE_URL = `https://ntfy.sh/${PRESENCE_SSE_TOPIC}/sse`;
const PRESENCE_POST_URL = `https://ntfy.sh/${PRESENCE_SSE_TOPIC}`;

export function initRealtimePresence(onCountChange: (count: number) => void): () => void {
  // Unique client ID for this device session
  const clientId = `dev_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
  const activePeers = new Map<string, number>();
  activePeers.set(clientId, Date.now());

  const updateCount = () => {
    const now = Date.now();
    // Inactive timeout: 25 seconds
    for (const [id, lastSeen] of activePeers.entries()) {
      if (now - lastSeen > 25000) {
        activePeers.delete(id);
      }
    }
    if (!activePeers.has(clientId)) {
      activePeers.set(clientId, now);
    }
    onCountChange(activePeers.size);
  };

  // Helper to safely broadcast presence ping over HTTP/SSE and WebSockets
  const broadcastHeartbeat = (type: 'ONLINE' | 'PING' | 'OFFLINE') => {
    const payload = JSON.stringify({ id: clientId, type, ts: Date.now() });

    // 1. Post to ntfy global pub-sub stream
    try {
      fetch(PRESENCE_POST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        mode: 'cors',
        keepalive: type === 'OFFLINE'
      }).catch(() => {});
    } catch {}

    // 2. Post to local BroadcastChannel
    try {
      localChannel?.postMessage({ id: clientId, type, ts: Date.now() });
    } catch {}

    // 3. Post to WebSocket if open
    try {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    } catch {}
  };

  // ==========================================
  // CHANNEL 1: Server-Sent Events (SSE) Stream
  // ==========================================
  let eventSource: EventSource | null = null;
  try {
    if (typeof EventSource !== 'undefined') {
      eventSource = new EventSource(PRESENCE_SSE_URL);

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          // ntfy wraps the payload in parsed.message or sends as raw
          let payload: any = null;
          if (parsed && typeof parsed.message === 'string') {
            try {
              payload = JSON.parse(parsed.message);
            } catch {
              payload = parsed;
            }
          } else {
            payload = parsed;
          }

          if (payload && payload.id && payload.id !== clientId) {
            if (payload.type === 'ONLINE' || payload.type === 'PING') {
              activePeers.set(payload.id, Date.now());
              // If another device just came online, greet them back with our presence
              if (payload.type === 'ONLINE') {
                broadcastHeartbeat('PING');
              }
              updateCount();
            } else if (payload.type === 'OFFLINE') {
              activePeers.delete(payload.id);
              updateCount();
            }
          }
        } catch {
          // ignore non-json notifications
        }
      };

      eventSource.onerror = () => {
        // SSE handles auto-reconnect natively
      };
    }
  } catch (e) {
    console.warn('SSE connection notice:', e);
  }

  // ==========================================
  // CHANNEL 2: PieSocket WebSocket Relay
  // ==========================================
  let ws: WebSocket | null = null;
  try {
    ws = new WebSocket('wss://free.blr2.piesocket.com/v3/bmw_g30_530i_presence_channel?api_key=VCXCEuvhGcBDP7XhiJJUDvR1e1D3eiVjgZ9VRiaV&notify_self=0');

    ws.onopen = () => {
      broadcastHeartbeat('ONLINE');
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload && payload.id && payload.id !== clientId) {
          if (payload.type === 'ONLINE' || payload.type === 'PING') {
            activePeers.set(payload.id, Date.now());
            if (payload.type === 'ONLINE') {
              broadcastHeartbeat('PING');
            }
            updateCount();
          } else if (payload.type === 'OFFLINE') {
            activePeers.delete(payload.id);
            updateCount();
          }
        }
      } catch {}
    };
  } catch (e) {
    // ignore
  }

  // ==========================================
  // CHANNEL 3: Local BroadcastChannel (Same Machine)
  // ==========================================
  let localChannel: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      localChannel = new BroadcastChannel('bmw_g30_presence_local_bus');
      localChannel.onmessage = (e) => {
        if (e.data?.id && e.data.id !== clientId) {
          if (e.data.type === 'ONLINE' || e.data.type === 'PING') {
            activePeers.set(e.data.id, Date.now());
            if (e.data.type === 'ONLINE') {
              localChannel?.postMessage({ id: clientId, type: 'PING', ts: Date.now() });
            }
            updateCount();
          } else if (e.data.type === 'OFFLINE') {
            activePeers.delete(e.data.id);
            updateCount();
          }
        }
      };
    }
  } catch {}

  // Initial broadcast to announce arrival
  broadcastHeartbeat('ONLINE');

  // Heartbeat interval: Every 8 seconds
  const heartbeatTimer = setInterval(() => {
    activePeers.set(clientId, Date.now());
    broadcastHeartbeat('PING');
    updateCount();
  }, 8000);

  // Peer cleanup timer: Every 4 seconds
  const cleanupTimer = setInterval(updateCount, 4000);

  // Page exit / tab close handler
  const handleUnload = () => {
    const payload = JSON.stringify({ id: clientId, type: 'OFFLINE', ts: Date.now() });
    
    // Beacon for reliable on-close HTTP delivery
    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(PRESENCE_POST_URL, blob);
      } catch {}
    } else {
      try {
        fetch(PRESENCE_POST_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          mode: 'cors',
          keepalive: true
        }).catch(() => {});
      } catch {}
    }

    if (localChannel) {
      try {
        localChannel.postMessage({ id: clientId, type: 'OFFLINE' });
      } catch {}
    }

    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(payload);
        ws.close();
      } catch {}
    }
  };

  window.addEventListener('beforeunload', handleUnload);
  window.addEventListener('pagehide', handleUnload);

  // Teardown
  return () => {
    window.removeEventListener('beforeunload', handleUnload);
    window.removeEventListener('pagehide', handleUnload);
    clearInterval(heartbeatTimer);
    clearInterval(cleanupTimer);

    handleUnload();

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
    if (ws) {
      try {
        ws.close();
      } catch {}
    }
  };
}
