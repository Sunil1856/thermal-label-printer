# ThermalPrint CAD Studio (Desktop & Web)

A professional, precision CAD-based visual designer and thermal label printing suite built for thermal barcode printers (TSC TE244, TVS, Zebra, Xprinter, Citizen, etc.).

Works cross-platform on **Windows**, **macOS**, and **Linux** both as a **Desktop Software Application** and as a **Local Network Web Studio** with real-time 1:1 millimeter (mm) WYSIWYG visual design, drag-and-drop element positioning, full optical rat-tail/dumbbell eyewear tag support, editable barcode human-readable text, multi-device Wi-Fi network printing, and multi-product batch printing queues.

---

## 💻 Cross-Platform Support (Windows, Linux, macOS)

| Platform | Desktop App | Browser Mode | 1-Click Launcher |
| :--- | :---: | :---: | :---: |
| **Windows** (10, 11) | ✅ Yes (`npm run app`) | ✅ Yes (`localhost:3000`) | `start.bat` |
| **macOS** (Intel / Apple Silicon) | ✅ Yes (`npm run app`) | ✅ Yes (`localhost:3000`) | `bash start.sh` |
| **Linux** (Ubuntu, Debian, Fedora, Arch) | ✅ Yes (`npm run app`) | ✅ Yes (`localhost:3000`) | `bash start.sh` |

---

## 🚀 Quick Start Guide (Run in 1 Minute)

### 🪟 Windows Setup:
1. **Download:** Click the green **Code -> Download ZIP** on GitHub (or download `v2.1.0.zip` from Releases) and extract the folder.
2. **Launch:** Double-click **`start.bat`**.
   - If Node.js is installed, it will automatically launch the app or server!
   - If you want the full native desktop app window, run `npm run app` in the folder.
   - You can also double-click `index.html` to run in standalone browser mode instantly without installing anything!

---

### 🍎 macOS Setup (MacBook / iMac / Mac mini):
1. **Download & Extract:** Download the repository ZIP and unzip it on your Mac.
2. **Open Terminal** in the extracted folder:
   ```bash
   cd ~/Downloads/thermal-label-printer
   chmod +x start.sh
   ./start.sh
   ```
3. To run as an Electron Desktop App on macOS:
   ```bash
   npm install
   npm run app
   ```

---

### 🐧 Linux Setup (Ubuntu / Debian / Fedora / Arch):
1. **Download & Extract:**
   ```bash
   git clone https://github.com/Sunil1856/thermal-label-printer.git
   cd thermal-label-printer
   ```
2. **Run 1-Click Launcher:**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
   *The launcher will automatically start the server and open your default web browser (Chrome, Firefox, Chromium).*
3. To launch the Electron Desktop App on Linux:
   ```bash
   npm install
   npm run app
   ```

---

## 🌟 Key Features

1. **CAD-Style Visual Designer**:
   - Exact millimeter (mm) coordinate system with live top & left measurement rulers.
   - Dynamic cursor crosshairs and real-time telemetry badge (`📍 X: 0.0 mm | Y: 0.0 mm`).
   - 8-point interactive resize handles with multi-level zoom (150% – 500%).
   - Full Undo / Redo (`Ctrl+Z` / `Ctrl+Y`) and layer ordering (Bring to Front / Send to Back).
   - Fine-pitch grid snapping (0.5 mm / 1.0 mm / Off).
   - Micro-step keyboard nudging (`0.05 mm` with Alt, `0.2 mm` default, `1.0 mm` with Shift).

2. **Professional Desktop Menubar**:
   - **`File`**: New Project (`Ctrl+N`), Open Projects (`Ctrl+O`), Save (`Ctrl+S`), Export/Import `.json`, Export high-res PNG image, Export Vector SVG, 1-Click Backup ZIP, Print (`Ctrl+P`).
   - **`Layout & Size`**: Predefined tags (Specs Buddy 81×12mm, Long Tail 91×12mm, Head Only 55×12mm, Jewelry 65×15mm, Barcode Label 50×25mm, Apparel 50×30mm), and interactive Layout Studio.
   - **`Insert`**: Text, Barcode (Code 128), QR Code, Horizontal Line, Box Frame.
   - **`Batch Queue`**: Bulk multi-item printing table, CSV Import & Sample CSV download.
   - **`Printer & Calibration`**: Hardware feed offsets (X/Y mm) and printer driver guide.

3. **Interactive "Layout & Working Area Studio"**:
   - Live visual box representation showing active printable area vs non-printable rat-tail loop.
   - Real-time slider and inputs to customize exactly how much area is printable.

4. **⚡ 6 Quick Alignment Buttons**:
   - 1-click `Left`, `Center Horizontally`, `Right`, `Top`, `Middle (Vertically)`, and `Bottom`.

5. **Optical Dumbbell & Eyewear Rat-Tail Tags**:
   - Built specifically for optical jewelry & eyewear tags (such as 81 × 12 mm dumbbell labels: 55 mm printable head + 26 mm rat-tail loop).
   - Non-printable gray tone edge visualizer with +10 mm / -10 mm rapid extension buttons.
   - Hardware print calibration offsets (`X Offset` and `Y Offset` in mm) to counter physical printer feed drifts.

6. **Local Network (LAN / Wi-Fi) Printing**:
   - Automatically detects your IPv4 LAN address (e.g. `http://192.168.1.40:3000`).
   - Any PC, laptop, or tablet connected to the same Wi-Fi/Ethernet router can access the designer and trigger label prints.

---

## 🖨️ Recommended Thermal Printer Driver Settings

When printing from Chrome / Edge (via `Ctrl + P`):
1. **Destination**: Select your thermal printer (e.g., *TSC TE244*, *Xprinter*, *Zebra*).
2. **Paper Size**: Select your matching label size (e.g., `81mm x 12mm` or `55mm x 12mm`).
3. **Margins**: Set to **"None"** (Critical: prevents Chrome from adding ~8mm margins).
4. **Scale**: Set to **100%** (Do NOT choose "Fit to printable area").
5. **Headers and footers**: **Uncheck** (ensures no URLs or timestamps print on stickers).

---

## 📁 Repository Structure

```
Thermal-Label-Printer/
├── main.js                     # Electron Desktop App main process
├── preload.js                  # Electron secure IPC bridge
├── server.js                   # Cross-platform LAN HTTP server (Windows, macOS, Linux)
├── start.bat                   # 1-click launcher for Windows
├── start.sh                    # 1-click launcher for Linux & macOS
├── index.html                  # Main CAD studio application
├── css/
│   └── cad-style.css           # CAD workspace, menubar, modal & print styles
├── js/
│   ├── cad-engine.js           # Visual CAD canvas, alignment tools & print renderer
│   ├── cad-templates.js        # Preset templates (Specs Buddy, Jewelry, Retail, etc.)
│   ├── barcode.js              # Vector SVG Barcode generator (Code 128 / EAN)
│   └── qrcode.js               # Vector SVG QR Code generator
├── projects/                   # Saved projects and templates (.json)
└── package.json                # Project dependencies and desktop scripts
```

---

## 📜 License
MIT License. Created by [Sunil1856](https://github.com/Sunil1856). Free for commercial and retail use.
