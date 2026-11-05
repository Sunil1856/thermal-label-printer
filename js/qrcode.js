/**
 * ThermalPrint Pro - Pure Vector SVG QR Code Engine
 * Self-contained, zero-dependency QR Code generator (Model 2)
 * Designed for thermal label printers (razor-sharp 1-bit monochrome rendering).
 */

(function (global) {
  'use strict';

  // Galois Field GF(256) tables
  const EXP_TABLE = new Uint8Array(256);
  const LOG_TABLE = new Uint8Array(256);
  (function initGalois() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      EXP_TABLE[i] = x;
      LOG_TABLE[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 256; i++) EXP_TABLE[i] = EXP_TABLE[i - 255];
  })();

  function gfMul(x, y) {
    if (x === 0 || y === 0) return 0;
    return EXP_TABLE[(LOG_TABLE[x] + LOG_TABLE[y]) % 255];
  }

  function getRsGeneratorPoly(ecLen) {
    let poly = [1];
    for (let i = 0; i < ecLen; i++) {
      let next = new Array(poly.length + 1).fill(0);
      for (let j = 0; j < poly.length; j++) {
        next[j] ^= gfMul(poly[j], EXP_TABLE[i]);
        next[j + 1] ^= poly[j];
      }
      poly = next;
    }
    return poly;
  }

  function calcRsRemainder(data, ecLen) {
    const gen = getRsGeneratorPoly(ecLen);
    const result = new Array(ecLen).fill(0);
    for (let i = 0; i < data.length; i++) {
      const factor = data[i] ^ result.shift();
      result.push(0);
      for (let j = 0; j < ecLen; j++) {
        result[j] ^= gfMul(gen[j], factor);
      }
    }
    return result;
  }

  // Version specs: [totalCodewords, ecCodewords, numBlocksGroup1, dataLenGroup1, numBlocksGroup2, dataLenGroup2]
  // Using Low (L) and Medium (M) error correction suitable for thermal price tags
  const VERSION_CAPACITIES_M = [
    null,
    { version: 1, total: 26, ec: 10, b1: 1, d1: 16, b2: 0, d2: 0, size: 21 },
    { version: 2, total: 44, ec: 16, b1: 1, d1: 28, b2: 0, d2: 0, size: 25 },
    { version: 3, total: 70, ec: 26, b1: 1, d1: 44, b2: 0, d2: 0, size: 29 },
    { version: 4, total: 100, ec: 36, b1: 2, d1: 32, b2: 0, d2: 0, size: 33 },
    { version: 5, total: 134, ec: 48, b1: 2, d1: 43, b2: 0, d2: 0, size: 37 },
    { version: 6, total: 172, ec: 64, b1: 4, d1: 27, b2: 0, d2: 0, size: 41 }
  ];

  const ALIGNMENT_PATTERN_POS = [
    [],
    [],
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34]
  ];

  function getBestVersion(dataByteLen) {
    for (let v = 1; v <= 6; v++) {
      const spec = VERSION_CAPACITIES_M[v];
      const maxData = (spec.b1 * spec.d1) + (spec.b2 * spec.d2);
      // Byte mode overhead: 4 bits mode + 8 bits length = 12 bits = ~2 bytes
      if (dataByteLen + 2 <= maxData) {
        return spec;
      }
    }
    return VERSION_CAPACITIES_M[6];
  }

  function encodeData(text, spec) {
    const utf8Bytes = [];
    for (let i = 0; i < text.length; i++) {
      let code = text.charCodeAt(i);
      if (code < 0x80) {
        utf8Bytes.push(code);
      } else if (code < 0x800) {
        utf8Bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
      } else {
        utf8Bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
      }
    }

    const bitBuffer = [];
    function putBits(val, len) {
      for (let i = len - 1; i >= 0; i--) {
        bitBuffer.push((val >> i) & 1);
      }
    }

    // Byte mode indicator: 0100
    putBits(0b0100, 4);
    // Character count indicator (8 bits for version 1-9)
    putBits(utf8Bytes.length, 8);
    // Data bytes
    for (let b of utf8Bytes) {
      putBits(b, 8);
    }

    // Terminator (up to 4 zeroes)
    const totalDataBits = ((spec.b1 * spec.d1) + (spec.b2 * spec.d2)) * 8;
    for (let i = 0; i < 4 && bitBuffer.length < totalDataBits; i++) {
      bitBuffer.push(0);
    }
    // Pad to byte boundary
    while (bitBuffer.length % 8 !== 0) {
      bitBuffer.push(0);
    }

    // Pad bytes: 11101100 (0xEC) and 00010001 (0x11)
    const padBytes = [0xec, 0x11];
    let padIdx = 0;
    while (bitBuffer.length < totalDataBits) {
      putBits(padBytes[padIdx % 2], 8);
      padIdx++;
    }

    // Convert bit buffer to bytes
    const dataBytes = [];
    for (let i = 0; i < bitBuffer.length; i += 8) {
      let byte = 0;
      for (let b = 0; b < 8; b++) {
        byte = (byte << 1) | bitBuffer[i + b];
      }
      dataBytes.push(byte);
    }

    // Generate Error Correction blocks
    const ecPerBlock = Math.floor(spec.ec / (spec.b1 + (spec.b2 || 0)));
    const blocksData = [];
    const blocksEc = [];

    let byteOffset = 0;
    for (let b = 0; b < spec.b1; b++) {
      const bData = dataBytes.slice(byteOffset, byteOffset + spec.d1);
      byteOffset += spec.d1;
      blocksData.push(bData);
      blocksEc.push(calcRsRemainder(bData, ecPerBlock));
    }

    // Interleave data codewords
    const finalCodewords = [];
    const maxDataLen = Math.max(spec.d1, spec.d2 || 0);
    for (let i = 0; i < maxDataLen; i++) {
      for (let b = 0; b < blocksData.length; b++) {
        if (i < blocksData[b].length) {
          finalCodewords.push(blocksData[b][i]);
        }
      }
    }
    // Interleave EC codewords
    for (let i = 0; i < ecPerBlock; i++) {
      for (let b = 0; b < blocksEc.length; b++) {
        finalCodewords.push(blocksEc[b][i]);
      }
    }

    return finalCodewords;
  }

  function createMatrix(size) {
    const m = [];
    for (let r = 0; r < size; r++) {
      m.push(new Array(size).fill(null));
    }
    return m;
  }

  function placeFinder(matrix, r0, c0) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const row = r0 + r;
        const col = c0 + c;
        if (row < 0 || row >= matrix.length || col < 0 || col >= matrix.length) continue;
        if ((r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
            (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          matrix[row][col] = 1;
        } else {
          matrix[row][col] = 0;
        }
      }
    }
  }

  function placeTiming(matrix) {
    const size = matrix.length;
    for (let i = 8; i < size - 8; i++) {
      const bit = (i % 2 === 0) ? 1 : 0;
      if (matrix[6][i] === null) matrix[6][i] = bit;
      if (matrix[i][6] === null) matrix[i][6] = bit;
    }
  }

  function placeAlignment(matrix, version) {
    const pos = ALIGNMENT_PATTERN_POS[version] || [];
    for (let r of pos) {
      for (let c of pos) {
        if (matrix[r][c] !== null) continue; // Skip finders
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isBorder = Math.abs(dr) === 2 || Math.abs(dc) === 2;
            const isCenter = dr === 0 && dc === 0;
            matrix[r + dr][c + dc] = (isBorder || isCenter) ? 1 : 0;
          }
        }
      }
    }
  }

  function reserveFormatInfo(matrix) {
    const size = matrix.length;
    for (let i = 0; i <= 8; i++) {
      if (matrix[8][i] === null) matrix[8][i] = 0;
      if (matrix[i][8] === null) matrix[i][8] = 0;
    }
    for (let i = size - 8; i < size; i++) {
      if (matrix[8][i] === null) matrix[8][i] = 0;
      if (matrix[i][8] === null) matrix[i][8] = 0;
    }
    matrix[size - 8][8] = 1; // dark module
  }

  function placeDataCodewords(matrix, codewords) {
    const size = matrix.length;
    const bits = [];
    for (let cw of codewords) {
      for (let b = 7; b >= 0; b--) {
        bits.push((cw >> b) & 1);
      }
    }

    let bitIdx = 0;
    let upward = true;
    for (let right = size - 1; right > 0; right -= 2) {
      if (right === 6) right--; // Skip vertical timing column
      const cols = [right, right - 1];
      const rowRange = upward ? [size - 1, -1, -1] : [0, size, 1];

      for (let r = rowRange[0]; r !== rowRange[1]; r += rowRange[2]) {
        for (let c of cols) {
          if (matrix[r][c] === null) {
            let bit = (bitIdx < bits.length) ? bits[bitIdx++] : 0;
            // Mask pattern 0: (row + col) % 2 === 0
            const mask = ((r + c) % 2 === 0);
            matrix[r][c] = mask ? (bit ^ 1) : bit;
          }
        }
      }
      upward = !upward;
    }
  }

  // Format info for Medium (M) error correction and Mask 0: 0b101010000010010
  const FORMAT_M_MASK0 = [1,0,1,0,1,0,0,0,0,0,1,0,0,1,0];

  function placeFormatInfo(matrix) {
    const size = matrix.length;
    const bits = FORMAT_M_MASK0;

    // Around top-left finder
    matrix[8][0] = bits[0];
    matrix[8][1] = bits[1];
    matrix[8][2] = bits[2];
    matrix[8][3] = bits[3];
    matrix[8][4] = bits[4];
    matrix[8][5] = bits[5];
    matrix[8][7] = bits[6];
    matrix[8][8] = bits[7];
    matrix[7][8] = bits[8];
    matrix[5][8] = bits[9];
    matrix[4][8] = bits[10];
    matrix[3][8] = bits[11];
    matrix[2][8] = bits[12];
    matrix[1][8] = bits[13];
    matrix[0][8] = bits[14];

    // Split across bottom-left and top-right
    for (let i = 0; i < 7; i++) {
      matrix[size - 1 - i][8] = bits[i];
    }
    for (let i = 0; i < 8; i++) {
      matrix[8][size - 8 + i] = bits[7 + i];
    }
  }

  function renderQRCodeSVG(text, options) {
    options = Object.assign({
      size: 100,
      margin: 2
    }, options || {});

    const cleanText = String(text || "123456");
    const spec = getBestVersion(cleanText.length);
    const matrix = createMatrix(spec.size);

    placeFinder(matrix, 0, 0);
    placeFinder(matrix, 0, spec.size - 7);
    placeFinder(matrix, spec.size - 7, 0);
    placeTiming(matrix);
    placeAlignment(matrix, spec.version);
    reserveFormatInfo(matrix);

    const codewords = encodeData(cleanText, spec);
    placeDataCodewords(matrix, codewords);
    placeFormatInfo(matrix);

    // Build SVG
    const moduleCount = spec.size;
    const margin = options.margin;
    const totalDim = moduleCount + (margin * 2);

    let pathD = "";
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (matrix[r][c] === 1) {
          pathD += `M${c + margin},${r + margin}h1v1h-1z `;
        }
      }
    }

    const svgSize = options.size;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalDim} ${totalDim}" width="${svgSize}px" height="${svgSize}px" style="display:block;margin:auto;"><path d="${pathD.trim()}" fill="#000000" shape-rendering="crispEdges"/></svg>`;
  }

  const QRCode = {
    renderSVG: renderQRCodeSVG
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = QRCode;
  } else {
    global.QRCodeEngine = QRCode;
  }

})(typeof window !== 'undefined' ? window : global);
