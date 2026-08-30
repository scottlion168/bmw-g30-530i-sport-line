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
 * Pure Zero-Dependency Native MQTT over WebSocket Client
 * Runs in standard browser WebSockets without external npm packages.
 */
class NativeMqttClient {
  private ws: WebSocket | null = null;
  public connected: boolean = false;
  private encoder = new TextEncoder();
  private decoder = new TextDecoder();
  private subscribedTopics = new Set<string>();

  constructor(
    private brokerUrls: string[],
    private clientId: string,
    private onMessageCallback: (topic: string, msg: string) => void,
    private onConnectCallback?: () => void
  ) {
    this.connect(0);
  }

  private connect(brokerIdx: number) {
    const url = this.brokerUrls[brokerIdx % this.brokerUrls.length];
    try {
      this.ws = new WebSocket(url, ['mqtt']);
      this.ws.binaryType = 'arraybuffer';

      this.ws.onopen = () => {
        // Send MQTT 3.1.1 CONNECT packet
        const proto = this.encodeString('MQTT');
        const client = this.encodeString(this.clientId);
        const payload = [...proto, 0x04, 0x02, 0x00, 0x3C, ...client];
        const pkt = new Uint8Array([0x10, ...this.encodeLength(payload.length), ...payload]);
        this.ws?.send(pkt);
      };

      this.ws.onmessage = (event) => {
        try {
          const bytes = new Uint8Array(event.data as ArrayBuffer);
          const type = bytes[0] >> 4;
          if (type === 2) {
            // CONNACK
            this.connected = true;
            this.onConnectCallback?.();
            for (const topic of this.subscribedTopics) {
              this.sendSubscribe(topic);
            }
          } else if (type === 3) {
            // PUBLISH
            let offset = 1;
            let multiplier = 1;
            let len = 0;
            let b = 0;
            do {
              b = bytes[offset++];
              len += (b & 0x7F) * multiplier;
              multiplier *= 128;
            } while ((b & 0x80) !== 0);

            const topicLen = (bytes[offset] << 8) | bytes[offset + 1];
            offset += 2;
            const topic = this.decoder.decode(bytes.subarray(offset, offset + topicLen));
            offset += topicLen;
            const payloadStr = this.decoder.decode(bytes.subarray(offset));
            this.onMessageCallback(topic, payloadStr);
          }
        } catch {}
      };

      this.ws.onerror = () => {
        this.connected = false;
      };

      this.ws.onclose = () => {
        this.connected = false;
        // Auto-reconnect to next broker after 4 seconds
        setTimeout(() => {
          this.connect(brokerIdx + 1);
        }, 4000);
      };
    } catch {
      setTimeout(() => {
        this.connect(brokerIdx + 1);
      }, 4000);
    }
  }

  private encodeString(str: string): number[] {
    const bytes = this.encoder.encode(str);
    return [bytes.length >> 8, bytes.length & 0xFF, ...Array.from(bytes)];
  }

  private encodeLength(len: number): number[] {
    const bytes: number[] = [];
    do {
      let digit = len % 128;
      len = Math.floor(len / 128);
      if (len > 0) digit |= 0x80;
      bytes.push(digit);
    } while (len > 0);
    return bytes;
  }

  private sendSubscribe(topic: string) {
    if (!this.connected || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const t = this.encodeString(topic);
    const payload = [0x00, 0x01, ...t, 0x00];
    const pkt = new Uint8Array([0x82, ...this.encodeLength(payload.length), ...payload]);
    this.ws.send(pkt);
  }

  public subscribe(topic: string) {
    this.subscribedTopics.add(topic);
    this.sendSubscribe(topic);
  }

  public publish(topic: string, str: string) {
    if (!this.connected || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const t = this.encodeString(topic);
    const payload = [...t, ...Array.from(this.encoder.encode(str))];
    const pkt = new Uint8Array([0x30, ...this.encodeLength(payload.length), ...payload]);
    this.ws.send(pkt);
  }

  public close() {
    this.connected = false;
    try {
      this.ws?.close();
    } catch {}
  }
}

/**
 * Real-time cross-device presence engine
 * Zero external dependencies: works out of the box with standard browser WebSockets!
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

  // 2. Global Cross-Device Synchronization via Native MQTT WebSocket Client
  let nativeMqtt: NativeMqttClient | null = null;

  try {
    nativeMqtt = new NativeMqttClient(
      MQTT_BROKERS,
      `g30_${clientId}_${Math.random().toString(36).slice(2, 6)}`,
      (topic, message) => {
        if (topic === MQTT_TOPIC) {
          try {
            const parsed = JSON.parse(message);
            handleSignal(parsed);
          } catch {}
        }
      },
      () => {
        nativeMqtt?.subscribe(MQTT_TOPIC);
        sendBroadcast('PING', true);
      }
    );
  } catch {}

  // Helper to broadcast presence
  const sendBroadcast = (type: 'PING' | 'PONG' | 'OFFLINE', isNew = false) => {
    const payload = { id: clientId, type, isNew, ts: Date.now() };

    // Broadcast locally to tabs
    try {
      localChannel?.postMessage(payload);
    } catch {}

    // Broadcast globally to MQTT broker
    try {
      if (nativeMqtt && nativeMqtt.connected) {
        nativeMqtt.publish(MQTT_TOPIC, JSON.stringify(payload));
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

    if (nativeMqtt) {
      try {
        nativeMqtt.close();
      } catch {}
    }
    if (localChannel) {
      try {
        localChannel.close();
      } catch {}
    }
  };
}
