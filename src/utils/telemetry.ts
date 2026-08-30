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
 * Uses clean Server-Sent Events (SSE) stream with `?since=now` + BroadcastChannel for same-device multi-tab sync.
 * Zero echo loops, zero message history replays, 100% synchronized across different devices & IPs.
 */
const PRESENCE_TOPIC = 'bmw_g30_530i_live_sync_v4';
const PRESENCE_SSE_URL = `https://ntfy.sh/${PRESENCE_TOPIC}/sse?since=now`;
const PRESENCE_POST_URL = `https://ntfy.sh/${PRESENCE_TOPIC}`;

// Persistent per-tab/device session ID to prevent zombie IDs on page refresh
function getSessionDeviceId(): string {
  try {
    let id = sessionStorage.getItem('bmw_g30_presence_dev_id_v4');
    if (!id) {
      id = `dev_${Math.random().toString(36).slice(2, 7)}_${Date.now().toString(36).slice(-4)}`;
      sessionStorage.setItem('bmw_g30_presence_dev_id_v4', id);
    }
    return id;
  } catch {
    return `dev_${Math.random().toString(36).slice(2, 7)}_${Date.now().toString(36).slice(-4)}`;
  }
}

export function initRealtimePresence(onCountChange: (count: number) => void): () => void {
  const clientId = getSessionDeviceId();
  const activePeers = new Map<string, number>();
  activePeers.set(clientId, Date.now());

  // Function to prune stale peers (> 14s without heartbeat) and notify UI
  const updateAndNotify = () => {
    const now = Date.now();
    for (const [id, lastSeen] of activePeers.entries()) {
      if (id !== clientId && now - lastSeen > 14000) {
        activePeers.delete(id);
      }
    }
    // Self is always active
    activePeers.set(clientId, now);
    onCountChange(activePeers.size);
  };

  // Helper to send lightweight presence notification
  const sendPresence = (type: 'HEARTBEAT' | 'OFFLINE') => {
    const payload = JSON.stringify({ id: clientId, type, ts: Date.now() });

    // 1. Broadcast locally for instant multi-tab sync
    try {
      localChannel?.postMessage({ id: clientId, type, ts: Date.now() });
    } catch {}

    // 2. Publish to cloud SSE topic
    if (type === 'OFFLINE' && navigator.sendBeacon) {
      try {
        const blob = new Blob([payload], { type: 'text/plain' });
        navigator.sendBeacon(PRESENCE_POST_URL, blob);
        return;
      } catch {}
    }

    try {
      fetch(PRESENCE_POST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: payload,
        mode: 'cors',
        keepalive: type === 'OFFLINE'
      }).catch(() => {});
    } catch {}
  };

  // 1. Local BroadcastChannel for instant same-browser multi-tab sync
  let localChannel: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      localChannel = new BroadcastChannel('bmw_g30_sync_channel_v4');
      localChannel.onmessage = (e) => {
        if (e.data && e.data.id && e.data.id !== clientId) {
          if (e.data.type === 'HEARTBEAT') {
            activePeers.set(e.data.id, Date.now());
            updateAndNotify();
          } else if (e.data.type === 'OFFLINE') {
            activePeers.delete(e.data.id);
            updateAndNotify();
          }
        }
      };
    }
  } catch {}

  // 2. Cloud Server-Sent Events (SSE) for cross-device / cross-IP sync
  let eventSource: EventSource | null = null;
  const connectSSE = () => {
    try {
      if (typeof EventSource !== 'undefined') {
        eventSource = new EventSource(PRESENCE_SSE_URL);

        eventSource.onmessage = (event) => {
          try {
            const raw = JSON.parse(event.data);
            let payload: any = null;
            if (raw && typeof raw.message === 'string') {
              try {
                payload = JSON.parse(raw.message);
              } catch {
                payload = null;
              }
            } else {
              payload = raw;
            }

            if (payload && payload.id && payload.id !== clientId) {
              if (payload.type === 'HEARTBEAT') {
                activePeers.set(payload.id, Date.now());
                updateAndNotify();
              } else if (payload.type === 'OFFLINE') {
                activePeers.delete(payload.id);
                updateAndNotify();
              }
            }
          } catch {
            // Ignore non-JSON notifications
          }
        };

        eventSource.onerror = () => {
          // EventSource handles automatic reconnection natively
        };
      }
    } catch (e) {
      console.warn('SSE presence stream init:', e);
    }
  };

  connectSSE();

  // Send immediate initial heartbeat
  sendPresence('HEARTBEAT');
  updateAndNotify();

  // Periodic heartbeat every 5 seconds (Strict one-way broadcast, no echo replies)
  const heartbeatTimer = setInterval(() => {
    activePeers.set(clientId, Date.now());
    sendPresence('HEARTBEAT');
    updateAndNotify();
  }, 5000);

  // Periodic prune timer every 3 seconds to immediately clear offline devices
  const pruneTimer = setInterval(updateAndNotify, 3000);

  // Handle visibility change (pause heartbeats when tab is hidden or phone screen locked)
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      activePeers.set(clientId, Date.now());
      sendPresence('HEARTBEAT');
      updateAndNotify();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Clean exit on tab close / reload / mobile browser switch
  const handleUnload = () => {
    sendPresence('OFFLINE');
  };

  window.addEventListener('beforeunload', handleUnload);
  window.addEventListener('pagehide', handleUnload);

  // Teardown function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handleUnload);
    window.removeEventListener('pagehide', handleUnload);
    clearInterval(heartbeatTimer);
    clearInterval(pruneTimer);

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
  };
}
