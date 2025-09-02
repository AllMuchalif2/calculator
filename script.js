// Simple calculator behavior
// Supports mouse/touch and keyboard input.
// Safe evaluation: only allowed characters are evaluated.

(() => {
  const displayEl = document.getElementById('display');
  const keys = document.querySelectorAll('.btn');

  let expression = ''; // current expression shown
  const maxLength = 30;

  // Update the visual display
  function updateDisplay() {
    displayEl.textContent = expression === '' ? '0' : expression;
  }

  // Append a token (digit, dot, operator)
  function append(value) {
    if (expression.length >= maxLength) return;
    // Prevent multiple leading zeros like "00"
    if (expression === '0' && value === '0') return;
    if (expression === '0' && /\d/.test(value)) {
      expression = value;
      updateDisplay();
      return;
    }
    expression += value;
    updateDisplay();
  }

  // Clear everything
  function clearAll() {
    expression = '';
    updateDisplay();
  }

  // Delete last character
  function del() {
    expression = expression.slice(0, -1);
    updateDisplay();
  }

  // Percent: treat as divide by 100 for last number
  function percent() {
    // Convert "number" at the end into number/100
    const m = expression.match(/(.*?)(\d+\.?\d*)$/);
    if (!m) return;
    const left = m[1];
    const num = parseFloat(m[2]);
    expression = left + (num / 100);
    updateDisplay();
  }

  // Validate expression contains only allowed characters
  function isSafe(expr) {
    // allowed: digits, spaces, + - * / . ( )
    return /^[\d+\-*/().\s]+$/.test(expr);
  }

  // Evaluate the expression safely
  function calculate() {
    if (!expression) return;
    // Replace unicode operators if present
    const expr = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    if (!isSafe(expr)) {
      displayEl.textContent = 'Error';
      expression = '';
      return;
    }
    try {
      // Use Function to evaluate (safer than eval in this context).
      const result = Function(`"use strict"; return (${expr})`)();
      if (result === Infinity || Number.isNaN(result)) throw new Error('Math error');
      // Shorten too-long results
      expression = String(Number.isFinite(result) ? +result.toPrecision(12) : result);
      updateDisplay();
    } catch (e) {
      displayEl.textContent = 'Error';
      expression = '';
    }
  }

  // Handle button clicks
  keys.forEach(key => {
    key.addEventListener('click', () => {
      const v = key.dataset.value;
      const action = key.dataset.action;

      if (action === 'clear') return clearAll();
      if (action === 'delete') return del();
      if (action === 'calculate') return calculate();
      if (action === 'percent') return percent();

      // Otherwise it's a value (digit, dot, operator)
      append(v);
    });
  });

  // Keyboard support
  window.addEventListener('keydown', (e) => {
    const key = e.key;

    // Allow numbers and basic operators
    if (/^[0-9]$/.test(key)) { append(key); e.preventDefault(); return; }
    if (key === '.') { append('.'); e.preventDefault(); return; }
    if (key === '+' || key === '-' || key === '*' || key === '/') { append(key); e.preventDefault(); return; }
    if (key === 'Enter' || key === '=') { calculate(); e.preventDefault(); return; }
    if (key === 'Backspace') { del(); e.preventDefault(); return; }
    if (key.toLowerCase() === 'c') { clearAll(); e.preventDefault(); return; }
    if (key === '%') { percent(); e.preventDefault(); return; }
    if (key === '(' || key === ')') { append(key); e.preventDefault(); return; }
  });

  // Initialize
  clearAll();
})();
