const statusText = document.getElementById('statusText');
const pingValue = document.getElementById('pingValue');
const downloadValue = document.getElementById('downloadValue');
const qualityValue = document.getElementById('qualityValue');
const progressBar = document.getElementById('progressBar');
const resultText = document.getElementById('resultText');
const startBtn = document.getElementById('startBtn');

const qualityLevels = [
  { label: 'Poor', min: 0 },
  { label: 'Fair', min: 5 },
  { label: 'Good', min: 15 },
  { label: 'Very Good', min: 30 },
  { label: 'Excellent', min: 60 }
];

function setStatus(message, accent = 'success') {
  statusText.textContent = message;
  const dot = document.querySelector('.status-dot');
  const dotColors = {
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    neutral: '#60a5fa'
  };

  dot.style.background = dotColors[accent] || dotColors.neutral;
  dot.style.boxShadow = `0 0 12px ${dotColors[accent] || dotColors.neutral}`;
}

function formatMbps(value) {
  if (!Number.isFinite(value) || value <= 0) return '0.00';
  return value.toFixed(2);
}

function getQualityLabel(downloadMbps) {
  const match = qualityLevels.filter((level) => downloadMbps >= level.min).at(-1);
  return match ? match.label : 'Poor';
}

async function measurePing() {
  const samples = [];

  for (let i = 0; i < 5; i += 1) {
    const start = performance.now();
    await fetch('data:text/plain,network-test');
    const latency = performance.now() - start;
    samples.push(latency);
  }

  return Math.round(samples.reduce((sum, value) => sum + value, 0) / samples.length);
}

async function measureDownload() {
  const testSizesMB = [2, 5, 8];
  let totalBytes = 0;
  let totalLatency = 0;

  for (const sizeMB of testSizesMB) {
    const bytes = sizeMB * 1024 * 1024;
    const payload = new Blob([new Uint8Array(bytes)], { type: 'application/octet-stream' });
    const objectUrl = URL.createObjectURL(payload);

    try {
      const start = performance.now();
      const response = await fetch(objectUrl);
      const buffer = await response.arrayBuffer();
      const elapsedMs = performance.now() - start;

      totalBytes += buffer.byteLength;
      totalLatency += elapsedMs;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }

    const progress = ((testSizesMB.indexOf(sizeMB) + 1) / testSizesMB.length) * 100;
    progressBar.style.width = `${progress}%`;
  }

  const averageSeconds = totalLatency / 1000;
  const mbps = (totalBytes * 8) / (averageSeconds * 1000000 || 1);
  return mbps;
}

async function runTest() {
  startBtn.disabled = true;
  progressBar.style.width = '8%';
  setStatus('Testing connection...', 'neutral');
  resultText.textContent = 'Measuring latency and download throughput...';

  try {
    const ping = await measurePing();
    pingValue.textContent = String(ping);
    setStatus('Measuring download speed...', 'neutral');

    const downloadMbps = await measureDownload();
    const quality = getQualityLabel(downloadMbps);

    downloadValue.textContent = formatMbps(downloadMbps);
    qualityValue.textContent = quality;

    setStatus('Test complete', 'success');
    resultText.textContent = `Estimated download speed: ${formatMbps(downloadMbps)} Mbps with ${quality.toLowerCase()} quality.`;
    progressBar.style.width = '100%';
  } catch (error) {
    console.error(error);
    setStatus('Test failed', 'error');
    resultText.textContent = 'Something went wrong while testing. Please try again.';
    downloadValue.textContent = '--';
    qualityValue.textContent = '--';
  } finally {
    startBtn.disabled = false;
  }
}

startBtn.addEventListener('click', runTest);

pingValue.textContent = '--';
downloadValue.textContent = '--';
qualityValue.textContent = '--';
progressBar.style.width = '0%';
