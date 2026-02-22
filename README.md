# 🪟 S.T.I.T.C.H — Mini Player & PiP Extension

> **S**mart **T**ab-aware **I**ntelligent **T**heatre **C**ontrol **H**ub

A powerful **Brave / Chromium browser extension** that enables **Mini Player** and **Picture-in-Picture (PiP)** for videos on **any website**.

Built with a **cyberpunk Stitch UI**, privacy-first design, and advanced keyboard controls — no tracking, 100% local execution.

[![Version](https://img.shields.io/badge/version-1.1.0-cyan?style=flat-square&logo=googlechrome)](https://github.com/Prasann62/onlinesubtitleextenction)
[![Manifest](https://img.shields.io/badge/Manifest-V3-blueviolet?style=flat-square)](https://developer.chrome.com/docs/extensions/mv3/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Build](https://img.shields.io/badge/build-DEV--BUILD-orange?style=flat-square)]()

---

## ✨ Features

### 🎥 Picture-in-Picture (PiP)
- Native Chromium PiP API integration
- **Document PiP Support** with fully custom controls overlay
- Works on most HTML5 video websites (YouTube, Twitch, Netflix, etc.)
- Smart video detection — filters out thumbnails and ads automatically

### 🪟 Robust Mini Player (Fallback)
- Floating video mode for sites that block native PiP
- Resizable viewports: **Small / Medium / Large**
- Stays visible while scrolling with smooth animations
- Injected via Document PiP for maximum compatibility

### ⌨️ Keyboard Shortcuts
- `Alt + P` — Toggle PiP mode
- `Alt + X` — Close PiP
- `Space` — Play / Pause
- `M` — Mute / Unmute
- `← / →` — Seek ±5 seconds
- `Alt + ↑ / ↓` — Volume control (±10%)
- `Shift + > / <` — Playback speed control
- `Alt + = / -` — Resize (Document PiP only)
- `Alt + Arrow Keys` — Move PiP window
- `H` — Toggle keyboard shortcuts help tooltip

### 🎨 Stitch UI Design System
- **Dark / Light Theme** toggle
- Glassmorphism + neon accents
- Animated **Neuro-Link Visualizer** canvas in the popup header
- Background glow elements for depth
- Color-coded toast notification system (success / error / info / warning)
- Fully modular CSS via `stitch.css`

### ⚙️ Configuration & Settings
- **Auto-PiP on Tab Switch** — automatically enters PiP when you change tabs
- **Viewport Size Selector** — S / M / L via segmented control in popup
- **Options Page** — expanded settings accessible via `chrome://extensions`
- All settings persisted via `chrome.storage.sync`

### ⚡ Performance
- Debounced MutationObserver for efficient DOM monitoring
- Smart video detection ignores thumbnails (< 200px)
- Lazy-loaded content scripts
- Optimized for minimal CPU/memory footprint

### 🦁 Privacy-First
- Zero analytics or tracking
- 100% local execution
- No external network requests

---

## 🚀 What's New in v1.1.0

### ✨ New Features
- Stitch cyberpunk UI with glassmorphism and neon glow effects
- Animated Neuro-Link canvas visualizer in the popup
- Options page (`options.html`) for expanded configuration
- Volume control keyboard shortcuts (`Alt + ↑/↓`)
- Playback speed controls (`Shift + > / <`)
- Auto-PiP on tab switch toggle
- Enhanced toast notification system with 4 color-coded types

### ⚡ Performance Improvements
- Debounced mutation observer reduces CPU usage significantly
- Optimized video detection algorithm
- Better memory management and cleanup on unload

### 🎨 UI Enhancements
- Complete Stitch UI overhaul (dark mode, glassmorphism, neon)
- Segmented viewport size control (S/M/L)
- Floating "DETECTED STREAMS" log panel in popup
- System-style footer with connection status

### 🐛 Bug Fixes
- Fixed forward seek emoji (was incorrectly showing rewind icon)
- Improved keyboard shortcut conflict resolution
- Better error handling and fallback logic throughout
- Fixed mini-player overlay alignment on document PiP

---

## 📂 Project Structure

```
stitch-pip-extension/
│
├── manifest.json           # Manifest V3 (Brave / Chrome)
├── background.js           # Background Service Worker
│
├── content/                # Modular Content Scripts
│   ├── config.js           # Centralized configuration & constants
│   ├── utils.js            # Utility functions (debounce, throttle, storage)
│   ├── pip.js              # Core PiP Logic (native + document PiP)
│   ├── ui.js               # UI Injection (buttons, tooltips, overlays)
│   ├── controls.js         # Keyboard & event listeners
│   ├── styles.css          # Injected content styles
│   └── main.js             # Entry point & initialization
│
├── popup.html              # Extension Popup UI (Stitch Design)
├── popup.js                # Popup Logic
├── options.html            # Options / Settings Page
├── options.js              # Options Page Logic
│
├── stitch.css              # Stitch UI Design System (CSS variables, components)
├── style.css               # Additional global styles
├── input.css               # Tailwind CSS input (for build tooling)
├── popup.css               # Compiled Tailwind CSS output
│
├── tests/                  # Jest Test Suite
│   ├── utils.test.js       # Utility function tests
│   ├── pip.test.js         # PiP functionality tests
│   └── controls.test.js    # Keyboard control tests
│
├── README.md               # This file
└── CONTRIBUTING.md         # Contribution guidelines
```

---

## 🛠 Installation

### From Source (Developer Mode)

1. Open **Brave** or **Chrome**.
2. Go to `chrome://extensions/`.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked**.
5. Select the project folder.
6. The **S.T.I.T.C.H** icon will appear in your toolbar.

### Building CSS (Optional)

```bash
# Install dependencies
npm install

# Build Tailwind CSS for popup
npm run build

# Watch mode for development
npm run watch
```

---

## 🧪 Testing

This project uses **Jest** for comprehensive unit testing.

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests with coverage report
npm test -- --coverage

# Watch mode for TDD
npm test -- --watch
```

---

## ⌨️ Keyboard Shortcuts Reference

| Action | Shortcut | Description |
|--------|----------|-------------|
| Toggle PiP | `Alt + P` | Enter / exit Picture-in-Picture mode |
| Close PiP | `Alt + X` | Exit PiP completely |
| Play / Pause | `Space` | Toggle video playback |
| Mute / Unmute | `M` | Toggle audio mute |
| Seek Backward | `←` | Rewind 5 seconds |
| Seek Forward | `→` | Fast forward 5 seconds |
| Volume Up | `Alt + ↑` | Increase volume by 10% |
| Volume Down | `Alt + ↓` | Decrease volume by 10% |
| Speed Up | `Shift + >` | Increase playback speed |
| Slow Down | `Shift + <` | Decrease playback speed |
| Resize PiP | `Alt + = / -` | Resize window (Document PiP only) |
| Move PiP | `Alt + Arrow Keys` | Move PiP window (Document PiP only) |
| Help | `H` | Toggle keyboard shortcuts tooltip |

---

## 📌 Roadmap

- [x] Keyboard shortcuts (`Alt+P`, `Alt+X`)
- [x] Volume control shortcuts (`Alt+↑/↓`)
- [x] Playback speed control (`Shift+</>`)
- [x] Dark / Light theme toggle
- [x] Advanced fallback (Floating Mini Player)
- [x] Configurable player size (S/M/L)
- [x] Auto-PiP on tab switch
- [x] Smart video detection (filters thumbnails)
- [x] Stitch UI Design System (glassmorphism + neon)
- [x] Neuro-Link canvas visualizer
- [x] Options page for extended settings
- [x] Color-coded toast notification system
- [ ] Draggable floating window
- [ ] Custom positioning options
- [ ] Platform-specific enhancements (Netflix, Prime Video, etc.)
- [ ] Subtitle / caption controls in PiP
- [ ] Brave Web Store release
- [ ] Multi-language support

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on:
- Code of Conduct
- Development workflow
- Pull request process
- Testing requirements

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- Built with ❤️ for the **Brave** browser community
- Powered by native Web APIs for optimal performance
- UI crafted with the **Stitch Design System** — cyberpunk meets function

---

<div align="center">

**Made with 🧵 Stitch UI Design System**

*S.T.I.T.C.H — Smart Tab-aware Intelligent Theatre Control Hub*

</div>
