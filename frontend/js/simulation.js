/**
 * simulation.js — Simulation panel logic and Chart.js result rendering
 */

let chart = null;

export function initSimulationPanel() {
  const horizonSlider  = document.getElementById('horizon-slider');
  const horizonVal     = document.getElementById('horizon-val');
  const thresholdSlider = document.getElementById('threshold-slider');
  const thresholdVal   = document.getElementById('threshold-val');
  const runBtn         = document.getElementById('run-sim-btn');
  const scenarioSel    = document.getElementById('scenario-select');

  // Sync slider display values
  horizonSlider.addEventListener('input', () => {
    horizonVal.textContent = `${horizonSlider.value}h`;
  });
  thresholdSlider.addEventListener('input', () => {
    thresholdVal.textContent = `${thresholdSlider.value}%`;
  });

  runBtn.addEventListener('click', async () => {
    const scenario  = scenarioSel.value;
    const horizon   = parseInt(horizonSlider.value);
    const threshold = parseInt(thresholdSlider.value) / 100;

    await runSimulation(scenario, horizon, threshold, runBtn);
  });
}

async function runSimulation(scenario, horizonHours, threshold, btn) {
  btn.textContent = '⏳ Running...';
  btn.classList.add('loading');
  btn.disabled = true;

  const resultsTitle = document.getElementById('sim-results-title');
  const chartContainer = document.getElementById('chart-container');

  try {
    let url, body;

    if (scenario === 'degradation') {
      url = 'http://localhost:8000/simulation/degradation';
      body = {
        subsystem: document.getElementById('subsystem-select')?.value || 'battery',
        horizon_hours: horizonHours,
      };
    } else if (scenario === 'maintenance') {
      url = 'http://localhost:8000/simulation/maintenance';
      body = { health_threshold: threshold, lookahead_days: 365 };
    } else if (scenario === 'trends') {
      url = 'http://localhost:8000/simulation/trends';
      body = { trend_window_hours: 72, projection_days: 30 };
    } else if (scenario === 'hypothetical') {
      url = 'http://localhost:8000/simulation/hypothetical';
      body = {
        ambient_temperature: parseFloat(document.getElementById('hypo-temp')?.value || 35),
        daily_km: parseFloat(document.getElementById('hypo-km')?.value || 100),
        horizon_days: Math.ceil(horizonHours / 24),
      };
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    renderResults(scenario, data, resultsTitle, chartContainer);

  } catch (err) {
    resultsTitle.textContent = `❌ Error: ${err.message}`;
    console.error('[simulation]', err);
  } finally {
    btn.textContent = '▶ Run Simulation';
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

function renderResults(scenario, data, titleEl, containerEl) {
  titleEl.textContent = '';
  containerEl.innerHTML = '';

  if (scenario === 'degradation' && data.data_points?.length) {
    titleEl.textContent = `📊 ${(data.subsystem || 'Battery').toUpperCase()} — Degradation Projection`;

    const canvas = document.createElement('canvas');
    canvas.id = 'sim-chart';
    canvas.style.cssText = 'width:100%;height:220px;';
    containerEl.appendChild(canvas);

    const labels = data.data_points.map(p => `${p.hour}h`);
    const values = data.data_points.map(p => +(p.health_score * 100).toFixed(1));

    if (chart) chart.destroy();
    chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Health Score (%)',
          data: values,
          borderColor: '#00d2ff',
          backgroundColor: 'rgba(0,210,255,0.08)',
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 600 },
        plugins: {
          legend: { labels: { color: '#7aa0c4', font: { size: 11 } } },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: {
            ticks: { color: '#3a5a7a', maxTicksLimit: 8, font: { size: 10 } },
            grid:  { color: 'rgba(0,210,255,0.05)' },
          },
          y: {
            min: 0,
            max: 100,
            ticks: {
              color: '#3a5a7a',
              font: { size: 10 },
              callback: v => `${v}%`,
            },
            grid: { color: 'rgba(0,210,255,0.05)' },
          },
        },
      },
    });

    // Summary line below chart
    const last = data.data_points[data.data_points.length - 1];
    const first = data.data_points[0];
    const summary = document.createElement('div');
    summary.className = 'fade-in';
    summary.style.cssText = 'font-size:12px;color:#7aa0c4;margin-top:8px;';
    summary.innerHTML = `
      Start: <span style="color:#00d2ff">${(first.health_score*100).toFixed(1)}%</span>
      &nbsp;→&nbsp;
      End: <span style="color:${last.health_score < 0.3 ? '#ff4455' : '#00ff88'}">${(last.health_score*100).toFixed(1)}%</span>
      &nbsp;|&nbsp; RUL at end: <span style="color:#ffd700">${last.rul_hours?.toFixed(0) || 'N/A'}h</span>
    `;
    containerEl.appendChild(summary);
  }

  else if (scenario === 'maintenance' && data.maintenance_events?.length) {
    titleEl.textContent = '🔧 Maintenance Prediction Schedule';

    const table = document.createElement('table');
    table.className = 'maintenance-table fade-in';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Subsystem</th>
          <th>Health</th>
          <th>Service Date</th>
          <th>Days Left</th>
          <th>Urgency</th>
        </tr>
      </thead>
      <tbody>
        ${data.maintenance_events.map(e => `
          <tr>
            <td>${subsysIcon(e.subsystem)} ${capitalize(e.subsystem)}</td>
            <td>${(e.current_health * 100).toFixed(0)}%</td>
            <td>${e.predicted_date}</td>
            <td style="color:${urgencyColor(e.urgency)}">${e.days_remaining}d</td>
            <td><span class="urgency-badge urgency-${e.urgency}">${e.urgency.toUpperCase()}</span></td>
          </tr>
        `).join('')}
      </tbody>
    `;
    containerEl.appendChild(table);
  }

  else if (scenario === 'trends' && data.trends) {
    titleEl.textContent = '📈 Operational Trend Analysis';
    const t = data.trends;

    const metricsDiv = document.createElement('div');
    metricsDiv.className = 'fade-in';
    metricsDiv.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px;';

    const metrics = [
      { label: 'Battery SOC', d: t.battery_soc, unit: '%' },
      { label: 'Battery Temp', d: t.battery_temperature, unit: '°C' },
      { label: 'Motor Temp', d: t.motor_temperature, unit: '°C' },
      { label: 'Speed', d: t.speed, unit: 'km/h' },
    ];

    metrics.forEach(({ label, d, unit }) => {
      if (!d) return;
      const card = document.createElement('div');
      card.style.cssText = `
        background: rgba(0,210,255,0.05);
        border: 1px solid rgba(0,210,255,0.12);
        border-radius: 8px;
        padding: 10px 12px;
      `;
      const trendArrow = d.trend === 'increasing' ? '↑' : d.trend === 'decreasing' ? '↓' : '→';
      const trendColor = d.trend === 'increasing' ? '#ff8c00' : d.trend === 'decreasing' ? '#00ff88' : '#7aa0c4';
      card.innerHTML = `
        <div style="font-size:10px;color:#7aa0c4;text-transform:uppercase;letter-spacing:.5px">${label}</div>
        <div style="font-size:18px;font-family:monospace;color:#e8f4ff;margin:3px 0">${d.current}${unit}</div>
        <div style="font-size:11px;color:${trendColor}">${trendArrow} ${d.trend} → projected: ${d.projected}${unit}</div>
      `;
      metricsDiv.appendChild(card);
    });

    containerEl.appendChild(metricsDiv);
  }

  else if (scenario === 'hypothetical' && data.hypothetical_summary) {
    titleEl.textContent = '🔮 What-If Scenario Results';
    const h = data.hypothetical_summary;

    const impacts = h.maintenance_impact || [];
    const table = document.createElement('table');
    table.className = 'maintenance-table fade-in';
    table.innerHTML = `
      <thead>
        <tr><th>Subsystem</th><th>Service In (days)</th><th>Date</th><th>Final Health</th></tr>
      </thead>
      <tbody>
        ${impacts.map(i => `
          <tr>
            <td>${subsysIcon(i.subsystem)} ${capitalize(i.subsystem)}</td>
            <td style="color:#ffd700">${i.maintenance_in_days}d</td>
            <td>${i.predicted_date}</td>
            <td style="color:${i.final_health < 0.3 ? '#ff4455' : '#00ff88'}">${(i.final_health * 100).toFixed(1)}%</td>
          </tr>
        `).join('')}
      </tbody>
    `;
    containerEl.appendChild(table);

    if (data.data_points?.length) {
      const canvas = document.createElement('canvas');
      canvas.style.cssText = 'width:100%;height:150px;margin-top:10px;';
      containerEl.appendChild(canvas);

      const labels = data.data_points.map(p => `${p.hour}h`);
      const values = data.data_points.map(p => +(p.health_score * 100).toFixed(1));

      if (chart) chart.destroy();
      chart = new Chart(canvas, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Battery Health (%)',
            data: values,
            borderColor: '#ff8c00',
            backgroundColor: 'rgba(255,140,0,0.08)',
            borderWidth: 2,
            pointRadius: 0,
            fill: true,
            tension: 0.4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#7aa0c4', font: { size: 10 } } } },
          scales: {
            x: { ticks: { color: '#3a5a7a', maxTicksLimit: 6, font: { size: 9 } }, grid: { color: 'rgba(255,140,0,0.05)' } },
            y: { min: 0, max: 100, ticks: { color: '#3a5a7a', font: { size: 9 }, callback: v => `${v}%` }, grid: { color: 'rgba(255,140,0,0.05)' } },
          },
        },
      });
    }
  }

  else {
    titleEl.textContent = 'Simulation completed — see console for full data';
    console.log('[sim result]', data);
  }
}

function subsysIcon(sub) {
  return { battery: '🔋', motor: '⚙️', braking: '🛑', controller: '💡' }[sub] || '🔧';
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function urgencyColor(u) {
  return { ok: '#00ff88', watch: '#00d2ff', soon: '#ffd700', urgent: '#ff4455' }[u] || '#7aa0c4';
}
