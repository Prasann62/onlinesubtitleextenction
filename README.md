# 🎬 NextSub AI - Smart Subtitle Finder

A powerful Chrome extension that automatically finds and displays subtitles for any video. Supports both **YIFY database search** and **AI-powered live transcription**.

![Version](https://img.shields.io/badge/version-2.1.0-6366f1)
![License](https://img.shields.io/badge/license-MIT-green)
![Chrome](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)
![Manifest](https://img.shields.io/badge/Manifest-V3-orange)

## ✨ Features

### 🔍 **Smart Subtitle Search**
- Search the YIFY/YTS database for movie subtitles
- Automatic movie detection from page title
- Multi-language support (English, Spanish, French, German, etc.)
- Recent search history for quick access

### 🎙️ **AI Live Transcription**
- Local Whisper-based speech-to-text
- No API keys required - runs entirely in browser
- Real-time subtitle generation

### 🎨 **Premium Subtitle Overlay**
- **Draggable** - Position subtitles anywhere on screen
- **Resizable font** - Adjust text size with controls or keyboard
- **Sync adjustment** - Fine-tune subtitle timing (+/- 0.5s)
- **Glassmorphism design** - Beautiful, modern appearance
- **Hover controls** - Font size and sync buttons appear on hover

### ⌨️ **Keyboard Shortcuts**
| Shortcut | Action |
|----------|--------|
| `Shift + ↑` | Delay subtitles (+0.5s) |
| `Shift + ↓` | Speed up subtitles (-0.5s) |
| `Shift + +` | Increase font size |
| `Shift + -` | Decrease font size |

### 🎯 **Additional Features**
- Automatic video detection across iframes and shadow DOMs
- Works on most video streaming sites
- Settings persistence (language, sync offset)
- Toast notifications for actions
- Loading animations and progress indicators

## 📦 Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked**
5. Select the extension folder

## 🚀 Usage

1. Navigate to any page with a video
2. Click the NextSub AI extension icon
3. The extension will auto-detect the video and suggest a title
4. Edit the title if needed
5. Click **Search Subtitles** to find matching subtitles
6. Or switch to **AI Live** mode for real-time transcription

## 🎛️ Overlay Controls

When subtitles are displayed, hover over the overlay to reveal controls:

- **Font Size**: `-` / `+` buttons to adjust text size
- **Sync**: `⏪` / `⏩` buttons to adjust timing
- **Drag**: Click and drag the overlay to reposition

## 🛠️ Technical Details

- **Manifest Version**: 3 (Chrome Extension MV3)
- **Content Script**: Injects into all frames for video detection
- **Background Service Worker**: Handles API requests and ZIP parsing
- **Offscreen Document**: Used for AI audio capture
- **Storage**: Chrome local storage for settings

## 📁 File Structure

```
├── manifest.json       # Extension configuration
├── popup.html          # Extension popup UI
├── popup.css           # Popup styling (premium dark theme)
├── popup.js            # Popup logic and interactions
├── content.js          # Video detection and overlay
├── style.css           # Subtitle overlay styling
├── background.js       # Service worker (API, ZIP parsing)
├── offscreen.html      # Offscreen document for AI
├── offscreen.js        # Audio capture logic
├── worker.js           # Web worker for AI processing
└── README.md           # This file
```

## 🎨 Design

The extension features a **premium dark theme** with:
- Indigo/Purple gradient accents
- Glassmorphism effects
- Smooth animations
- Responsive hover states
- Modern typography (Outfit font)

## 📝 Changelog

### v2.1.0 (Latest)
- ✨ Complete UI redesign with premium glassmorphism
- 🎚️ Added subtitle sync controls in popup
- 🔤 Added font size controls on overlay
- 🖱️ Made subtitle overlay draggable
- 🌍 Added language selection for subtitles
- 📚 Added recent search history
- 🔔 Added toast notifications
- ⌨️ Added keyboard shortcuts for sync/font
- 💾 Settings persistence (language, sync)
- 🎬 Improved video title detection

### v2.0.1
- Initial keyless implementation
- YIFY subtitle database integration
- Local Whisper AI transcription

## 👤 Author

**Prasanna Kumar**

- GitHub: [@Prasann62](https://github.com/Prasann62)
- Repository: [onlinesubtitleextenction](https://github.com/Prasann62/onlinesubtitleextenction)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ⭐ Show Your Support

Give a ⭐ if this project helped you!

## 📄 License

MIT License - Feel free to modify and distribute.

---

Made with ❤️ by Prasanna Kumar for seamless video watching
