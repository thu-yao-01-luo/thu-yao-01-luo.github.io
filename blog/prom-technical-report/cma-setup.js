(() => {
  'use strict';

  const timeline = window.PURO_DATA.ablation.timeline;
  const container = document.getElementById('ablation-setup');
  const left = 80;
  const right = 690;
  const qualityColors = ['#d9a0a4', '#dfb19f', '#dfc39c', '#d0cfa7', '#b4cbb4', '#97c1bb', '#76adb1', '#528f9e'];
  const blockCount = 28;
  if (!timeline || !container) return;

  function escape(value) {
    return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  }

  function label(horizontal, vertical, value, style = '', anchor = 'start') {
    return `<text x="${horizontal}" y="${vertical}" class="${style}" text-anchor="${anchor}">${escape(value)}</text>`;
  }

  function shortStep(step) {
    return `${(step / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }

  function learningRate(step) {
    const samples = step <= timeline.phase1End ? timeline.phase1 : timeline.phase2;
    const following = samples.findIndex(point => point[0] >= step);
    if (following <= 0) return (following === 0 ? samples[0] : samples.at(-1))[1];
    const previous = samples[following - 1];
    const current = samples[following];
    return previous[1] + (current[1] - previous[1]) * (step - previous[0]) / (current[0] - previous[0]);
  }

  function curve(samples, horizontal, vertical, style) {
    return `<polyline points="${samples.map(point => `${horizontal(point[0]).toFixed(3)},${vertical(point[1]).toFixed(3)}`).join(' ')}" class="${style}"/>`;
  }

  function qualityColor(index) {
    const position = index / (blockCount - 1) * (qualityColors.length - 1);
    const lower = Math.floor(position);
    const upper = Math.min(lower + 1, qualityColors.length - 1);
    const fraction = position - lower;
    return '#' + [1, 3, 5].map(offset => {
      const start = parseInt(qualityColors[lower].slice(offset, offset + 2), 16);
      const end = parseInt(qualityColors[upper].slice(offset, offset + 2), 16);
      return Math.round(start + (end - start) * fraction).toString(16).padStart(2, '0');
    }).join('');
  }

  function qualityDefinitions() {
    return `<defs>
      <linearGradient id="cma-quality-scale">${qualityColors.map((color, index) => `<stop offset="${index / (qualityColors.length - 1)}" stop-color="${color}"/>`).join('')}</linearGradient>
      <linearGradient id="cma-mixed-base" x2="0" y2="1"><stop stop-color="#dfc39c"/><stop offset="1" stop-color="#76adb1"/></linearGradient>
      <radialGradient id="cma-mixed-warm" cx=".5" cy=".7" r=".7"><stop stop-color="#d9a0a4"/><stop offset="1" stop-color="#d9a0a4" stop-opacity="0"/></radialGradient>
      <radialGradient id="cma-mixed-cool" cx=".5" cy=".15" r=".65"><stop stop-color="#528f9e"/><stop offset="1" stop-color="#528f9e" stop-opacity="0"/></radialGradient>
      <pattern id="cma-uniform-mix" width="1" height="1" viewBox="0 0 100 100" preserveAspectRatio="none"><rect width="100" height="100" fill="url(#cma-mixed-base)"/><rect width="100" height="100" fill="url(#cma-mixed-warm)"/><rect width="100" height="100" fill="url(#cma-mixed-cool)"/></pattern>
    </defs>`;
  }

  function qualityStrip(record, phaseBoundary) {
    const width = (right - phaseBoundary) / blockCount;
    let shapes = `<rect x="${left}" y="73" width="${phaseBoundary - left}" height="28" fill="#edf0f3"/>`;
    shapes += Array.from({ length: blockCount }, (_, index) => `<rect class="cma-quality-band" data-quality="${index}" x="${phaseBoundary + index * width}" y="73" width="${width}" height="28" fill="${record.order === 'UD' ? 'url(#cma-uniform-mix)' : qualityColor(index)}"/>`).join('');
    if (record.order === 'CD') {
      for (let boundary = 1; boundary < blockCount; boundary++) {
        const horizontal = phaseBoundary + boundary * width;
        shapes += `<path d="M${horizontal} 73v28" stroke="#fff" stroke-width=".65"/>`;
      }
    }
    return `<g data-cma-order="${record.order}">${shapes}</g>`;
  }

  function overview(record) {
    const horizontal = step => left + (step - timeline.startStep) / (timeline.phase2End - timeline.startStep) * (right - left);
    const peak = timeline.phase1[0][1] * 1.14;
    const vertical = rate => 290 - rate / peak * 150;
    const phaseBoundary = horizontal(timeline.phase1End);
    const resumeRate = record.baseLr || learningRate(record.resumeStep || timeline.phase2End);
    const focusStart = record.resumeStep ? record.resumeStep - 2000 : timeline.phase2End - 12500;
    const focusTop = vertical(learningRate(focusStart)) - 7;
    let markup = label(left, 25, 'Data order', 'cma-panel-title');
    markup += '<rect x="490" y="13" width="200" height="13" fill="url(#cma-quality-scale)"/>';
    markup += label(490, 43, 'Lower quality', 'cma-small') + label(right, 43, 'Higher quality', 'cma-small', 'end');
    markup += label(left, 64, 'Phase 1');
    markup += label(phaseBoundary + 14, 64, `Phase 2 · ${record.order === 'UD' ? 'Uniform Data (UD)' : 'Curriculum Data (CD)'}`);
    markup += qualityStrip(record, phaseBoundary);
    markup += `<rect x="${left}" y="132" width="${phaseBoundary - left}" height="158" fill="#f7f9fa"/><path d="M${phaseBoundary} 101V290" class="cma-phase-guide"/>`;
    markup += label(18, 133, 'LR', 'cma-axis-label');
    for (const rate of [0, .0005, .001]) {
      const position = vertical(rate);
      markup += `<path d="M${left} ${position}H${right}" class="cma-grid"/>`;
      markup += label(left - 10, position + 5, rate === 0 ? '0' : rate.toExponential(0), 'cma-axis-label', 'end');
    }
    markup += `<path d="M${left} 132V290H${right}" class="cma-axis"/>`;
    markup += curve(timeline.phase1, horizontal, vertical, 'cma-phase1-curve');
    const active = record.resumeStep ? [...timeline.phase2.filter(point => point[0] < record.resumeStep), [record.resumeStep, learningRate(record.resumeStep)]] : timeline.phase2;
    markup += curve(active, horizontal, vertical, 'cma-decay-curve');
    if (record.resumeStep) {
      const remainder = [[record.resumeStep, learningRate(record.resumeStep)], ...timeline.phase2.filter(point => point[0] > record.resumeStep)];
      markup += curve(remainder, horizontal, vertical, 'cma-counterfactual');
      markup += curve([[record.resumeStep, resumeRate], [timeline.phase2End, resumeRate]], horizontal, vertical, 'cma-constant-curve');
      markup += `<circle cx="${horizontal(record.resumeStep)}" cy="${vertical(resumeRate)}" r="4.5" class="cma-resume-point"/>`;
    }
    markup += label(left + 6, 154, 'Power', 'cma-small');
    markup += label(355, 165, 'Linear decay', 'cma-decay-label');
    markup += `<rect x="${horizontal(focusStart)}" y="${focusTop}" width="${right - horizontal(focusStart)}" height="${298 - focusTop}" class="cma-focus-area"/>`;
    for (const step of [timeline.startStep, timeline.phase1End, 140000, timeline.phase2End]) {
      markup += label(horizontal(step), 314, shortStep(step), 'cma-axis-label', step === timeline.phase2End ? 'end' : 'middle');
    }
    markup += label(left, 340, 'Phase 1: last 1/4', 'cma-small');
    markup += label(right, 340, 'Optimizer step', 'cma-axis-label', 'end');
    return markup;
  }

  function checkpointWindow(record, windowStart, rateAt, vertical, focusHorizontal) {
    const windowLeft = 454;
    const windowRight = right;
    const end = timeline.phase2End;
    const horizontal = step => windowLeft + (step - windowStart) / (end - windowStart) * (windowRight - windowLeft);
    const count = record.checkpointCount || 4;
    const selected = record.checkpointSteps.length ? record.checkpointSteps : Array.from({ length: count }, (_, index) => windowStart + (end - windowStart) * index / (count - 1));
    const names = record.checkpointCount === 6 ? ['θ₁', 'θ₂', 'θ₃', 'θ₄', 'θ₅', 'θ₆'] : ['θ₁', 'θ₂', '…', 'θₙ'];
    const rates = selected.map(step => rateAt(step));
    const focusTop = Math.min(...rates.map(vertical)) - 10;
    const focusBottom = Math.max(...rates.map(vertical)) + 10;
    let markup = `<g data-cma-window="${record.id}"><rect x="438" y="426" width="268" height="178" class="cma-window"/>`;
    markup += `<path d="M${focusHorizontal} ${focusTop}L438 426M${focusHorizontal} ${focusBottom}L438 604" class="cma-window-connector"/>`;
    markup += label(572, 409, 'Checkpoints', 'cma-panel-title', 'middle');
    markup += curve([[windowStart, rateAt(windowStart)], [end, rateAt(end)]], horizontal, vertical, record.resumeStep ? 'cma-constant-curve' : 'cma-decay-curve');
    selected.forEach((step, index) => {
      const pointHorizontal = horizontal(step);
      const pointVertical = vertical(rateAt(step));
      const published = record.checkpointSteps.length > 0;
      const pointLabel = published ? step.toLocaleString('en-US') : names[index];
      const visibleLabel = published ? step === end ? '222.569k' : shortStep(step) : pointLabel;
      const labelOffset = published ? (index % 2 ? 15 : 38) : 18;
      const labelAnchor = published && index === selected.length - 1 ? 'end' : 'middle';
      markup += `<g data-cma-checkpoint="${published ? step : ''}" data-cma-selection="average"><title>${escape(pointLabel)}</title><circle cx="${pointHorizontal}" cy="${pointVertical}" r="5" class="cma-selected-point"/>`;
      markup += label(pointHorizontal, pointVertical - labelOffset, visibleLabel, 'cma-small', labelAnchor);
      markup += `<path d="M${pointHorizontal} ${pointVertical + 6}V583" class="cma-average-guide"/></g>`;
    });
    markup += `<path d="M${windowLeft} 583H${windowRight}M${(windowLeft + windowRight) / 2} 583V611" class="cma-average-guide"/>`;
    const formula = record.checkpointCount === 6 ? 'θ̄ = (θ₁ + ⋯ + θ₆) / 6' : 'θ̄ = (θ₁ + ⋯ + θₙ) / n';
    markup += label((windowLeft + windowRight) / 2, 633, formula, 'cma-average-label', 'middle');
    return markup + '</g>';
  }

  function lateStage(record) {
    const end = timeline.phase2End;
    const start = record.resumeStep ? record.resumeStep - 2000 : end - 12500;
    const mainRight = record.averaging ? 378 : right;
    const horizontal = step => left + (step - start) / (end - start) * (mainRight - left);
    const peak = learningRate(start) * 1.18;
    const vertical = rate => 570 - rate / peak * 128;
    const resumeRate = record.baseLr || learningRate(record.resumeStep || end);
    const rateAt = step => record.resumeStep && step >= record.resumeStep ? resumeRate : learningRate(step);
    const sampleSteps = [start, end, ...timeline.phase2.filter(point => point[0] > start && point[0] < end).map(point => point[0])];
    if (record.resumeStep) sampleSteps.push(record.resumeStep);
    const orderedSteps = [...new Set(sampleSteps)].sort((first, second) => first - second);
    let markup = `<g data-cma-late-scale="linear"><path d="M${left} 363H${right}" class="cma-divider"/>`;
    markup += label(left, 386, 'Late stage', 'cma-panel-title');
    markup += label(left, 409, record.resumeStep ? `Resume at ${shortStep(record.resumeStep)} → constant LR` : 'Linear decay', record.resumeStep ? 'cma-constant-label' : 'cma-decay-label');
    markup += `<path d="M${left} 439V570H${mainRight}" class="cma-axis"/>`;
    markup += label(18, 436, 'LR', 'cma-axis-label') + label(left - 10, 575, '0', 'cma-axis-label', 'end');
    if (record.resumeStep) {
      markup += curve(orderedSteps.filter(step => step <= record.resumeStep).map(step => [step, learningRate(step)]), horizontal, vertical, 'cma-decay-curve');
      markup += curve(orderedSteps.filter(step => step >= record.resumeStep).map(step => [step, learningRate(step)]), horizontal, vertical, 'cma-counterfactual');
      markup += curve([[record.resumeStep, resumeRate], [end, resumeRate]], horizontal, vertical, 'cma-constant-curve');
      markup += `<circle cx="${horizontal(record.resumeStep)}" cy="${vertical(resumeRate)}" r="4.5" class="cma-resume-point"/>`;
      markup += label(horizontal(record.resumeStep), vertical(resumeRate) - 15, shortStep(record.resumeStep), 'cma-small', 'middle');
      if (record.baseLr) markup += label(left - 10, vertical(resumeRate) + 5, record.baseLr.toExponential(2), 'cma-axis-label', 'end');
      const originalLabelPosition = vertical(resumeRate) + 24;
      markup += label(mainRight - 3, originalLabelPosition, 'Original decay', 'cma-small', 'end');
    } else {
      markup += curve(orderedSteps.map(step => [step, learningRate(step)]), horizontal, vertical, 'cma-decay-curve');
    }
    markup += label(left, 598, shortStep(start), 'cma-axis-label');
    markup += label(mainRight, 598, '222.569k', 'cma-axis-label', 'end');
    markup += label((left + mainRight) / 2, 628, 'Optimizer step', 'cma-axis-label', 'middle');
    if (record.averaging) {
      const windowStart = record.checkpointSteps[0] || end - (end - start) * .24;
      const top = Math.min(vertical(rateAt(windowStart)), vertical(rateAt(end))) - 10;
      const bottom = Math.max(vertical(rateAt(windowStart)), vertical(rateAt(end))) + 10;
      markup += `<rect x="${horizontal(windowStart)}" y="${top}" width="${mainRight - horizontal(windowStart)}" height="${bottom - top}" class="cma-focus-area"/>`;
      markup += checkpointWindow(record, windowStart, rateAt, vertical, mainRight);
    } else {
      markup += `<g data-cma-checkpoint="${record.checkpointSteps[0] || ''}" data-cma-selection="final"><circle cx="${mainRight}" cy="${vertical(rateAt(end))}" r="6" class="cma-final-point"/>${label(mainRight, vertical(rateAt(end)) - 32, 'Final checkpoint', '', 'end')}</g>`;
    }
    return markup + '</g>';
  }

  function render(record) {
    const description = `${record.name}: ${record.order === 'UD' ? 'randomly shuffled' : 'curriculum-ordered'} Phase 2 data. ${record.resumeStep ? `Training resumes at step ${record.resumeStep} with a constant LR` : 'Linear LR decay'}. ${record.averaging ? 'Average model parameters across late checkpoints. The boxed inset has its own linear time axis.' : 'Evaluate the final checkpoint without averaging.'}`;
    container.innerHTML = `<svg class="cma-setup-svg" viewBox="0 0 720 654" role="img" aria-label="${escape(record.name)}" aria-describedby="cma-diagram-description" data-cma-setup="${record.id}" data-cma-resume="${record.resumeStep || ''}" data-cma-average="${record.averaging}"><desc id="cma-diagram-description">${escape(description)}</desc><rect width="720" height="654" fill="#fff"/>${qualityDefinitions()}${overview(record)}${lateStage(record)}</svg>`;
  }

  window.PuroCMA = { render };
})();
