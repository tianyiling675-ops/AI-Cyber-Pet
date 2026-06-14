/* ============================================================
 *  共享数据层 data.js
 *  主页面 pet-collar-3d.html 与各模块详情页统一引用。
 *  改这里的配色 / 传感器参数，所有页面同步生效。
 * ============================================================ */

// size=32 时的参考半径（几何统一用它构建，再等比缩放）
export const REF_R = 1.324;

/* ---------- 外观风格定义 ---------- */
export const STYLES = {
  sport: { name:'竞速机能', sub:'棱角硬壳 · 薄荷绿', form:'tactical',
    band:0x14171c, bandRough:0.45, bandMetal:0.2, bandFlat:0.64, tube:0.265,
    pod:0x0d0f13, podRough:0.3, podMetal:0.6, accent:0x7cf5c4,
    stitch:0x7cf5c4, buckle:0x2a2e36, buckleMetal:0.9, fabric:false, tag:'hex',
    swatch:['#14171c','#7cf5c4','#0d0f13'] },
  mint: { name:'极简纤薄', sub:'胶囊圆柱 · 陶瓷白', form:'slim',
    band:0xeef1f4, bandRough:0.6, bandMetal:0.05, bandFlat:0.56, tube:0.225,
    pod:0xfafbfc, podRough:0.35, podMetal:0.1, accent:0x46d3ff, stitch:0xc6ccd4,
    buckle:0xd7dde4, buckleMetal:0.4, fabric:false, tag:'pill',
    swatch:['#eef1f4','#46d3ff','#fafbfc'] },
  candy: { name:'萌宠泡泡', sub:'圆润鼓包 · 珊瑚粉', form:'bubble',
    band:0xff8fab, bandRough:0.7, bandMetal:0.02, bandFlat:0.66, tube:0.285,
    pod:0xfff4e6, podRough:0.4, podMetal:0.05, accent:0xffd166, stitch:0xffffff,
    buckle:0xffb4c6, buckleMetal:0.2, fabric:true, tag:'heart',
    swatch:['#ff8fab','#ffd166','#fff4e6'] },
  leather: { name:'复古铆钉', sub:'扁平皮牌 · 黄铜扣', form:'classic',
    band:0x6b4226, bandRough:0.78, bandMetal:0.05, bandFlat:0.52, tube:0.255,
    pod:0x2c2620, podRough:0.45, podMetal:0.5, accent:0xc9a44c, stitch:0xd9b88a,
    buckle:0xc9a44c, buckleMetal:0.85, fabric:true, tag:'bone',
    swatch:['#6b4226','#c9a44c','#2c2620'] },
  midnight: { name:'六角装甲', sub:'多面棱镜 · 钛石墨', form:'armor',
    band:0x23262d, bandRough:0.35, bandMetal:0.7, bandFlat:0.66, tube:0.270,
    pod:0x171a1f, podRough:0.25, podMetal:0.85, accent:0x46d3ff, stitch:0x3a3f48,
    buckle:0x4a505a, buckleMetal:1.0, fabric:false, tag:'shield',
    swatch:['#23262d','#46d3ff','#171a1f'] },
  sakura: { name:'花瓣环绕', sub:'花形软壳 · 樱粉紫', form:'petal',
    band:0xc8a8e9, bandRough:0.62, bandMetal:0.08, bandFlat:0.64, tube:0.275,
    pod:0xf6edff, podRough:0.38, podMetal:0.1, accent:0xff9ec7, stitch:0xffffff,
    buckle:0xd9c2f0, buckleMetal:0.3, fabric:true, tag:'flower',
    swatch:['#c8a8e9','#ff9ec7','#f6edff'] },
};

/* ---------- 传感器图标（SVG path） ---------- */
export const ICON = {
  heart:'<path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 7 2.5C19 15.5 12 20 12 20z"/>',
  temp:'<path d="M10 13V5a2 2 0 1 1 4 0v8a4 4 0 1 1-4 0z"/>',
  motion:'<path d="M5 12h4l2-5 3 10 2-5h3"/>',
  gps:'<path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/>',
};

/* ---------- 传感器定义（分布式布置 + 详情数据） ----------
 * 详情页（detail.html）会用到每个传感器的 desc / specs / principle / blueprint
 * principle = 设计原理文案；blueprint = SVG 工程示意图
 */
export const SENSORS = [
  { id:'pod',   name:'环形主板',   sub:'SoC·电池·蓝牙', angle:Math.PI*1.5, big:true,  color:0x7cf5c4, icon:'motion',
    desc:'圆环内部集成双核低功耗 SoC、300mAh 弧形电池、BLE/NFC 通信与电源管理，4pin 磁吸充电。',
    specs:[['芯片','nRF5340 双核'],['电池','300mAh 锂聚合物'],['续航','7–14 天'],['连接','蓝牙 5.3 / NFC']],
    principle:'主控、电源管理、存储和 300mAh 弧形锂电池沿圆环曲率布置，被 PC+ABS 环形骨架与连续包胶封装在内部。4pin 磁吸 pogo pin 通过密封焊盘接入电源路径，整机按 IP68 设计，外观不需要外挂盒体。',
    blueprint:`<svg viewBox="0 0 240 120" width="100%" style="max-width:300px;display:block" font-family="Sora" fill="none">
<rect x="92" y="44" width="56" height="32" rx="6" fill="rgba(124,245,196,.14)" stroke="#7cf5c4" stroke-width="1.4"/>
<text x="120" y="60" text-anchor="middle" fill="#e8edf4" font-size="11" font-weight="600">MCU</text>
<text x="120" y="72" text-anchor="middle" fill="#8b97a8" font-size="8">nRF5340 双核</text>
<rect x="12" y="50" width="50" height="22" rx="4" stroke="#46d3ff" stroke-width="1.2"/><text x="37" y="64" text-anchor="middle" fill="#e8edf4" font-size="8.5">电池 300mAh</text>
<rect x="178" y="50" width="50" height="22" rx="4" stroke="#46d3ff" stroke-width="1.2"/><text x="203" y="64" text-anchor="middle" fill="#e8edf4" font-size="8.5">蓝牙 5.3</text>
<rect x="48" y="12" width="56" height="20" rx="4" stroke="#8b97a8" stroke-width="1.2"/><text x="76" y="25" text-anchor="middle" fill="#e8edf4" font-size="8.5">GPS · 北斗</text>
<rect x="136" y="12" width="56" height="20" rx="4" stroke="#8b97a8" stroke-width="1.2"/><text x="164" y="25" text-anchor="middle" fill="#e8edf4" font-size="8.5">传感器阵列</text>
<rect x="92" y="96" width="56" height="16" rx="4" stroke="#ffb454" stroke-width="1.2"/><text x="120" y="107" text-anchor="middle" fill="#e8edf4" font-size="8.5">磁吸充电</text>
<path d="M62 61 H92 M148 61 H178 M104 44 V32 M136 44 V32 M120 76 V96" stroke="#7cf5c4" stroke-width="1" opacity=".5"/>
</svg>` },
  { id:'heart', name:'心率传感',  sub:'内侧左 PPG', angle:-Math.PI/2-1.08, color:0xff6b6b, icon:'heart',
    desc:'布置在内侧左下弧段的齐平贴肤式绿光 + 红外双波长 PPG，删除开关按钮同侧传感窗口，并以 C 型扣中线为轴和体温窗对称分布。',
    specs:[['精度','±2 BPM'],['采样','连续 24h'],['波长','525 / 880nm'],['功能','心律预警 / HRV']],
    principle:'绿光(525nm)+红外(880nm)双波长 PPG 光电容积描记：传感窗嵌入圆环内侧左下贴颈区，表面只留下位置图案，与圆环包胶齐平。它避开外侧开关按钮，并以底部 C 型扣中线为对称轴与体温窗分布在两侧。',
    blueprint:`<svg viewBox="0 0 240 120" width="100%" style="max-width:300px;display:block" font-family="Sora" fill="none">
<circle cx="40" cy="60" r="9" fill="rgba(255,107,107,.2)" stroke="#ff6b6b" stroke-width="1.4"/><text x="40" y="86" text-anchor="middle" fill="#8b97a8" font-size="8.5">LED 光源</text>
<rect x="78" y="44" width="84" height="40" rx="6" fill="rgba(255,180,84,.08)" stroke="#ffb454" stroke-width="1.2"/>
<path d="M86 64 q12 -18 24 0 t24 0 t24 0" stroke="#ff6b6b" stroke-width="1.6"/><text x="120" y="36" text-anchor="middle" fill="#8b97a8" font-size="8.5">皮下毛细血管</text>
<circle cx="200" cy="60" r="9" fill="rgba(70,211,255,.18)" stroke="#46d3ff" stroke-width="1.4"/><text x="200" y="86" text-anchor="middle" fill="#8b97a8" font-size="8.5">光电探测器</text>
<path d="M50 54 L78 52" stroke="#ff6b6b" stroke-width="1.2" opacity=".7" marker-end="url(#a)"/>
<path d="M162 52 L190 54" stroke="#7cf5c4" stroke-width="1.2" opacity=".7"/>
<text x="120" y="108" text-anchor="middle" fill="#e8edf4" font-size="9">光反射随血量变化 → 还原心率</text>
</svg>` },
  { id:'temp',  name:'体温监测',  sub:'内侧右红外', angle:-Math.PI/2+1.08, color:0xffb454, icon:'temp',
    desc:'布置在内侧右下弧段的齐平红外热电堆 + 环境补偿，和 PPG 窗以 C 型扣中线为轴对称，避开外侧开关按钮区域。',
    specs:[['精度','±0.1 ℃'],['量程','32–43 ℃'],['响应','1 秒'],['功能','发热预警']],
    principle:'医疗级红外热电堆嵌入圆环内侧右下贴颈区，表面只留下齐平位置图案。它和 PPG 窗以底部 C 型扣中线为轴左右对称，共同避开外侧开关按钮区域。配合环境温度通道做差分补偿，降低毛发隔热层与外界温漂影响，趋势精度目标 ±0.1℃。',
    blueprint:`<svg viewBox="0 0 240 120" width="100%" style="max-width:300px;display:block" font-family="Sora" fill="none">
<rect x="84" y="14" width="72" height="30" rx="5" fill="rgba(255,180,84,.14)" stroke="#ffb454" stroke-width="1.4"/>
<text x="120" y="33" text-anchor="middle" fill="#e8edf4" font-size="9.5" font-weight="600">红外热电堆</text>
<rect x="100" y="44" width="40" height="8" fill="#3a3e46"/>
<path d="M112 52 q4 8 0 16 M120 52 q4 8 0 16 M128 52 q4 8 0 16" stroke="#ffb454" stroke-width="1.3" opacity=".8"/>
<rect x="60" y="76" width="120" height="20" rx="6" fill="rgba(255,107,107,.08)" stroke="#ff6b6b" stroke-width="1.2"/>
<text x="120" y="90" text-anchor="middle" fill="#e8edf4" font-size="9">宠物颈动脉体表</text>
<text x="120" y="112" text-anchor="middle" fill="#8b97a8" font-size="8.5">双通道差分补偿环境温度</text>
</svg>` },
  { id:'gps',   name:'定位天线',  sub:'GPS·北斗', angle:Math.PI*1.5-1.5, color:0x46d3ff, icon:'gps',
    desc:'GPS + 北斗 + GLONASS 三模定位，L1/L5 双频，支持电子围栏、轨迹回放与走失寻回。',
    specs:[['精度','≤5 米'],['频段','L1 + L5'],['更新','1 Hz'],['功能','围栏 / 轨迹回放']],
    principle:'GPS + 北斗 + GLONASS 三系统融合，L1/L5 双频降低多径误差，定位精度 ≤5 米。FPC 天线沿圆环上侧内部展开，远离地面和皮肤遮挡，兼顾电子围栏、轨迹回放与走失寻回。',
    blueprint:`<svg viewBox="0 0 240 120" width="100%" style="max-width:300px;display:block" font-family="Sora" fill="none">
<circle cx="50" cy="26" r="6" fill="rgba(70,211,255,.25)" stroke="#46d3ff" stroke-width="1.2"/><text x="50" y="14" text-anchor="middle" fill="#8b97a8" font-size="8">GPS</text>
<circle cx="120" cy="18" r="6" fill="rgba(70,211,255,.25)" stroke="#46d3ff" stroke-width="1.2"/><text x="120" y="9" text-anchor="middle" fill="#8b97a8" font-size="8">北斗</text>
<circle cx="190" cy="26" r="6" fill="rgba(70,211,255,.25)" stroke="#46d3ff" stroke-width="1.2"/><text x="190" y="14" text-anchor="middle" fill="#8b97a8" font-size="8">GLONASS</text>
<path d="M55 30 L110 78 M124 24 L120 78 M185 30 L130 78" stroke="#46d3ff" stroke-width="1.1" opacity=".6" stroke-dasharray="3 3"/>
<ellipse cx="120" cy="86" rx="26" ry="9" fill="none" stroke="#7cf5c4" stroke-width="1.6"/>
<circle cx="120" cy="86" r="3" fill="#7cf5c4"/>
<text x="120" y="110" text-anchor="middle" fill="#e8edf4" font-size="9">三系统融合 → ≤5m</text>
</svg>` },
  { id:'motion',name:'运动姿态',  sub:'六轴 IMU', angle:Math.PI*1.5+1.5, color:0xa78bfa, icon:'motion',
    desc:'BMI270 六轴惯性测量单元(三轴加速度 + 三轴陀螺仪)，识别步态/奔跑/睡眠。',
    specs:[['自由度','6 轴'],['量程','±16 g'],['功能','步态 / 睡眠'],['告警','跌倒检测']],
    principle:'BMI270 六轴惯性单元捕捉步态、奔跑与睡眠姿态。算法滤除甩头、挠痒等无效动作后输出活动量与睡眠分期，并支持跌倒/长时间静止告警。',
    blueprint:`<svg viewBox="0 0 240 120" width="100%" style="max-width:300px;display:block" font-family="Sora" fill="none">
<rect x="96" y="46" width="48" height="30" rx="5" fill="rgba(167,139,250,.16)" stroke="#a78bfa" stroke-width="1.4"/>
<text x="120" y="64" text-anchor="middle" fill="#e8edf4" font-size="10" font-weight="600">6 轴 IMU</text>
<line x1="120" y1="46" x2="120" y2="14" stroke="#a78bfa" stroke-width="1.6" marker-end="url(#b)"/><text x="128" y="22" fill="#8b97a8" font-size="9">Y</text>
<line x1="144" y1="61" x2="196" y2="61" stroke="#46d3ff" stroke-width="1.6"/><text x="200" y="64" fill="#8b97a8" font-size="9">X</text>
<line x1="108" y1="76" x2="80" y2="104" stroke="#7cf5c4" stroke-width="1.6"/><text x="68" y="100" fill="#8b97a8" font-size="9">Z</text>
<path d="M40 96 q10 -16 20 0 t20 0" stroke="#a78bfa" stroke-width="1.4" opacity=".7"/><text x="60" y="112" text-anchor="middle" fill="#8b97a8" font-size="8.5">步态波形</text>
<text x="190" y="100" text-anchor="middle" fill="#e8edf4" font-size="8.5">滤除甩头/挠痒</text>
</svg>` },
];

/* ---------- 产品形态（双形态）---------- */
export const FORMS = {
  integrated: { name:'一体式智能项圈', short:'一体式', sub:'C 型安全开合 + 柔性叠带全体型适配',
    tagline:'净面圆环·猫用安全脱扣·全体型适配' },
  clip:       { name:'独立夹扣模块', short:'夹扣式', sub:'单一模块，弹簧夹适配任意项圈',
    tagline:'通用·可移植·不挑项圈' },
};

/* ---------- 颈围 → 显示缩放（16cm→0.74, 60cm→1.22，演示压缩比例） ---------- */
export function displayScale(cm){ return 0.74 + (cm-16)/(60-16)*0.48; }

/* ---------- 颈围 → 适用宠物类型 ---------- */
export function petTypeOf(cm){
  if(cm<=22) return '幼猫 · 小猫';
  if(cm<=30) return '成猫 · 小型犬';
  if(cm<=40) return '中型犬';
  if(cm<=52) return '大型犬';
  if(cm<=58) return '加大型犬';
  return '超大型犬';
}
