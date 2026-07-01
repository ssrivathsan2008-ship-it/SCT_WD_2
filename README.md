# Stellar Calculator 🌌

Stellar Calculator is a premium, fully responsive, and feature-rich Web Calculator designed for modern browsers. Built entirely using vanilla HTML, CSS, and JavaScript, it demonstrates advanced DOM manipulation, precise event handling, custom token parsing, and high-end glassmorphic UI design.

![Theme Preview](https://img.shields.io/badge/Theme-Dark%20%2F%20Light-blueviolet?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)
![CSS3](https://img.shields.io/badge/CSS-Vanilla%20%2F%20Variables-blue?style=for-the-badge&logo=css3)
![HTML5](https://img.shields.io/badge/HTML-HTML5-orange?style=for-the-badge&logo=html5)

---

## ✨ Features

- **🎨 High-End Glassmorphism UI**: Uses semi-transparent borders, background backdrops, drop-shadows, and glowing neon gradients for a modern look.
- **🌗 Dual Themes**: Features persistent Dark and Light themes that transition smoothly and remember your choice using `localStorage`.
- **🧮 Safe Operator Precedence Parser**: Evaluates mathematical formulas correctly (multiplication/division before addition/subtraction) using a custom token parser instead of the unsafe `eval()` function.
- **⌨️ Numpad & Keyboard Bindings**: Full support for physical keyboards (0-9, decimal point, operators, backspace, escape to clear, and enter to evaluate) with visual active state transitions for keys.
- **⚙️ Edge-Case Protection**:
  - Automatically fixes JavaScript floating-point precision issues (e.g., `0.1 + 0.2` correctly displays `0.3`).
  - Displays `"Cannot divide by 0"` when dividing by zero.
  - Automatically scales down text sizes dynamically to prevent screen overflow.

---

## 📂 File Structure

```
calculator-app/
├── index.html   # Markup structure and icon integrations
├── styles.css   # Theme systems, responsive styling, and transitions
├── script.js    # Event handlers, tokenizers, and calculations
└── README.md    # Documentation
```

---

## 🚀 How to Run Locally

Since this project relies on vanilla web technologies, there are no compilers or dependencies to install!

1. Clone or download this repository.
2. Open the directory containing the files.
3. Double-click **`index.html`** to open it directly in any web browser (Chrome, Edge, Safari, Firefox).

---

## 🎮 Keyboard Bindings Reference

| Key | Calculator Action |
| --- | --- |
| `0` - `9` | Digits |
| `.` | Decimal Point |
| `+`, `-`, `*`, `/` | Add, Subtract, Multiply, Divide |
| `Enter` or `=` | Calculate Result |
| `Backspace` | Delete last digit |
| `Escape` | Clear All |
| `%` | Convert to percentage |
