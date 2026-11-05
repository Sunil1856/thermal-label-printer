# ThermalPrint CAD Studio

A modern, precision CAD-based visual designer and thermal label printing suite built for thermal barcode printers (TSC TE244, TVS, Zebra, Xprinter, Citizen, etc.).

Features real-time 1:1 millimeter (mm) WYSIWYG visual design, drag-and-drop element positioning, full optical rat-tail/dumbbell eyewear tag support, editable barcode human-readable text, multi-device local network printing, and multi-product batch printing queues.

---

## 🌟 Key Features

1. **CAD-Style Visual Designer**:
   - Exact millimeter (mm) coordinate system with live top & left measurement rulers.
   - Dynamic cursor crosshairs and coordinate telemetry (`X: 0.0 mm | Y: 0.0 mm`).
   - 8-point interactive resize handles with multi-level zoom (150% – 500%).
   - Full Undo / Redo (`Ctrl+Z` / `Ctrl+Y`) and element layer ordering (Bring to Front / Send to Back).
   - Fine-pitch grid snapping (0.5 mm / 1.0 mm / Off).

2. **Optical Dumbbell & Eyewear Rat-Tail Tags**:
   - Built specifically for optical jewelry & eyewear tags (such as 81 × 12 mm dumbbell labels: 55 mm printable head + 26 mm rat-tail loop).
   - Non-printable gray tone edge visualizer with +10 mm / -10 mm rapid extension buttons.
   - Hardware print calibration offsets (`X Offset` and `Y Offset` in mm) to counter physical printer feed drifts.

3. **Complete Barcode & QR Code Control**:
   - Pure, zero-dependency SVG vector barcode engine (Code 128, EAN-13, EAN-8, Code 39).
   - Dedicated human-readable text control: edit the text displayed beneath the barcode bars independently from the barcode value.
   - Bar height, module density, text gap, font size, and bar stretch controls.
   - Built-in vector QR Code generator.

4. **Local Network (LAN) Printing**:
   - Built-in zero-dependency Node.js HTTP server.
   - Automatically detects your IPv4 LAN address (e.g. `http://192.168.1.40:3000`).
   - Any PC, laptop, or tablet connected to the same Wi-Fi/Ethernet router can access the designer and trigger label prints.

5. **Multi-Item Batch Print Queue**:
   - Queue up multiple frame models, barcodes, prices, and quantities in one continuous print job.
   - In-app editable batch table.
   - CSV bulk import and sample CSV template export.

---

## 🚀 Quick Start

### Option 1: One-Click Windows Launcher (Local Network Server)
Double-click `start-network-server.bat` in the folder. It will:
1. Start the local network server on port `3000`.
2. Automatically display your LAN access URL (e.g., `http://192.168.1.40:3000`).
3. Open the studio in your default browser.

### Option 2: Standalone Browser Mode (No Node.js Required)
Simply double-click `index.html` to open directly in Google Chrome, Microsoft Edge, or Firefox.

---

## 🖨️ Recommended Thermal Printer Driver Settings

When printing from Chrome / Edge (via `Ctrl + P`):
1. **Destination**: Select your thermal printer (e.g., *TSC TE244*).
2. **Paper Size**: Select your matching label size (e.g., `81mm x 12mm` or `55mm x 12mm`).
3. **Margins**: Set to **"None"** (Critical: prevents Chrome from adding ~8mm margins).
4. **Scale**: Set to **100%** (Do NOT choose "Fit to printable area").
5. **Headers and footers**: **Uncheck** (ensures no URLs or timestamps print on stickers).

---

## 📁 Project Structure

```
Thermal-Label-Printer/
├── index.html                  # Main CAD studio single-page application
├── server.js                   # Node.js zero-dependency LAN HTTP server
├── start-network-server.bat    # Windows batch launcher for network server
├── start.bat                   # Simple launcher
├── css/
│   └── cad-style.css           # CAD workspace, rulers, modal & print styles
├── js/
│   ├── cad-engine.js           # Visual CAD canvas, resize/drag, DOM & print renderer
│   ├── cad-templates.js        # Preset templates (Specs Buddy, Retail Apparel, etc.)
│   ├── barcode.js              # Vector SVG Barcode generator (Code 128 / EAN)
│   └── qrcode.js               # Vector SVG QR Code generator
├── package.json
└── README.md
```

## 📄 License
MIT License. Created for customized optical & retail price tag printing.
