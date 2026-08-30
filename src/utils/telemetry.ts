import mqtt from 'mqtt';

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

  if (isNewSession && success) {
    sessionStorage.setItem('bmw_g30_session_counted_2026', 'true');
  }

  return {
    allTime: Math.max(1, allTimeCount),
    monthly: Math.max(1, monthlyCount)
  };
}

/**
 * Real-time cross-device presence engine via WebSocket MQTT
 */
export function initRealtimePresence(onCountChange: (count: number) => void): () => void {
  const clientId = `bmw_user_${Math.random().toString(36).slice(2, 9)}_${Date.now()}`;
  const PRESENCE_TOPIC = 'bmw_g30_530i_presence/online_clients';
  const CLIENT_TOPIC = `bmw_g30_530i_presence/clients/${clientId}`;

  const activePeers = new Map<string, number>();
  activePeers.set(clientId, Date.now());

  const updateCount = () => {
    const now = Date.now();
    for (const [id, lastSeen] of activePeers.entries()) {
      if (now - lastSeen > 35000) {
        activePeers.delete(id);
      }
    }
    // Self is always at least 1
    if (!activePeers.has(clientId)) {
      activePeers.set(clientId, now);
    }
    onCountChange(activePeers.size);
  };

  let client: mqtt.MqttClient | null = null;
  let heartbeatInterval: any = null;
  let cleanupInterval: any = null;

  try {
    // Connect to public MQTT WebSocket broker (supporting SSL wss port 8084 / 8884)
    client = mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
      clientId,
      clean: true,
      keepalive: 20,
      connectTimeout: 5000,
      will: {
        topic: CLIENT_TOPIC,
        payload: Buffer.from(JSON.stringify({ type: 'OFFLINE', id: clientId })),
        qos: 0,
        retain: false
      }
    });

    client.on('connect', () => {
      // Subscribe to all client heartbeats
      client?.subscribe('bmw_g30_530i_presence/clients/#');

      // Send initial announcement
      const payload = JSON.stringify({ type: 'ONLINE', id: clientId, ts: Date.now() });
      client?.publish(CLIENT_TOPIC, payload);

      // Start periodic heartbeat every 10 seconds
      heartbeatInterval = setInterval(() => {
        if (client?.connected) {
          activePeers.set(clientId, Date.now());
          client.publish(CLIENT_TOPIC, JSON.stringify({ type: 'ONLINE', id: clientId, ts: Date.now() }));
          updateCount();
        }
      }, 10000);
    });

    client.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.id) {
          if (data.type === 'ONLINE') {
            activePeers.set(data.id, Date.now());
          } else if (data.type === 'OFFLINE') {
            activePeers.delete(data.id);
          }
          updateCount();
        }
      } catch {
        // ignore malformed message
      }
    });

    // Cleanup stale peers every 5 seconds
    cleanupInterval = setInterval(updateCount, 5000);

  } catch (e) {
    console.warn('Realtime presence connect fallback:', e);
  }

  // Cross-tab broadcast for instant local tabs on same device
  let localChannel: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      localChannel = new BroadcastChannel('bmw_g30_local_tabs');
      localChannel.onmessage = (e) => {
        if (e.data?.id && e.data.type === 'ONLINE') {
          activePeers.set(e.data.id, Date.now());
          updateCount();
        } else if (e.data?.id && e.data.type === 'OFFLINE') {
          activePeers.delete(e.data.id);
          updateCount();
        }
      };
      localChannel.postMessage({ type: 'ONLINE', id: clientId });
    }
  } catch {
    // Ignore
  }

  // Handle page exit / tab close
  const handleUnload = () => {
    if (localChannel) {
      try {
        localChannel.postMessage({ type: 'OFFLINE', id: clientId });
      } catch {}
    }
    if (client && client.connected) {
      try {
        client.publish(CLIENT_TOPIC, JSON.stringify({ type: 'OFFLINE', id: clientId }));
        client.end(true);
      } catch {}
    }
  };

  window.addEventListener('beforeunload', handleUnload);

  // Return teardown function
  return () => {
    window.removeEventListener('beforeunload', handleUnload);
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    if (cleanupInterval) clearInterval(cleanupInterval);
    if (localChannel) {
      try {
        localChannel.postMessage({ type: 'OFFLINE', id: clientId });
        localChannel.close();
      } catch {}
    }
    if (client) {
      try {
        client.publish(CLIENT_TOPIC, JSON.stringify({ type: 'OFFLINE', id: clientId }));
        client.end(true);
      } catch {}
    }
  };
}
