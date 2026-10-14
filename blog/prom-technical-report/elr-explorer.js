(() => {
  'use strict';

  const data = window.PURO_DATA.elr;
  const root = document.getElementById('elr-explorer');
  if (!data || !root) return;
  const slider = document.getElementById('elr-step');
  const rows = document.getElementById('elr-rows');
  const expanded = new Set();
  const cases = [
    { id: 'muon', name: 'Muon', color: '#65737f' },
    { id: 'muonh', name: 'MuonH', color: '#3f6488' },
    { id: 'muon-elr', name: 'Muon-ELR', color: '#b76559' },
  ];
  const metricNames = ['ordinaryLR', 'weightNorm', 'updateNorm', 'effectiveLR'];
  const angleScale = 20;
  const geometryScale = 0.7;
  const initialRadius = 70;
  const maximumNormRatio = Math.max(...cases.flatMap(optimizer => {
    const records = data.records[optimizer.id];
    return records.map(record => record[2] / records[0][2]);
  }));
  let language = document.documentElement.lang.startsWith('en') ? 'en' : 'zh';
  const copy = {
    title: ['有效学习率：半径与更新角度', 'Effective LR: Weight Norms and Update Angles'],
    step: ['训练步数', 'Training step'],
    scroll: ['↔ 左右滑动查看完整对照', '↔ Scroll horizontally for the full comparison'],
    table: ['Muon、MuonH 与 Muon-ELR 的学习率、范数及更新几何', 'Learning rates, norms, and update geometry for Muon, MuonH, and Muon-ELR'],
    beforeLR: ['乘学习率之前', 'Before LR scaling'],
    schematic: ['切向更新示意', 'Tangential update schematic'],
    scaleTitle: ['备注：示意图的简化与尺度', 'How to read the schematic'],
    scale: ['为直观比较三种配置，这里将高维参数更新简化为二维切向更新示意。在这个简化关系中，有效学习率 ρ 对应的角度为 θ = arctan ρ。绘图统一将角度放大 20 倍，以便看清 MuonH 与 Muon-ELR 的角度是否接近。半径采用对数尺度，并将每组第 20 步的权重范数归一为 1，以虚线圆作参照，因此圆的扩张反映各组相对起点的范数变化。', 'This schematic reduces high-dimensional parameter updates to a two-dimensional tangential update so the three configurations are easier to compare. In this simplified geometry, effective LR ρ corresponds to an angle θ = arctan ρ. We magnify all angles by 20× to make the alignment between MuonH and Muon-ELR visible. Radii are shown on a logarithmic scale. For each run, the weight norm at step 20 is normalized to 1 and shown as a dashed reference circle, so an expanding circle indicates growth relative to that run’s own starting norm.'],
    configuration: ['模型结构', 'Model architecture'],
    collapse: ['收起结构', 'Hide architecture'],
    muon: ['常规 Muon', 'Standard Muon'],
    muonh: ['固定半径', 'Fixed radius'],
    'muon-elr': ['对齐 ELR', 'Aligned ELR'],
    empty: ['首条记录：第 20 步', 'First recorded step: 20'],
    normalized: ['‖R û‖ = R', '‖R û‖ = R'],
    fixed: ['R = ‖W₀‖', 'R = ‖W₀‖'],
    previous: ['前移 20 步', 'Back 20 steps'],
    next: ['后移 20 步', 'Forward 20 steps'],
    base: ['基础学习率', 'Base LR'],
    structure: ['Transformer 参数分组', 'Transformer parameter groups'],
  };

  function text(key) { return copy[key][language === 'en' ? 1 : 0]; }
  function escape(value) { return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]); }
  function format(value, norm = false) {
    if (value == null) return '—';
    return norm ? value.toFixed(2) : value.toExponential(3);
  }

  function sampledStep(step) {
    return Math.floor(step / data.sampleInterval) * data.sampleInterval;
  }

  function baseAt(step) {
    return step >= data.sampleInterval ? data.baseLR[step - 2] : null;
  }

  function recordAt(identifier, step) {
    const sampled = sampledStep(step);
    if (!sampled) return null;
    if (identifier === 'muonh') {
      const rate = baseAt(sampled) * data.hyperballMultiplier;
      return [sampled, rate, null, null, rate];
    }
    return data.records[identifier][sampled / data.sampleInterval - 1];
  }

  function series(identifier, column) {
    if (identifier !== 'muonh') return data.records[identifier].map(record => [record[0], record[column + 1]]);
    if (column === 1 || column === 2) return [];
    return data.records.muon.map(record => [record[0], baseAt(record[0]) * data.hyperballMultiplier]);
  }

  const maxima = metricNames.map((_, column) => Math.max(...cases.flatMap(optimizer => series(optimizer.id, column).map(point => point[1]))));

  function sparkline(identifier, column) {
    const points = series(identifier, column);
    if (!points.length) return '<svg viewBox="0 0 112 44" class="elr-spark" aria-hidden="true"><path class="elr-fixed-line" d="M4 22H108"/></svg>';
    const coordinates = points.map(([step, value]) => `${(4 + (step - 1) / (data.maxStep - 1) * 104).toFixed(2)},${(38 - value / maxima[column] * 32).toFixed(2)}`);
    return `<svg viewBox="0 0 112 44" class="elr-spark" aria-hidden="true"><path class="elr-spark-baseline" d="M4 38H108"/><polyline points="${coordinates.join(' ')}"/><line class="elr-cursor" y1="3" y2="40"/><circle class="elr-current" r="3"/></svg>`;
  }

  function transformer(optimizer) {
    const rule = optimizer.id === 'muonh' ? '10η₀' : optimizer.id === 'muon' ? 'η₀' : '10η₀ ‖W‖ / ‖u‖';
    const marker = `elr-flow-${optimizer.id}`;
    const nodes = [
      { name: 'Embedding', top: 12, height: 40, group: 'adam' },
      { name: 'RMSNorm', top: 104, height: 30, group: 'adam' },
      { name: 'QKV projection', top: 146, height: 36, group: 'matrix' },
      { name: 'Core attention', top: 194, height: 36, group: 'operation' },
      { name: 'Attention output projection', top: 242, height: 36, group: 'matrix' },
      { name: 'RMSNorm', top: 332, height: 30, group: 'adam' },
      { name: 'MLP gate / up projection', top: 374, height: 36, group: 'matrix' },
      { name: 'SwiGLU', top: 422, height: 32, group: 'operation' },
      { name: 'MLP down projection · FC2', top: 466, height: 36, group: 'matrix', tracked: true },
      { name: 'Final RMSNorm', top: 574, height: 30, group: 'adam' },
      { name: 'LM head', top: 624, height: 40, group: 'adam' },
    ];
    const boxes = nodes.map(node => {
      const narrow = node.group === 'adam';
      const left = narrow ? 208 : 196;
      const width = narrow ? 326 : 350;
      const middle = node.top + node.height / 2;
      const label = node.group === 'operation'
        ? `<text x="371" y="${middle}" text-anchor="middle">${node.name}</text>`
        : `<text x="${left + 14}" y="${middle}">${node.name}</text><text x="${left + width - 13}" y="${middle}" text-anchor="end" class="elr-node-optimizer">${narrow ? 'AdamW' : optimizer.name}</text>`;
      return `<g class="elr-diagram-node elr-node-${node.group}${node.tracked ? ' elr-node-tracked' : ''}" data-elr-module="${escape(node.name)}"><rect x="${left}" y="${node.top}" width="${width}" height="${node.height}" rx="3"/>${label}</g>`;
    }).join('');
    const connections = [[52, 104], [134, 146], [182, 194], [230, 242], [278, 290], [310, 332], [362, 374], [410, 422], [454, 466], [502, 516], [536, 574], [604, 624]]
      .map(([start, finish]) => `<path d="M371 ${start}V${finish}" marker-end="url(#${marker})"/>`).join('');
    return `<div class="elr-transformer" style="--elr-color:${optimizer.color}">
      <div class="elr-config-key"><span class="elr-key-adam">AdamW · η₀</span><span class="elr-key-matrix">${optimizer.name} · ${rule}</span><span class="elr-transformer-base">${text('base')} η₀ = <span data-elr-base></span></span></div>
      <svg class="elr-transformer-diagram" viewBox="0 0 720 684" role="img" aria-label="${escape(optimizer.name + ': ' + text('structure'))}">
        <defs><marker id="${marker}" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5Z" fill="#85949d"/></marker></defs>
        <rect class="elr-block-frame" x="154" y="72" width="428" height="480" rx="6"/>
        <rect x="171" y="61" width="148" height="23" fill="#fff"/><text x="179" y="78" class="elr-diagram-heading">Transformer block</text>
        <path class="elr-repeat-bracket" d="M598 72H608V552H598"/><text x="626" y="316" class="elr-repeat-count">× ${data.model.layers}</text>
        <g class="elr-diagram-flow">${connections}<path class="elr-residual" d="M371 88H177V300H361" marker-end="url(#${marker})"/><path class="elr-residual" d="M371 318H177V526H361" marker-end="url(#${marker})"/></g>
        <circle class="elr-junction" cx="371" cy="88" r="2.2"/><circle class="elr-junction" cx="371" cy="318" r="2.2"/>
        ${boxes}
        <g class="elr-residual-add"><circle cx="371" cy="300" r="10"/><text x="371" y="301">+</text><circle cx="371" cy="526" r="10"/><text x="371" y="527">+</text></g>
      </svg>
    </div>`;
  }

  function buildRows() {
    rows.innerHTML = cases.map(optimizer => {
      const metrics = metricNames.map((name, column) => `<td data-elr-metric="${name}"><span class="elr-value"></span>${sparkline(optimizer.id, column)}<small class="elr-metric-note"></small></td>`).join('');
      return `<tr data-elr-case="${optimizer.id}" style="--elr-color:${optimizer.color}"><th scope="row"><button type="button" class="elr-case-toggle" data-elr-toggle="${optimizer.id}" aria-expanded="${expanded.has(optimizer.id)}" aria-controls="elr-detail-${optimizer.id}"><span class="elr-case-name">${optimizer.name}</span><span class="elr-toggle-label">${text(expanded.has(optimizer.id) ? 'collapse' : 'configuration')}</span></button><span class="elr-case-note">${text(optimizer.id)}</span></th>${metrics}<td class="elr-geometry"></td></tr><tr class="elr-detail-row" id="elr-detail-${optimizer.id}" ${expanded.has(optimizer.id) ? '' : 'hidden'}><td colspan="6">${transformer(optimizer)}</td></tr>`;
    }).join('');
  }

  function geometry(optimizer, record) {
    const heading = `<div class="elr-geometry-heading"><span class="elr-geometry-name">${optimizer.name}</span><span class="elr-geometry-elr">ELR <span>${format(record?.[4])}</span></span></div>`;
    if (!record) return `${heading}<p class="elr-unrecorded" aria-label="${escape(text('empty'))}">—</p>`;
    const fixed = optimizer.id === 'muonh';
    const normRatio = fixed ? 1 : record[2] / data.records[optimizer.id][0][2];
    const radius = (initialRadius + 38 * Math.log(normRatio) / Math.log(maximumNormRatio)) * geometryScale;
    const angle = Math.atan(record[4]) * angleScale;
    const center = [136, 98];
    const start = [center[0], center[1] - radius];
    const trial = [center[0] + radius * Math.tan(angle), start[1]];
    const finish = fixed ? [center[0] + radius * Math.sin(angle), center[1] - radius * Math.cos(angle)] : trial;
    const arcRadius = 54 * geometryScale;
    const arcEnd = [center[0] + arcRadius * Math.sin(angle), center[1] - arcRadius * Math.cos(angle)];
    const marker = `elr-update-${optimizer.id}`;
    const finishAnchor = finish[0] > 240 ? 'end' : 'start';
    const finishLabel = [finish[0] + (finishAnchor === 'end' ? -8 : 8), finish[1] + 17];
    const angleDegrees = angle * 180 / Math.PI;
    const radiusLabel = fixed ? '‖W‖ = R' : `‖W‖ / ‖W₂₀‖ = ${normRatio.toFixed(2)}`;
    return `${heading}<svg class="elr-geometry-svg" viewBox="0 0 304 188" role="img" aria-label="${escape(optimizer.name + ': ' + text('schematic') + ', ' + radiusLabel + ', 20θ = ' + angleDegrees.toFixed(2) + '°')}" data-radius="${radius}" data-norm-ratio="${normRatio}" data-angle="${angle}" data-effective-lr="${record[4]}">
      <defs><marker id="${marker}" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5Z" fill="#bd7868"/></marker></defs>
      <circle class="elr-weight-circle" cx="${center[0]}" cy="${center[1]}" r="${radius}"/>
      ${fixed ? '' : `<circle class="elr-reference-circle" cx="${center[0]}" cy="${center[1]}" r="${initialRadius * geometryScale}"/>`}
      <path class="elr-angle-sector" d="M${center}V${center[1] - arcRadius}A${arcRadius} ${arcRadius} 0 0 1 ${arcEnd}Z"/>
      <path class="elr-angle-arc" d="M${center[0]} ${center[1] - arcRadius}A${arcRadius} ${arcRadius} 0 0 1 ${arcEnd}"/>
      <path class="elr-weight-ray" d="M${center}L${start}"/>
      <path class="elr-next-ray" d="M${center}L${finish}"/>
      <path class="elr-update-vector" d="M${start}L${trial}" marker-end="url(#${marker})"/>
      ${fixed ? `<path class="elr-projection" d="M${trial}L${finish}"/><circle class="elr-trial-point" cx="${trial[0]}" cy="${trial[1]}" r="2.5"/>` : ''}
      <circle class="elr-origin" cx="${center[0]}" cy="${center[1]}" r="2.3"/>
      <circle class="elr-start-point" cx="${start[0]}" cy="${start[1]}" r="3.5"/>
      <circle class="elr-end-point" cx="${finish[0]}" cy="${finish[1]}" r="3.5"/>
      <text x="${start[0] - 9}" y="${start[1] - 8}" text-anchor="end" class="elr-svg-label">Wₜ</text>
      <text x="${finishLabel[0]}" y="${finishLabel[1]}" text-anchor="${finishAnchor}" class="elr-svg-label elr-next-label">Wₜ₊₁</text>
      <text x="${center[0] - 8}" y="${center[1] + 17}" text-anchor="end" class="elr-origin-label">0</text>
    </svg><div class="elr-geometry-meta"><span>${radiusLabel}</span><span class="elr-angle-value">20θ = ${angleDegrees.toFixed(2)}°</span></div>`;
  }

  function update() {
    const step = Number(slider.value);
    const sampled = sampledStep(step);
    const stepLabel = `${step.toLocaleString('en-US')} / 5,000`;
    document.getElementById('elr-step-value').textContent = stepLabel;
    slider.setAttribute('aria-valuetext', `${text('step')} ${stepLabel}`);
    document.getElementById('elr-previous').disabled = step === 1;
    document.getElementById('elr-next').disabled = step === data.maxStep;
    document.getElementById('elr-sampling').textContent = !sampled ? text('empty') : language === 'zh'
      ? `记录：第 ${sampled.toLocaleString('en-US')} 步 · 每 ${data.sampleInterval} 步采样`
      : `Recorded step ${sampled.toLocaleString('en-US')} · sampled every ${data.sampleInterval} steps`;
    cases.forEach(optimizer => {
      const row = rows.querySelector(`[data-elr-case="${optimizer.id}"]`);
      const record = recordAt(optimizer.id, step);
      metricNames.forEach((name, column) => {
        const cell = row.querySelector(`[data-elr-metric="${name}"]`);
        const fixed = optimizer.id === 'muonh' && (column === 1 || column === 2);
        const value = record?.[column + 1];
        cell.querySelector('.elr-value').textContent = fixed ? 'R' : format(value, column === 1 || column === 2);
        cell.querySelector('.elr-metric-note').textContent = fixed ? text(column === 1 ? 'fixed' : 'normalized') : '';
        const cursor = cell.querySelector('.elr-cursor');
        const point = cell.querySelector('.elr-current');
        if (cursor && point) {
          const horizontal = 4 + ((record?.[0] || step) - 1) / (data.maxStep - 1) * 104;
          cursor.setAttribute('x1', horizontal);
          cursor.setAttribute('x2', horizontal);
          point.style.display = value == null ? 'none' : '';
          point.setAttribute('cx', horizontal);
          point.setAttribute('cy', value == null ? 38 : 38 - value / maxima[column] * 32);
        }
      });
      row.querySelector('.elr-geometry').innerHTML = geometry(optimizer, record);
    });
    root.querySelectorAll('[data-elr-base]').forEach(element => { element.textContent = format(baseAt(sampled)); });
  }

  function setLanguage(nextLanguage) {
    language = nextLanguage === 'en' ? 'en' : 'zh';
    root.querySelectorAll('[data-elr-text]').forEach(element => { element.textContent = text(element.dataset.elrText); });
    document.getElementById('elr-previous').setAttribute('aria-label', text('previous'));
    document.getElementById('elr-next').setAttribute('aria-label', text('next'));
    buildRows();
    update();
  }

  slider.addEventListener('input', update);
  document.getElementById('elr-previous').addEventListener('click', () => { slider.value = Math.max(1, Number(slider.value) - data.sampleInterval); update(); });
  document.getElementById('elr-next').addEventListener('click', () => { slider.value = Math.min(data.maxStep, Number(slider.value) + data.sampleInterval); update(); });
  root.addEventListener('click', event => {
    const toggle = event.target.closest('[data-elr-toggle]');
    if (!toggle) return;
    const identifier = toggle.dataset.elrToggle;
    if (expanded.has(identifier)) expanded.delete(identifier); else expanded.add(identifier);
    const open = expanded.has(identifier);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.elr-toggle-label').textContent = text(open ? 'collapse' : 'configuration');
    document.getElementById(`elr-detail-${identifier}`).hidden = !open;
  });
  window.PuroELR = { setLanguage };
  setLanguage(language);
  root.hidden = false;
})();
