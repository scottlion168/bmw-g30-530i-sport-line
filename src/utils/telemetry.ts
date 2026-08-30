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
 * Real-time cross-device presence engine using standard browser WebSockets + BroadcastChannel
 * Pure web standards, zero third-party Node.js dependencies (100% compatible with GitHub Actions / Vite / Cloudflare / Vercel)
 */
export function initRealtimePresence(onCountChange: (count: number) => void): () => void {
  const clientId = `client_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
  const activePeers = new Map<string, number>();
  activePeers.set(clientId, Date.now());

  const updateCount = () => {
    const now = Date.now();
    for (const [id, lastSeen] of activePeers.entries()) {
      if (now - lastSeen > 30000) {
        activePeers.delete(id);
      }
    }
    if (!activePeers.has(clientId)) {
      activePeers.set(clientId, now);
    }
    onCountChange(activePeers.size);
  };

  // 1. Native WebSocket Connection to public presence echo relay (PieSocket / SocketsBay public channel)
  let ws: WebSocket | null = null;
  let wsHeartbeat: any = null;

  try {
    // SocketsBay / PieSocket public presence stream
    ws = new WebSocket('wss://socketsbay.com/wss/v2/1/demo/');

    ws.onopen = () => {
      ws?.send(JSON.stringify({ room: 'bmw_g30_530i_garage', type: 'ONLINE', id: clientId, ts: Date.now() }));
      
      wsHeartbeat = setInterval(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          activePeers.set(clientId, Date.now());
          ws.send(JSON.stringify({ room: 'bmw_g30_530i_garage', type: 'PING', id: clientId, ts: Date.now() }));
          updateCount();
        }
      }, 12000);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.room === 'bmw_g30_530i_garage' && data.id && data.id !== clientId) {
          if (data.type === 'ONLINE' || data.type === 'PING') {
            activePeers.set(data.id, Date.now());
            // Reply with our presence so the new peer knows we exist
            if (data.type === 'ONLINE' && ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ room: 'bmw_g30_530i_garage', type: 'PING', id: clientId, ts: Date.now() }));
            }
          } else if (data.type === 'OFFLINE') {
            activePeers.delete(data.id);
          }
          updateCount();
        }
      } catch {
        // Ignore non-json messages
      }
    };
  } catch (e) {
    console.warn('Native WebSocket connection notice:', e);
  }

  // 2. BroadcastChannel for instant local cross-tab sync on same machine
  let localChannel: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      localChannel = new BroadcastChannel('bmw_g30_presence_local');
      localChannel.onmessage = (e) => {
        if (e.data?.id) {
          if (e.data.type === 'ONLINE' || e.data.type === 'PING') {
            activePeers.set(e.data.id, Date.now());
            if (e.data.type === 'ONLINE') {
              localChannel?.postMessage({ type: 'PING', id: clientId });
            }
          } else if (e.data.type === 'OFFLINE') {
            activePeers.delete(e.data.id);
          }
          updateCount();
        }
      };
      localChannel.postMessage({ type: 'ONLINE', id: clientId });
    }
  } catch {
    // Ignore
  }

  // 3. Cleanup stale peers every 5s
  const cleanupTimer = setInterval(updateCount, 5000);

  // 4. Handle page exit
  const handleUnload = () => {
    if (localChannel) {
      try {
        localChannel.postMessage({ type: 'OFFLINE', id: clientId });
      } catch {}
    }
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ room: 'bmw_g30_530i_garage', type: 'OFFLINE', id: clientId }));
        ws.close();
      } catch {}
    }
  };

  window.addEventListener('beforeunload', handleUnload);

  return () => {
    window.removeEventListener('beforeunload', handleUnload);
    if (wsHeartbeat) clearInterval(wsHeartbeat);
    if (cleanupTimer) clearInterval(cleanupTimer);
    if (localChannel) {
      try {
        localChannel.postMessage({ type: 'OFFLINE', id: clientId });
        localChannel.close();
      } catch {}
    }
    if (ws) {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ room: 'bmw_g30_530i_garage', type: 'OFFLINE', id: clientId }));
        }
        ws.close();
      } catch {}
    }
  };
}
