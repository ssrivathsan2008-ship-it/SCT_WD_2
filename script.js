document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const primaryScreen = document.getElementById('primary-screen');
    const historyScreen = document.getElementById('history-screen');
    const themeToggle = document.getElementById('theme-toggle');
    const keypad = document.querySelector('.calculator-keypad');

    // Calculator State Variables
    let expression = '';
    let currentInput = '';
    let lastDisplayValue = '0';
    let resetOnNextInput = false;

    // Theme Management
    const savedTheme = localStorage.getItem('stellar-theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        localStorage.setItem('stellar-theme', theme);
    });

    // Update Display UI
    function updateDisplay(resultExpr = '') {
        // Format history display: replace operators with nice symbols
        let historyText = (resultExpr || expression)
            .replace(/\//g, ' ÷ ')
            .replace(/\*/g, ' × ')
            .replace(/\-/g, ' − ')
            .replace(/\+/g, ' + ');
        
        historyScreen.textContent = historyText;

        // Primary Display shows current input or the last valid value
        let primaryText = currentInput || lastDisplayValue;
        if (primaryText === '-') primaryText = '-0';
        if (primaryText === '') primaryText = '0';

        // Auto-scale font size to prevent overflow
        if (primaryText.length > 12) {
            primaryScreen.style.fontSize = '1.5rem';
        } else if (primaryText.length > 8) {
            primaryScreen.style.fontSize = '1.9rem';
        } else {
            primaryScreen.style.fontSize = '2.4rem';
        }

        primaryScreen.textContent = primaryText;
    }

    // Clear everything
    function clearAll() {
        expression = '';
        currentInput = '';
        lastDisplayValue = '0';
        resetOnNextInput = false;
        updateDisplay();
    }

    // Delete last character
    function deleteLast() {
        if (resetOnNextInput) {
            clearAll();
            return;
        }

        if (currentInput.length > 0) {
            currentInput = currentInput.slice(0, -1);
            if (currentInput === '' || currentInput === '-') {
                currentInput = '';
                lastDisplayValue = '0';
            } else {
                lastDisplayValue = currentInput;
            }
        }
        updateDisplay();
    }

    // Toggle positive/negative
    function toggleSign() {
        if (resetOnNextInput) {
            currentInput = lastDisplayValue;
            resetOnNextInput = false;
        }

        if (currentInput === '') {
            currentInput = '-';
            lastDisplayValue = '-0';
        } else if (currentInput === '-') {
            currentInput = '';
            lastDisplayValue = '0';
        } else {
            if (currentInput.startsWith('-')) {
                currentInput = currentInput.slice(1);
            } else {
                currentInput = '-' + currentInput;
            }
            lastDisplayValue = currentInput;
        }
        updateDisplay();
    }

    // Convert to percentage
    function applyPercent() {
        if (resetOnNextInput) {
            currentInput = lastDisplayValue;
            resetOnNextInput = false;
        }

        const value = parseFloat(currentInput || lastDisplayValue);
        if (!isNaN(value)) {
            // Avoid JS precision bugs with percentage (e.g. 56 / 100)
            const result = Number((value / 100).toFixed(12));
            currentInput = result.toString();
            lastDisplayValue = currentInput;
            updateDisplay();
        }
    }

    // Append digit or decimal
    function appendValue(value) {
        if (resetOnNextInput) {
            expression = '';
            currentInput = '';
            resetOnNextInput = false;
        }

        // Handle decimal point
        if (value === '.') {
            if (currentInput.includes('.')) return; // Prevent double decimals
            if (currentInput === '' || currentInput === '-') {
                currentInput += '0.';
            } else {
                currentInput += '.';
            }
            lastDisplayValue = currentInput;
            updateDisplay();
            return;
        }

        // Prevent multiple leading zeros
        if (currentInput === '0' && value === '0') return;
        if (currentInput === '0' && value !== '0') {
            currentInput = value;
        } else {
            // Keep input length reasonable (e.g., 15 digits)
            if (currentInput.replace(/[^0-9]/g, '').length >= 15) return;
            currentInput += value;
        }

        lastDisplayValue = currentInput;
        updateDisplay();
    }

    // Handle operations (+, -, *, /)
    function handleOperator(op) {
        if (resetOnNextInput) {
            // Continue calculating with the previous result
            expression = lastDisplayValue;
            currentInput = '';
            resetOnNextInput = false;
        }

        // If user typed a number, commit it to expression
        if (currentInput !== '' && currentInput !== '-') {
            // If the expression already has content and does not end with operator/space, append a space
            expression += currentInput;
            currentInput = '';
        } else if (expression === '') {
            // Cannot start expression with operator except negative sign
            if (op === '-') {
                currentInput = '-';
                lastDisplayValue = '-0';
                updateDisplay();
                return;
            }
            return;
        }

        // Check if expression ends with an operator (and optional spaces)
        expression = expression.trim();
        const trailingOpRegex = /[+\-*/]$/;

        if (trailingOpRegex.test(expression)) {
            // Replace the last operator with the new one
            expression = expression.slice(0, -1) + op;
        } else {
            expression += op;
        }

        updateDisplay();
    }

    // Safe Token Parser for math expressions
    function tokenize(str) {
        const tokens = [];
        let numberBuffer = '';
        
        // Remove spaces
        const sanitized = str.replace(/\s+/g, '');

        for (let i = 0; i < sanitized.length; i++) {
            const char = sanitized[i];
            
            if (/[0-9.]/.test(char)) {
                numberBuffer += char;
            } else if (/[+\-*/]/.test(char)) {
                if (numberBuffer) {
                    tokens.push(parseFloat(numberBuffer));
                    numberBuffer = '';
                }
                
                // Check if negative number prefix
                if (char === '-' && (tokens.length === 0 || typeof tokens[tokens.length - 1] === 'string')) {
                    numberBuffer = '-';
                } else {
                    tokens.push(char);
                }
            }
        }
        if (numberBuffer) {
            tokens.push(parseFloat(numberBuffer));
        }
        return tokens;
    }

    function evaluateTokens(tokens) {
        if (tokens.length === 0) return 0;
        
        // First pass: Multiplication and Division
        const outputQueue = [];
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token === '*' || token === '/') {
                const left = outputQueue.pop();
                const right = tokens[++i];
                
                if (left === undefined || right === undefined) {
                    throw new Error('Invalid Syntax');
                }
                
                if (token === '/') {
                    if (right === 0) {
                        throw new Error('DivideByZero');
                    }
                    outputQueue.push(left / right);
                } else {
                    outputQueue.push(left * right);
                }
            } else {
                outputQueue.push(token);
            }
        }
        
        // Second pass: Addition and Subtraction
        if (outputQueue.length === 0) return 0;
        let result = outputQueue[0];
        if (typeof result === 'string') {
            throw new Error('Invalid Syntax');
        }
        
        for (let i = 1; i < outputQueue.length; i += 2) {
            const operator = outputQueue[i];
            const nextValue = outputQueue[i + 1];
            
            if (nextValue === undefined || typeof nextValue !== 'number') {
                throw new Error('Invalid Syntax');
            }
            
            if (operator === '+') {
                result += nextValue;
            } else if (operator === '-') {
                result -= nextValue;
            } else {
                throw new Error('Invalid Syntax');
            }
        }
        
        return result;
    }

    function formatResult(num) {
        if (isNaN(num)) return 'Error';
        if (!isFinite(num)) return 'Error';
        
        let str = num.toString();
        
        // Fix float rounding errors (e.g. 0.1 + 0.2)
        if (str.includes('.')) {
            const parts = str.split('.');
            if (parts[1].length > 10) {
                let rounded = Number(Math.round(num + 'e10') + 'e-10');
                str = rounded.toString();
            }
        }
        
        // Scientific notation for extremely large/small values
        if (Math.abs(num) > 1e12 || (Math.abs(num) < 1e-7 && num !== 0)) {
            str = num.toExponential(6);
        }
        
        return str;
    }

    // Evaluate current expression
    function calculate() {
        let evalExpr = expression;
        
        // Append current input if it's there
        if (currentInput !== '' && currentInput !== '-') {
            evalExpr += currentInput;
        }

        evalExpr = evalExpr.trim();
        
        // If expression is empty, do nothing
        if (evalExpr === '') return;

        // If expression ends with an operator, trim it
        if (/[+\-*/]$/.test(evalExpr)) {
            evalExpr = evalExpr.slice(0, -1);
        }

        let resultText = '';
        try {
            const tokens = tokenize(evalExpr);
            const rawResult = evaluateTokens(tokens);
            resultText = formatResult(rawResult);
        } catch (error) {
            if (error.message === 'DivideByZero') {
                resultText = 'Cannot divide by 0';
            } else {
                resultText = 'Error';
            }
        }

        // Show the calculation in history screen
        updateDisplay(evalExpr + ' =');
        
        // Result becomes the active value
        lastDisplayValue = resultText;
        currentInput = '';
        expression = '';
        resetOnNextInput = true;

        // Highlight screen change by re-setting text
        primaryScreen.textContent = lastDisplayValue;
        
        // Font resizing check for the result
        if (lastDisplayValue.length > 12) {
            primaryScreen.style.fontSize = '1.5rem';
        } else if (lastDisplayValue.length > 8) {
            primaryScreen.style.fontSize = '1.9rem';
        } else {
            primaryScreen.style.fontSize = '2.4rem';
        }
    }

    // Event Listener for Click Grid
    keypad.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn');
        if (!btn) return;

        const action = btn.dataset.action;
        const operator = btn.dataset.operator;
        const value = btn.dataset.value;

        if (value !== undefined) {
            appendValue(value);
        } else if (operator !== undefined) {
            handleOperator(operator);
        } else if (action !== undefined) {
            switch (action) {
                case 'clear':
                    clearAll();
                    break;
                case 'backspace':
                    deleteLast();
                    break;
                case 'sign':
                    toggleSign();
                    break;
                case 'percent':
                    applyPercent();
                    break;
            }
        } else if (btn.id === 'equals') {
            calculate();
        }
    });

    // Keyboard Event Listener Support
    window.addEventListener('keydown', (e) => {
        let key = e.key;
        let btnToHighlight = null;

        if (/[0-9]/.test(key)) {
            appendValue(key);
            btnToHighlight = document.querySelector(`.btn-number[data-value="${key}"]`);
        } else if (key === '.') {
            appendValue('.');
            btnToHighlight = document.querySelector('.btn-number[data-value="."]');
        } else if (key === '+' || key === '-' || key === '*' || key === '/') {
            handleOperator(key);
            btnToHighlight = document.querySelector(`.btn-operator[data-operator="${key}"]`);
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            calculate();
            btnToHighlight = document.getElementById('equals');
        } else if (key === 'Backspace') {
            deleteLast();
            btnToHighlight = document.getElementById('backspace');
        } else if (key === 'Escape') {
            clearAll();
            btnToHighlight = document.getElementById('clear');
        } else if (key === '%') {
            applyPercent();
            btnToHighlight = document.getElementById('percent');
        }

        // Visual feedback for keyboard interaction
        if (btnToHighlight) {
            btnToHighlight.classList.add('keyboard-active');
            setTimeout(() => {
                btnToHighlight.classList.remove('keyboard-active');
            }, 100);
        }
    });

    // Initialize display
    updateDisplay();
});
