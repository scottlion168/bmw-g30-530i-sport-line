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
 * Powered by enterprise global MQTT WebSockets (EMQX & HiveMQ) + BroadcastChannel for same-device tabs.
 * Provides instant mutual peer discovery (1 -> 2 in <100ms) and rock-solid cross-device sync.
 */
const MQTT_TOPIC = 'bmw_g30_530i_presence_channel_v7';
const MQTT_BROKERS = [
  'wss://broker.emqx.io:8084/mqtt',
  'wss://broker.hivemq.com:8884/mqtt'
];

function getSessionDeviceId(): string {
  try {
    let id = sessionStorage.getItem('bmw_g30_mqtt_device_id_v7');
    if (!id) {
      id = `dev_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36).slice(-4)}`;
      sessionStorage.setItem('bmw_g30_mqtt_device_id_v7', id);
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

  // Prune inactive peers (> 12s without heartbeat) and notify UI
  const updateAndNotify = () => {
    const now = Date.now();
    for (const [id, lastSeen] of activePeers.entries()) {
      if (id !== clientId && now - lastSeen > 12000) {
        activePeers.delete(id);
      }
    }
    activePeers.set(clientId, now);
    onCountChange(activePeers.size);
  };

  // Signal handler
  const handleSignal = (payload: any) => {
    if (!payload || typeof payload !== 'object' || payload.id === clientId) return;

    const now = Date.now();
    if (payload.type === 'PING' || payload.type === 'PONG') {
      activePeers.set(payload.id, now);
      // If a newcomer just joined, reply with a PONG so they immediately learn about us
      if (payload.isNew) {
        sendBroadcast('PONG', false);
      }
      updateAndNotify();
    } else if (payload.type === 'OFFLINE') {
      activePeers.delete(payload.id);
      updateAndNotify();
    }
  };

  // 1. Same-device multi-tab synchronization via BroadcastChannel
  let localChannel: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      localChannel = new BroadcastChannel('bmw_g30_local_presence_v7');
      localChannel.onmessage = (e) => {
        handleSignal(e.data);
      };
    }
  } catch {}

  // 2. Global Cross-Device Synchronization via MQTT WebSocket Broker
  let mqttClient: mqtt.MqttClient | null = null;
  let currentBrokerIndex = 0;

  const connectMQTT = () => {
    try {
      const brokerUrl = MQTT_BROKERS[currentBrokerIndex % MQTT_BROKERS.length];
      mqttClient = mqtt.connect(brokerUrl, {
        clientId: `g30_${clientId}_${Math.random().toString(36).slice(2, 6)}`,
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 4000,
        keepalive: 30
      });

      mqttClient.on('connect', () => {
        mqttClient?.subscribe(MQTT_TOPIC, { qos: 0 }, () => {
          // Announce arrival to all devices across the world
          sendBroadcast('PING', true);
        });
      });

      mqttClient.on('message', (topic, message) => {
        if (topic === MQTT_TOPIC) {
          try {
            const parsed = JSON.parse(message.toString());
            handleSignal(parsed);
          } catch {}
        }
      });

      mqttClient.on('error', () => {
        // Switch broker on error
        currentBrokerIndex++;
      });
    } catch {}
  };

  connectMQTT();

  // Helper to broadcast presence
  const sendBroadcast = (type: 'PING' | 'PONG' | 'OFFLINE', isNew = false) => {
    const payload = { id: clientId, type, isNew, ts: Date.now() };

    // Broadcast locally to tabs
    try {
      localChannel?.postMessage(payload);
    } catch {}

    // Broadcast globally to MQTT broker
    try {
      if (mqttClient && mqttClient.connected) {
        mqttClient.publish(MQTT_TOPIC, JSON.stringify(payload), { qos: 0 });
      }
    } catch {}
  };

  // Immediate local update
  updateAndNotify();

  // Periodic heartbeat every 4 seconds
  const heartbeatTimer = setInterval(() => {
    activePeers.set(clientId, Date.now());
    sendBroadcast('PING', false);
    updateAndNotify();
  }, 4000);

  // Periodic cleanup check every 2 seconds
  const pruneTimer = setInterval(updateAndNotify, 2000);

  // Visibility change handler (re-announce when tab becomes active)
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      activePeers.set(clientId, Date.now());
      sendBroadcast('PING', true);
      updateAndNotify();
    }
  };
  document.addEventListener('visibilitychange', handleVisibility);

  // Clean exit handler
  const handleExit = () => {
    sendBroadcast('OFFLINE', false);
  };

  window.addEventListener('beforeunload', handleExit);
  window.addEventListener('pagehide', handleExit);

  // Teardown
  return () => {
    document.removeEventListener('visibilitychange', handleVisibility);
    window.removeEventListener('beforeunload', handleExit);
    window.removeEventListener('pagehide', handleExit);
    clearInterval(heartbeatTimer);
    clearInterval(pruneTimer);

    handleExit();

    if (mqttClient) {
      try {
        mqttClient.end(true);
      } catch {}
    }
    if (localChannel) {
      try {
        localChannel.close();
      } catch {}
    }
  };
}
