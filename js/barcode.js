/**
 * ThermalPrint Pro - Vector SVG Barcode Generator (Precision Version)
 * Supports: Code 128 (Auto / Subset B & C), EAN-13, EAN-8, Code 39
 * Outputs high-contrast, scalable SVG for 203 DPI / 300 DPI thermal printing.
 */

(function (global) {
  'use strict';

  // --- CODE 128 PATTERNS (107 symbols: 6-char strings representing bar/space widths, sum = 11 modules) ---
  const C128_PATTERNS = [
    "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213", // 0-9
    "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132", // 10-19
    "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211", // 20-29
    "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313", // 30-39
    "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331", // 40-49
    "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111", // 50-59
    "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214", // 60-69
    "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111", // 70-79
    "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141", // 80-89
    "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141", // 90-99
    "114131", "311141", "411131", "211412", "211214", "211232", "2331112" // 100-106 (106 is STOP)
  ];

  const START_B = 104;
  const START_C = 105;
  const STOP_CODE = 106;

  function encodeCode128(text) {
    if (!text || text.length === 0) text = "12345678";
    
    const isPureDigits = /^\d+$/.test(text);
    const codes = [];
    
    if (isPureDigits && text.length % 2 === 0 && text.length >= 4) {
      codes.push(START_C);
      for (let i = 0; i < text.length; i += 2) {
        codes.push(parseInt(text.substr(i, 2), 10));
      }
    } else {
      codes.push(START_B);
      for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code >= 32 && code <= 126) {
          codes.push(code - 32);
        } else {
          codes.push(0);
        }
      }
    }

    let checksum = codes[0];
    for (let i = 1; i < codes.length; i++) {
      checksum += codes[i] * i;
    }
    checksum = checksum % 103;
    codes.push(checksum);
    codes.push(STOP_CODE);

    let binary = "";
    for (let c of codes) {
      const pattern = C128_PATTERNS[c];
      for (let p = 0; p < pattern.length; p++) {
        const width = parseInt(pattern[p], 10);
        const bit = (p % 2 === 0) ? "1" : "0";
        binary += bit.repeat(width);
      }
    }
    return binary;
  }

  // --- EAN-13 PATTERNS ---
  const EAN_L = [
    "0001101", "0011001", "0010011", "0111101", "0100011",
    "0110001", "0101111", "0111011", "0110111", "0001011"
  ];
  const EAN_G = [
    "0100111", "0110011", "0011011", "0100001", "0011101",
    "0111001", "0000101", "0010001", "0001001", "0010111"
  ];
  const EAN_R = [
    "1110010", "1100110", "1101100", "1000010", "1011100",
    "1001110", "1010000", "1000100", "1001000", "1110100"
  ];
  const EAN_PARITY = [
    "LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG",
    "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"
  ];

  function calcEANChecksum(digits12) {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const val = parseInt(digits12[i], 10) || 0;
      sum += (i % 2 === 0) ? val : val * 3;
    }
    const rem = sum % 10;
    return rem === 0 ? 0 : 10 - rem;
  }

  function encodeEAN13(raw) {
    let digits = (raw || "").replace(/\D/g, "");
    if (digits.length < 12) digits = digits.padEnd(12, "0");
    digits = digits.substring(0, 12);
    const checksum = calcEANChecksum(digits);
    const full = digits + checksum;

    const first = parseInt(full[0], 10);
    const parity = EAN_PARITY[first];

    let binary = "101";
    for (let i = 1; i <= 6; i++) {
      const d = parseInt(full[i], 10);
      binary += (parity[i - 1] === "L") ? EAN_L[d] : EAN_G[d];
    }
    binary += "01010";
    for (let i = 7; i <= 12; i++) {
      const d = parseInt(full[i], 10);
      binary += EAN_R[d];
    }
    binary += "101";
    return { binary, display: full };
  }

  // --- EAN-8 ---
  function calcEAN8Checksum(digits7) {
    let sum = 0;
    for (let i = 0; i < 7; i++) {
      const val = parseInt(digits7[i], 10) || 0;
      sum += (i % 2 === 0) ? val * 3 : val;
    }
    const rem = sum % 10;
    return rem === 0 ? 0 : 10 - rem;
  }

  function encodeEAN8(raw) {
    let digits = (raw || "").replace(/\D/g, "");
    if (digits.length < 7) digits = digits.padEnd(7, "0");
    digits = digits.substring(0, 7);
    const checksum = calcEAN8Checksum(digits);
    const full = digits + checksum;

    let binary = "101";
    for (let i = 0; i < 4; i++) {
      binary += EAN_L[parseInt(full[i], 10)];
    }
    binary += "01010";
    for (let i = 4; i < 8; i++) {
      binary += EAN_R[parseInt(full[i], 10)];
    }
    binary += "101";
    return { binary, display: full };
  }

  // --- CODE 39 ---
  const C39_MAP = {
    '0': '000110100', '1': '100100001', '2': '001100001', '3': '101100000', '4': '000110001',
    '5': '100110000', '6': '001110000', '7': '000100101', '8': '100100100', '9': '001100100',
    'A': '100001001', 'B': '001001001', 'C': '101001000', 'D': '000011001', 'E': '100011000',
    'F': '001011000', 'G': '000001101', 'H': '100001100', 'I': '001001100', 'J': '000011100',
    'K': '100000011', 'L': '001000011', 'M': '101000010', 'N': '000010011', 'O': '100010010',
    'P': '001010010', 'Q': '000000111', 'R': '100000110', 'S': '001000110', 'T': '000010110',
    'U': '110000001', 'V': '011000001', 'W': '111000000', 'X': '010010001', 'Y': '110010000',
    'Z': '011010000', '-': '010000101', '.': '110000100', ' ': '011000100', '$': '010101000',
    '/': '010100010', '+': '010001010', '%': '000101010', '*': '010010100'
  };

  function encodeCode39(text) {
    const clean = ("*" + (text || "ITEM").toUpperCase().replace(/[^0-9A-Z\-.$/+% ]/g, "") + "*") || "*ITEM*";
    let binary = "";
    for (let i = 0; i < clean.length; i++) {
      const char = clean[i];
      const pattern = C39_MAP[char] || C39_MAP[' '];
      for (let j = 0; j < 9; j++) {
        const isWide = pattern[j] === '1';
        const isBar = (j % 2 === 0);
        const count = isWide ? 3 : 1;
        binary += (isBar ? "1" : "0").repeat(count);
      }
      binary += "0";
    }
    return binary;
  }

  // --- SVG RENDERER (ZERO DEAD MARGIN, CUSTOM TEXT, PRECISE PROPORTIONS) ---
  function renderBarcodeSVG(type, value, options) {
    options = Object.assign({
      barHeight: 28,
      moduleWidth: 1.2,
      showText: true,
      text: null, // Custom text below barcode (if null, defaults to value)
      fontSize: 8.5,
      fontFamily: "'Courier New', Courier, monospace",
      fontWeight: "bold",
      textMargin: 1.5,
      letterSpacing: 1.0,
      textAlign: "center",
      stretch: true, // If true, fills container width via viewBox
      margin: 0
    }, options || {});

    let binary = "";
    let defaultDisplay = value;

    const t = (type || "CODE128").toUpperCase();
    if (t === "EAN13") {
      const res = encodeEAN13(value);
      binary = res.binary;
      defaultDisplay = res.display;
    } else if (t === "EAN8") {
      const res = encodeEAN8(value);
      binary = res.binary;
      defaultDisplay = res.display;
    } else if (t === "CODE39") {
      binary = encodeCode39(value);
      defaultDisplay = (value || "").toUpperCase();
    } else {
      binary = encodeCode128(value);
      defaultDisplay = value;
    }

    // Custom text overrides default display if provided
    const displayText = (options.text !== undefined && options.text !== null && options.text !== "") ? options.text : defaultDisplay;

    const margin = options.margin || 0;
    const totalModules = binary.length;
    const barWidth = options.moduleWidth || 1.2;
    const totalWidth = totalModules * barWidth + (margin * 2);

    const barHeight = Math.max(options.barHeight || 20, 4);
    const textGap = options.textMargin !== undefined ? options.textMargin : 1.5;
    const textHeight = options.showText ? (options.fontSize + textGap) : 0;
    const totalHeight = barHeight + textHeight + (margin * 2);

    // Contiguous black bars starting at y = margin (0)
    let rects = "";
    let i = 0;
    while (i < binary.length) {
      if (binary[i] === "1") {
        let run = 0;
        const startX = margin + (i * barWidth);
        while (i < binary.length && binary[i] === "1") {
          run++;
          i++;
        }
        const w = (run * barWidth).toFixed(2);
        rects += `<rect x="${startX.toFixed(2)}" y="${margin}" width="${w}" height="${barHeight.toFixed(2)}" fill="#000000" shape-rendering="crispEdges"/>`;
      } else {
        i++;
      }
    }

    let textElement = "";
    if (options.showText && displayText) {
      const textY = margin + barHeight + textGap + (options.fontSize * 0.85);
      let textX = totalWidth / 2;
      let anchor = "middle";
      if (options.textAlign === "left") {
        textX = margin;
        anchor = "start";
      } else if (options.textAlign === "right") {
        textX = totalWidth - margin;
        anchor = "end";
      }
      textElement = `<text x="${textX.toFixed(2)}" y="${textY.toFixed(2)}" text-anchor="${anchor}" font-family="${options.fontFamily}" font-size="${options.fontSize}" font-weight="${options.fontWeight || 'bold'}" fill="#000000" letter-spacing="${options.letterSpacing || 1.0}">${escapeXml(displayText)}</text>`;
    }

    const aspect = options.stretch ? 'preserveAspectRatio="none"' : 'preserveAspectRatio="xMidYMid meet"';

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth.toFixed(2)} ${totalHeight.toFixed(2)}" width="100%" height="100%" ${aspect} style="display:block;width:100%;height:100%;overflow:visible;">${rects}${textElement}</svg>`;
  }

  function escapeXml(str) {
    return String(str).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  const Barcode = {
    renderSVG: renderBarcodeSVG,
    encodeCode128,
    encodeEAN13,
    encodeEAN8,
    encodeCode39
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Barcode;
  } else {
    global.BarcodeEngine = Barcode;
  }

})(typeof window !== 'undefined' ? window : global);
