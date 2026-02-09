# 🪟 Stitch PiP Extension

A powerful **Brave / Chromium browser extension** that enables **Mini Player** and **Picture-in-Picture (PiP)** for videos on **any website**.

Built to be **fast, privacy-friendly, and highly configurable** with advanced keyboard controls and smart video detection.

---

## ✨ Features

### 🎥 Picture-in-Picture (PiP)
  - Native Chromium PiP API
  - **Document PiP Support** with custom controls overlay
  - Works on most HTML5 video websites
  - Smart video detection (filters out thumbnails and ads)

### 🪟 Robust Mini Player (Fallback)
  - Floating video mode for sites that block native PiP
  - Resizable (Small, Medium, Large)
  - Stays visible while scrolling
  - Smooth animations and transitions

### ⌨️ Enhanced Keyboard Shortcuts
  - `Alt + P`: Toggle PiP
  - `Alt + X`: Close PiP
  - `Space`: Play/Pause
  - `M`: Mute/Unmute
  - `← / →`: Seek 5 seconds
  - **NEW** `Alt + ↑/↓`: Volume control
  - **NEW** `Shift + </```>`: Playback speed control
  - `Alt + ±`: Resize in Document PiP mode
  - `Alt + Arrows`: Move PiP window
  - `H`: Show help tooltip

### 🎨 Customization
  - **Dark/Light Theme** support
  - Configurable Mini-Player size (Small/Medium/Large)
  - **Auto-PiP on Tab Switch** (optional)
  - Settings persist across sessions
  - Type-based toast notifications (success, error, info, warning)

### ⚡ Performance Optimizations
  - Debounced mutation observer for better performance
  - Smart video detection (ignores thumbnails)
  - Lazy loading
  - Optimized for minimal resource usage

### 🦁 Brave Optimized
  - No tracking / analytics
  - 100% local execution
  - Privacy-first design

---

## 🚀 What's New (v1.1)

✨ **New Features:**
- Volume control with keyboard shortcuts (`Alt + ↑/↓`)
- Playback speed controls (`Shift + </```>`)
- Auto-PiP on tab switch (optional setting)
- Enhanced toast notification system with color-coded types
- Smart video detection filters out thumbnails

⚡ **Performance Improvements:**
- Debounced mutation observer reduces CPU usage
- Optimized video detection algorithm
- Better memory management

🎨 **UI Enhancements:**
- Updated help tooltip with all shortcuts
- Auto-PiP toggle in popup
- Better visual feedback for all actions

🐛 **Bug Fixes:**
- Fixed forward seek emoji (was showing rewind)
- Improved keyboard shortcut conflicts
- Better error handling throughout

---

## 🚀 How It Works

1. Detects `<video>` elements on the page (filtering out thumbnails).
2. Injects a smart "PiP" button on YouTube player controls.
3. Allows toggling via Extension Popup or Keyboard Shortcuts.
4. Intelligently falls back to a "Floating Mode" if native PiP is unavailable.
5. Auto-PiP feature can automatically enter PiP when switching tabs.

---

## 📂 Project Structure

```
stitch-pip-extension/
│
├── manifest.json        # Manifest V3 (Brave / Chrome)
├── content/             # Modular Content Scripts
│   ├── config.js        # Centralized configuration
│   ├── utils.js         # Utility functions (debounce, throttle, storage)
│   ├── pip.js           # Core PiP Logic
│   ├── ui.js            # UI Injection (Buttons, Tooltips)
│   ├── controls.js      # Keyboard & Event Listeners
│   └── main.js          # Entry Point
├── popup.html           # Extension Popup UI
├── popup.js             # Popup Logic
├── background.js        # Background Service Worker
├── tests/               # Jest Test Suite
│   ├── utils.test.js    # Utility function tests
│   ├── pip.test.js      # PiP functionality tests
│   └── controls.test.js # Keyboard control tests
├── README.md            # Documentation
└── CONTRIBUTING.md      # Contribution Guidelines
```

---

## 🛠 Installation

### From Source (Developer Mode)

1. Open **Brave** or **Chrome**.
2. Go to `chrome://extensions/`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked**.
5. Select the project folder.

### Building (Optional)

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

This project uses Jest for comprehensive unit testing.

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Watch mode for development
npm test -- --watch
```

---

## ⌨️ Keyboard Shortcuts Reference

| Action | Shortcut | Description |
|--------|----------|-------------|
| Toggle PiP | `Alt + P` | Enter/exit Picture-in-Picture mode |
| Close PiP | `Alt + X` | Exit PiP mode |
| Play/Pause | `Space` | Toggle video playback |
| Mute/Unmute | `M` | Toggle audio mute |
| Seek Backward | `←` | Rewind 5 seconds |
| Seek Forward | `→` | Fast forward 5 seconds |
| Volume Up | `Alt + ↑` | Increase volume by 10% |
| Volume Down | `Alt + ↓` | Decrease volume by 10% |
| Speed Up | `Shift + >` | Increase playback speed |
| Slow Down | `Shift + <` | Decrease playback speed |
| Resize PiP | `Alt + ±` | Resize PiP window (Document PiP only) |
| Move PiP | `Alt + Arrows` | Move PiP window (Document PiP only) |
| Help | `H` | Toggle keyboard shortcuts help |

---

## 📌 Roadmap

- [x] Keyboard shortcuts (`Alt+P`, `Alt+X`)
- [x] Volume control shortcuts (`Alt+↑/↓`)
- [x] Playback speed control (`Shift+</```>`)
- [x] UI Theme Toggle (Dark/Light)
- [x] Advanced Fallback (Floating Window)
- [x] Configurable Player Size
- [x] Auto-PiP on tab switch
- [x] Smart video detection
- [ ] Draggable floating window
- [ ] Custom positioning options
- [ ] Platform-specific enhancements (Netflix, Prime, etc.)
- [ ] Subtitle/caption controls in PiP
- [ ] Brave Store release
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

MIT License - See LICENSE file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ for the Brave browser community
- Uses native Web APIs for optimal performance
- Inspired by the need for universal PiP support

---

**Made with 🧵 Stitch UI Design System**
