import { MilestoneItem, OBDDiagnosticCode, HunterAlignmentData } from '../types';

export const HUNTER_ALIGNMENT_RECORD: HunterAlignmentData = {
  before: {
    front: {
      left: { camber: "-0°27'", caster: "6°32'", toe: "0°09'", status: "normal" },
      right: { camber: "-0°26'", caster: "6°33'", toe: "0°09'", status: "normal" },
      totalToe: "0°18'"
    },
    rear: {
      left: { camber: "-1°33'", toe: "0°10'", status: "warning" },
      right: { camber: "-1°22'", toe: "0°08'", status: "warning" },
      totalToe: "0°18'",
      thrustAngle: "-0°08'"
    }
  },
  after: {
    front: {
      left: { camber: "-0°26'", caster: "6°32'", toe: "0°04'", status: "optimal" },
      right: { camber: "-0°24'", caster: "6°33'", toe: "0°04'", status: "optimal" },
      totalToe: "0°08'"
    },
    rear: {
      left: { camber: "-1°39'", toe: "0°10'", status: "optimal" },
      right: { camber: "-1°39'", toe: "0°10'", status: "optimal" },
      totalToe: "0°20'",
      thrustAngle: "0°00'"
    }
  }
};

export const B46_MILESTONES: MilestoneItem[] = [
  {
    id: 'milestone-57k',
    km: 57121,
    date: '2023-09-30',
    title: '冷卻水路爆管洩漏 & 全車大保養總檢',
    system: 'cooling',
    systemLabel: '冷卻水路系統 (B46/B48 模組通病)',
    severity: 'critical',
    description: '於新北山區行駛時突發冷卻液過低告警，加水後直接洩漏。拖吊回廠檢修發現副水箱散熱管路脆化破裂。藉此契機同步實施 60,000 km 規格全車深度大保養。',
    symptoms: '儀表跳出冷卻液補充通知，水溫異常，添加純水後立即由底盤洩漏。',
    solution: '更換原廠引擎冷卻液軟管、進氣岐管墊片(4入)、ZF 8HP50 變速箱油與濾網油底殼總成、火星塞(4入)、後差速器油、水箱精及周邊耗材。',
    cost: 46320,
    parts: [
      { name: '引擎冷卻液軟管 (Cylinder Head Expansion Hose)', partNumber: 'HOSE-B46-EXP', brand: 'BMW 原廠' },
      { name: '進氣岐管墊片 (Intake Gasket Seal)', partNumber: 'GASKET-B46-INTAKE', brand: 'BMW 原廠 (x4)' },
      { name: 'ZF 8HP50 變速箱油底殼濾網+墊片總成', partNumber: 'ZF-8HP50-PAN', brand: 'ZF 正廠' },
      { name: '變速箱專用油', partNumber: 'ZF-LIFEGUARD-8', brand: 'ZF 原廠 (5.5L)' },
      { name: 'BMW 原廠火星塞', partNumber: 'SPARK-PLUG-SILVER', brand: 'BMW 原廠 (x4)' },
      { name: '差速器油', partNumber: 'Syntrax 75W140 LSD', brand: 'Castrol' },
      { name: '水箱長效冷卻液', partNumber: 'Radiator Long-Life Coolant', brand: 'WURTH (x5)' }
    ],
    tags: ['B46模組通病', '水路爆管', '6萬大保養', '變速箱油底殼']
  },
  {
    id: 'milestone-71k',
    km: 71608,
    date: '2024-07-30',
    title: 'AKKS 主動進氣散熱百葉窗組件總成更換',
    system: 'aero',
    systemLabel: '主動散熱氣動系統 (AKKS)',
    severity: 'warning',
    description: '多次出現發動機黃色警示燈長亮，OBD 電腦讀取顯示 21B043 / 21B044 / 138207 主動進氣調節格柵上部卡住。經多次清除故障碼後仍復發，遂拆卸前保險桿更換全新改良版總成。',
    symptoms: '引擎黃燈長亮，主動式進氣格柵無法隨水溫正常開闔，偶發結冰/高溫卡死代碼。',
    solution: '拆卸前保險桿，更換 BMW 正廠主動式進氣調節散熱百葉窗組件總成。',
    cost: 15800,
    parts: [
      { name: '散熱器百葉窗組件 (Radiator Shutter Assembly)', partNumber: '51747497279', brand: 'BMW 正廠' }
    ],
    obdCodes: ['21B043', '21B044', '138207'],
    tags: ['G30常見通病', 'AKKS百葉窗', '引擎燈長亮', '拆前保桿']
  },
  {
    id: 'milestone-76k',
    km: 76866,
    date: '2025-03-08',
    title: '原廠 TPMS 433MHz 胎壓感知器整組更換 (4輪)',
    system: 'chassis',
    systemLabel: '底盤電控與胎壓監測',
    severity: 'info',
    description: '行車電腦讀取到 48077E 故障碼（左後/右後車輪電子系統電池壽命到期），因已使用滿 7 年內置鋰電池耗盡，遂全車 4 輪同步換裝全新原廠胎壓發射器。',
    symptoms: '胎壓系統偶發無法顯示數值需頻繁重置，電腦偵測到胎壓感知器內建電池壽命終止。',
    solution: '更換 4 顆 BMW 原廠 433MHz TPMS 胎壓感知器發射器並重新配對學習。',
    cost: 17200,
    parts: [
      { name: 'TPMS 433MHz 胎壓感應發射器', partNumber: '36106876957', brand: 'BMW 原廠 (x4)' }
    ],
    obdCodes: ['48077E'],
    tags: ['7年耗材壽命', 'TPMS', 'RDCi胎壓監測']
  },
  {
    id: 'milestone-81k',
    km: 81575,
    date: '2026-03-28',
    title: 'AGM 雙電瓶系統梯次更換 (副電瓶 51k km / 主電瓶 85k km)',
    system: 'electronics',
    systemLabel: '車載供電與電源管理系統',
    severity: 'warning',
    description: 'G30 配備高規格雙電瓶架構。於 51,197 km 更換前艙 BOSCH 60Ah 輔助副電瓶；於 85,574 km 更換後行李箱 VARTA 92Ah AGM 主電瓶，恢復全車啟停與電網充放效能。',
    symptoms: '車載電網電壓偏低，電腦出現 802A30 (加熱座椅因電網受限降功) 代碼。',
    solution: '換裝 BOSCH 12V 60Ah AGM 輔助電瓶與 VARTA 12V 92Ah AGM 850A 主電瓶，並使用專用診斷儀完成電瓶註冊配對。',
    cost: 24830,
    parts: [
      { name: '輔助副電瓶 12V 60Ah AGM 660A', partNumber: '0092S67116', brand: 'BOSCH' },
      { name: '主電瓶 12V 92Ah AGM 850A', partNumber: 'A0019828208', brand: 'VARTA' }
    ],
    tags: ['雙電瓶架構', 'AGM深度放電', '電瓶註冊', '電網穩定']
  },
  {
    id: 'milestone-89k',
    km: 89746,
    date: '2026-08-22',
    title: 'B46 熱管理大修：水泵浦 / 節溫器 / 機油芯座預防性總更換',
    system: 'cooling',
    systemLabel: '熱管理與冷卻模組 (B46/B48 核心預防性保養)',
    severity: 'critical',
    description: '里程接近 90,000 km 臨界點，針對 B46/B48 模組化引擎最受關注之熱管理模組塑膠老化通病（機油芯座龜裂滲油滲水、電子節溫器老化、機械水泵浦軸承老化），進行全套預防性預防大修。',
    symptoms: '預防性施工，避免機油與冷卻水混合（奶昔）造成引擎本體永久性重大損傷。',
    solution: '一次性工單更換全新節溫器總成、強化型機油芯座、引擎水泵浦、上水管、水管轉接頭與全新長效水箱精。',
    cost: 64050,
    parts: [
      { name: '電子節溫器總成 (Thermostat Housing Assembly)', partNumber: 'THERMOSTAT-B46-OEM', brand: 'BMW 原廠' },
      { name: '引擎機油芯座總成 (Engine Oil Filter Housing)', partNumber: 'HOUSING-OF-B46', brand: 'BMW 原廠改良件' },
      { name: '引擎水泵浦總成 (Coolant Water Pump)', partNumber: 'WP-B46-GENUINE', brand: 'BMW 原廠' },
      { name: '冷卻散熱上水管 (Upper Radiator Hose)', partNumber: 'UP-HOSE-G30', brand: 'BMW 原廠' },
      { name: '散熱水管轉接頭組件', partNumber: 'CONN-PIPE-SET', brand: 'BMW 原廠' },
      { name: 'BMW 原廠機油濾芯', partNumber: '11428575211', brand: 'BMW 原廠' },
      { name: 'Castrol EDGE 5W30M 機油', partNumber: '5W30M-5.5L', brand: 'Castrol' }
    ],
    tags: ['B46終極通病預防', '機油芯座', '水泵浦', '節溫器總成', '預防性大修']
  }
];

export const B48_MILESTONES = B46_MILESTONES; // Alias for backward compatibility

export const OBD_CODES_LIST: OBDDiagnosticCode[] = [
  {
    code: '21B043',
    system: '散熱與氣動 (AKKS)',
    description: '主動式進氣調節水箱護罩 (AKKS) - 上部 <卡住>',
    symptom: '儀表黃色發動機警示燈常亮，百葉窗無法正常作動',
    vehicleStatus: '在 46,884 km、66,053 km、70,470 km、71,362 km 多次觸發',
    solution: '於 71,608 km 拆卸前保險桿更換 BMW 原廠百葉窗組件總成 (料號 51747497279) 徹底根治',
    severity: 'high',
    occurrences: ['2022-09-24', '2024-02-19', '2024-06-23', '2024-07-21']
  },
  {
    code: '21B044',
    system: '散熱與氣動 (AKKS)',
    description: '主動式進氣調節水箱護罩 (AKKS) - 上部 <結冰/阻力異常>',
    symptom: '低溫或受阻時馬達轉矩回授過載觸發保護',
    vehicleStatus: '伴隨 21B043 同步觸發',
    solution: '隨 71,608 km 百葉窗組件總成更換後排除',
    severity: 'medium',
    occurrences: ['2022-09-24', '2024-02-19', '2024-06-23']
  },
  {
    code: '138207',
    system: '散熱與氣動 (AKKS)',
    description: '主動式進氣調節水箱護罩 (AKKS) - 上部 <在環境溫度溫暖時卡住>',
    symptom: '高溫散熱需求下百葉窗無法開啟',
    vehicleStatus: '伴隨 AKKS 馬達機構卡滯連鎖觸發',
    solution: '更換原廠散熱百葉窗總成料號 51747497279',
    severity: 'medium',
    occurrences: ['2022-09-24', '2024-02-19', '2024-06-23']
  },
  {
    code: '194006',
    system: '燃油蒸發排放 (NVLD)',
    description: '燃油箱洩漏診斷模組 (NVLD) - 電磁閥 <打開卡死>',
    symptom: '發動機故障燈偶發亮起，油箱通風壓力異常',
    vehicleStatus: '於 46,659 km 初次記錄，後續清除與監控',
    solution: '後續於 88,713 km 更換全新碳罐電磁閥 (料號 13907643106)',
    severity: 'medium',
    occurrences: ['2022-09-10', '2022-10-29']
  },
  {
    code: '190302',
    system: '燃油蒸發排放 (NVLD)',
    description: '油箱洩漏診斷模組 (NVLD)、油箱通風系統、檢測到大於 0.5 毫米微洩漏',
    symptom: '行駛無異常感受，但電腦持續記錄微量蒸氣外洩',
    vehicleStatus: '在 76,808 km 及 80,931 km 檢出',
    solution: '經電腦診斷後於 80,931 km 執行模組軟體策略設定並於 88,713 km 換裝原廠碳罐電磁閥 (13907643106)',
    severity: 'medium',
    occurrences: ['2025-03-03', '2025-08-02']
  },
  {
    code: '48077E',
    system: '底盤輪胎 (RDCi)',
    description: 'RDCi 左後/右後車輪電子系統，電池使用壽命耗盡',
    symptom: '胎壓無法顯示或需頻繁重新學習配對',
    vehicleStatus: '76,808 km 檢出 (出廠滿7年壽命)',
    solution: '全車 4 輪更換 BMW 原廠 TPMS 433MHz 發射器 (料號 36106876957)',
    severity: 'low',
    occurrences: ['2025-03-03']
  },
  {
    code: '804365',
    system: '空調舒適 (IHKA/BDC)',
    description: '後座區空氣分區調節器，接地短路',
    symptom: '後座空調面板微訊號異常',
    vehicleStatus: '76,808 km 及 80,931 km 診斷讀取',
    solution: '專用診斷儀排查後座分區電路並清除歷史干擾',
    severity: 'low',
    occurrences: ['2025-03-03', '2025-08-02']
  },
  {
    code: '802A30',
    system: '車載電源管理 (SMFA)',
    description: '座椅加熱裝置：由於車載電網可用性受限而降低加熱功率',
    symptom: '電瓶電壓過低時車輛自動降載非關鍵大功率電器',
    vehicleStatus: '80,931 km 檢出，提示電瓶壽命衰退',
    solution: '排查後於 85,574 km 更換 VARTA 92Ah AGM 主電瓶後完全恢復正常',
    severity: 'low',
    occurrences: ['2025-08-02']
  }
];

export const HIDDEN_FEATURES_LIST = [
  { id: 1, name: '怠速自動熄火記憶功能', status: '開啟', note: '記憶最後手動狀態，上車免手動關閉' },
  { id: 2, name: '即時胎壓+胎溫監控 (RDC)', status: '開啟', note: '儀表與中控可即時顯示四輪數值與溫度' },
  { id: 3, name: 'Comfort Plus 舒適+ 模式', status: '開啟', note: '釋放原廠被隱藏之頂級懸吊舒適模式' },
  { id: 4, name: 'Sport Plus 運動+ 模式', status: '開啟', note: '油門反應更靈敏，變速箱換檔邏輯更激進' },
  { id: 5, name: '預設駕駛模式 EcoPro', status: '開啟', note: '發動預設節能模式' },
  { id: 6, name: '儀表數位時速 / 水溫計 / 指南針顯示', status: '開啟', note: 'BC 鍵循環顯示數位即時數據' },
  { id: 7, name: '氣氛燈 11 色自定義切換', status: '開啟', note: '解鎖更多內裝氛圍配色方案' },
  { id: 8, name: '緊急煞車時自動雙閃黃燈', status: '開啟', note: '重踩急煞觸發主動警示後車防追撞' },
  { id: 9, name: '未熄火上鎖取消喇叭鳴聲', status: '開啟', note: '避免深夜離車取物喇叭驚擾鄰居' },
  { id: 10, name: '開門車窗一鍵升降功能', status: '開啟', note: '車門開啟狀態下窗戶仍可單鍵到底' },
  { id: 11, name: '冷氣內循環記憶功能', status: '開啟', note: '熄火重啟後鎖定內循環，阻隔車外異味' },
  { id: 12, name: '後倒車鏡頭拖車勾放大模式', status: '開啟', note: '倒車影像支援保桿極限俯視視角' },
  { id: 13, name: '解除行車中螢幕限制 (Video in Motion)', status: '開啟', note: 'USB/影音行進播放限制解除' },
  { id: 14, name: '鎖車自動折疊後視鏡', status: '開啟', note: '鎖車即時收折後照鏡' },
  { id: 15, name: '大燈開關完全關閉支援', status: '開啟', note: '支援強制手動完全關閉頭燈' },
  { id: 16, name: '尾部日行燈常亮', status: '開啟', note: '白天日行燈開啟時尾燈同步亮起提升辨識度' },
  { id: 17, name: '美規側邊橘黃角燈關閉', status: '關閉', note: '美規外匯專屬設定，視覺更淨白' },
  { id: 18, name: '剩餘里程加油提前警示 (90km/50km)', status: '開啟', note: '加強油量警示' },
  { id: 19, name: '加裝硬體限速資訊模組 (SLI)', status: '開啟', note: '儀表辨識限速標誌與抬頭顯示' },
  { id: 20, name: 'GPS 自動校時功能', status: '開啟', note: '透過車載衛星訊號自動對時' }
];
