/* ====================================================
   SentimentAI — Frontend Logic
   Communicates with Flask backend at localhost:5000
   ==================================================== */

const API_URL = 'http://127.0.0.1:5000/predict';

// ── Element refs ────────────────────────────────────────
const textInput       = document.getElementById('text-input');
const charCount       = document.getElementById('char-count');
const clearBtn        = document.getElementById('clear-btn');
const analyzeBtn      = document.getElementById('analyze-btn');
const resultPanel     = document.getElementById('result-panel');
const sentimentDisplay = document.getElementById('sentiment-display');
const sentimentIcon   = document.getElementById('sentiment-icon');
const sentimentLabel  = document.getElementById('sentiment-label');
const sentimentSublabel = document.getElementById('sentiment-sublabel');
const confidenceValue = document.getElementById('confidence-value');
const confidenceBar   = document.getElementById('confidence-bar-fill');
const errorMessage    = document.getElementById('error-message');
const chips           = document.querySelectorAll('.chip');

// ── Character count ─────────────────────────────────────
textInput.addEventListener('input', () => {
  charCount.textContent = textInput.value.length;
});

// ── Clear button ────────────────────────────────────────
clearBtn.addEventListener('click', () => {
  textInput.value = '';
  charCount.textContent = '0';
  textInput.focus();
  hideResult();
  hideError();
});

// ── Example chips ───────────────────────────────────────
chips.forEach(chip => {
  chip.addEventListener('click', () => {
    const text = chip.dataset.text;
    textInput.value = text;
    charCount.textContent = text.length;
    textInput.focus();
    hideError();
    // Auto-analyze when chip is clicked
    runAnalysis();
  });
});

// ── Analyze button ──────────────────────────────────────
analyzeBtn.addEventListener('click', runAnalysis);

// Allow Enter (without Shift) to submit when textarea is focused
textInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    runAnalysis();
  }
});

// ── Core analysis function ───────────────────────────────
async function runAnalysis() {
  const text = textInput.value.trim();

  if (!text) {
    showError('Please enter some text before analyzing.');
    return;
  }

  hideError();
  setLoading(true);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    displayResult(data.label, data.confidence);

  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      showError(
        '⚡ Cannot connect to the backend. Make sure your Flask server is running on http://127.0.0.1:5000'
      );
    } else {
      showError(`Error: ${err.message}`);
    }
  } finally {
    setLoading(false);
  }
}

// ── Display result ──────────────────────────────────────
function displayResult(label, confidence) {
  const isPositive = label === 'Positive';
  const pct = Math.round(confidence * 100);

  // Update sentiment card
  sentimentDisplay.classList.remove('positive', 'negative');
  sentimentDisplay.classList.add(isPositive ? 'positive' : 'negative');

  sentimentIcon.textContent = isPositive ? '😊' : '😞';
  sentimentLabel.textContent = label;
  sentimentSublabel.textContent = isPositive
    ? 'Positive sentiment detected'
    : 'Negative sentiment detected';

  // Update confidence
  confidenceValue.textContent = `${pct}%`;

  // Animate bar (reset first, then fill)
  confidenceBar.style.width = '0%';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      confidenceBar.style.width = `${pct}%`;
    });
  });

  // Update bar color based on sentiment
  if (isPositive) {
    confidenceBar.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
  } else {
    confidenceBar.style.background = 'linear-gradient(90deg, #f43f5e, #fb7185)';
  }

  // Show panel with animation
  resultPanel.classList.add('visible');
}

// ── UI helpers ──────────────────────────────────────────
function setLoading(isLoading) {
  analyzeBtn.classList.toggle('loading', isLoading);
  analyzeBtn.disabled = isLoading;
  textInput.disabled = isLoading;
}

function hideResult() {
  resultPanel.classList.remove('visible');
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('visible');
}

function hideError() {
  errorMessage.classList.remove('visible');
  errorMessage.textContent = '';
}
