/**
 * ThermalPrint Pro - CAD Visual Engine (100% WYSIWYG Precision & Full Barcode Text Control)
 */

(function (global) {
  'use strict';

  const MM_TO_PX = 3.7795275591; // 1 mm in standard CSS pixels at 96 DPI

  class CadStudio {
    constructor(containerEl, propertyPanelEl) {
      this.container = containerEl;
      this.propertyPanel = propertyPanelEl;

      this.canvas = {
        width: 91, // 55mm head + 36mm tail (+10mm gray tone edge)
        height: 12,
        isDumbbell: true,
        printableWidth: 55,
        tailWidth: 36,
        tailHeight: 3.5,
        printOffsetX: 0.0,
        printOffsetY: 0.0
      };

      this.zoom = 3.5;
      this.snapGrid = 0.5;
      this.elements = [];
      this.selectedId = null;

      this.undoStack = [];
      this.redoStack = [];
      this.dragState = null;

      this.topRulerEl = document.getElementById("ruler-top");
      this.leftRulerEl = document.getElementById("ruler-left");
      this.cursorXEl = document.getElementById("ruler-cursor-x");
      this.cursorYEl = document.getElementById("ruler-cursor-y");

      this.initEvents();
    }

    pushHistory() {
      const snapshot = JSON.stringify({
        canvas: this.canvas,
        elements: this.elements
      });
      this.undoStack.push(snapshot);
      if (this.undoStack.length > 40) this.undoStack.shift();
      this.redoStack = [];
    }

    undo() {
      if (this.undoStack.length === 0) return;
      const current = JSON.stringify({ canvas: this.canvas, elements: this.elements });
      this.redoStack.push(current);
      const prev = JSON.parse(this.undoStack.pop());
      this.canvas = prev.canvas;
      this.elements = prev.elements;
      this.selectedId = null;
      this.render();
      this.updatePropertyInspector();
    }

    redo() {
      if (this.redoStack.length === 0) return;
      const current = JSON.stringify({ canvas: this.canvas, elements: this.elements });
      this.undoStack.push(current);
      const next = JSON.parse(this.redoStack.pop());
      this.canvas = next.canvas;
      this.elements = next.elements;
      this.selectedId = null;
      this.render();
      this.updatePropertyInspector();
    }

    loadTemplate(tmpl) {
      this.pushHistory();
      this.canvas = JSON.parse(JSON.stringify(tmpl.canvas));
      this.elements = JSON.parse(JSON.stringify(tmpl.elements));
      // Ensure all barcode elements have full text properties
      this.elements.forEach(elem => {
        if (elem.type === "barcode") {
          if (!elem.barcodeText) elem.barcodeText = elem.codeValue;
          if (elem.barHeight === undefined) elem.barHeight = 6.5;
          if (elem.textGap === undefined) elem.textGap = 1.0;
          if (elem.moduleWidth === undefined) elem.moduleWidth = 1.2;
          if (elem.stretch === undefined) elem.stretch = true;
          if (!elem.textAlign) elem.textAlign = "center";
          if (!elem.fontWeight) elem.fontWeight = "bold";
        }
      });
      this.selectedId = null;
      this.render();
      this.updatePropertyInspector();
    }

    addElement(type, props) {
      this.pushHistory();
      const id = "elem_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
      let newElem = {
        id,
        type,
        x: 4.0,
        y: 2.0,
        w: 24.0,
        h: 4.0,
        rotation: 0
      };

      if (type === "text") {
        newElem = Object.assign(newElem, {
          content: "Text Block",
          fontSize: 8.5,
          fontWeight: "bold",
          fontFamily: "Arial",
          textAlign: "left",
          verticalAlign: "middle",
          textDecoration: "none"
        }, props || {});
      } else if (type === "barcode") {
        newElem = Object.assign(newElem, {
          w: 25.0,
          h: 9.5,
          codeType: "CODE128",
          codeValue: "SB-02581",
          barcodeText: "SB-02581", // Full editable human-readable text
          showText: true,
          fontSize: 7.5,
          barHeight: 6.5,
          textGap: 1.0,
          moduleWidth: 1.2,
          stretch: true,
          textAlign: "center",
          fontWeight: "bold",
          fontFamily: "'Courier New', Courier, monospace"
        }, props || {});
      } else if (type === "qrcode") {
        newElem = Object.assign(newElem, {
          w: 8.0,
          h: 8.0,
          codeValue: "https://specsbuddy.in"
        }, props || {});
      } else if (type === "line") {
        newElem = Object.assign(newElem, {
          w: 25.0,
          h: 0.5,
          lineStyle: "solid",
          thickness: 0.3
        }, props || {});
      } else if (type === "rect") {
        newElem = Object.assign(newElem, {
          w: 20.0,
          h: 8.0,
          lineStyle: "solid",
          thickness: 0.3,
          fill: false
        }, props || {});
      }

      this.elements.push(newElem);
      this.selectedId = id;
      this.render();
      this.updatePropertyInspector();
      return newElem;
    }

    deleteSelected() {
      if (!this.selectedId) return;
      this.pushHistory();
      this.elements = this.elements.filter(e => e.id !== this.selectedId);
      this.selectedId = null;
      this.render();
      this.updatePropertyInspector();
    }

    duplicateSelected() {
      if (!this.selectedId) return;
      const target = this.elements.find(e => e.id === this.selectedId);
      if (!target) return;
      this.pushHistory();
      const dup = JSON.parse(JSON.stringify(target));
      dup.id = "elem_" + Date.now();
      dup.x += 2.0;
      dup.y += 2.0;
      this.elements.push(dup);
      this.selectedId = dup.id;
      this.render();
      this.updatePropertyInspector();
    }

    bringToFront() {
      if (!this.selectedId) return;
      const idx = this.elements.findIndex(e => e.id === this.selectedId);
      if (idx === -1 || idx === this.elements.length - 1) return;
      this.pushHistory();
      const elem = this.elements.splice(idx, 1)[0];
      this.elements.push(elem);
      this.render();
    }

    sendToBack() {
      if (!this.selectedId) return;
      const idx = this.elements.findIndex(e => e.id === this.selectedId);
      if (idx <= 0) return;
      this.pushHistory();
      const elem = this.elements.splice(idx, 1)[0];
      this.elements.unshift(elem);
      this.render();
    }

    mmToCanvasPx(mm) {
      return mm * MM_TO_PX * this.zoom;
    }

    canvasPxToMm(px) {
      return px / (MM_TO_PX * this.zoom);
    }

    snapVal(val) {
      if (this.snapGrid <= 0) return Math.round(val * 10) / 10;
      return Math.round(val / this.snapGrid) * this.snapGrid;
    }

    render() {
      this.renderRulers();

      const stage = document.getElementById("cad-printable-stage");
      if (!stage) return;

      const headW_px = this.mmToCanvasPx(this.canvas.printableWidth);
      const headH_px = this.mmToCanvasPx(this.canvas.height);
      const tailW_px = this.mmToCanvasPx(this.canvas.tailWidth);
      const tailH_px = Math.max(this.mmToCanvasPx(this.canvas.tailHeight), 12);

      stage.style.width = `${headW_px.toFixed(1)}px`;
      stage.style.height = `${headH_px.toFixed(1)}px`;

      const tailEl = document.getElementById("cad-tail-stage");
      if (tailEl) {
        if (this.canvas.isDumbbell && this.canvas.tailWidth > 0) {
          tailEl.style.display = "block";
          tailEl.style.width = `${tailW_px.toFixed(1)}px`;
          tailEl.style.height = `${tailH_px.toFixed(1)}px`;
        } else {
          tailEl.style.display = "none";
        }
      }

      stage.innerHTML = "";
      this.elements.forEach(elem => {
        const dom = this.createDomElement(elem, this.zoom);
        stage.appendChild(dom);
      });
    }

    // --- SHARED ELEMENT RENDERER (IDENTICAL FOR SCREEN & PRINT) ---
    createDomElement(elem, zoomFactor) {
      const zoom = zoomFactor || this.zoom;
      const isSelected = (elem.id === this.selectedId && zoomFactor === this.zoom);
      const div = document.createElement("div");
      div.className = `cad-element ${isSelected ? 'selected' : ''}`;
      div.setAttribute("data-id", elem.id);

      const leftPx = elem.x * MM_TO_PX * zoom;
      const topPx = elem.y * MM_TO_PX * zoom;
      const wPx = elem.w * MM_TO_PX * zoom;
      const hPx = elem.h * MM_TO_PX * zoom;

      div.style.left = `${leftPx.toFixed(2)}px`;
      div.style.top = `${topPx.toFixed(2)}px`;
      div.style.width = `${wPx.toFixed(2)}px`;
      div.style.height = `${hPx.toFixed(2)}px`;
      div.style.transform = `rotate(${elem.rotation || 0}deg)`;

      let contentHtml = "";

      if (elem.type === "text") {
        const fontPtScaled = elem.fontSize * (zoom / 1.0);
        const vAlign = elem.verticalAlign || "middle";
        const justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end' };
        const alignMap = { top: 'flex-start', middle: 'center', bottom: 'flex-end' };

        contentHtml = `
          <div class="cad-text-content" style="
            font-size: ${fontPtScaled.toFixed(2)}pt;
            font-weight: ${elem.fontWeight || 'normal'};
            font-family: ${elem.fontFamily || 'Arial'};
            text-align: ${elem.textAlign || 'left'};
            text-decoration: ${elem.textDecoration || 'none'};
            width: 100%;
            height: 100%;
            line-height: 1.15;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: flex;
            align-items: ${alignMap[vAlign] || 'center'};
            justify-content: ${justifyMap[elem.textAlign || 'left'] || 'flex-start'};
            box-sizing: border-box;
          ">
            ${escapeHtml(elem.content)}
          </div>
        `;
      } else if (elem.type === "barcode") {
        try {
          // Exact mathematical scaling: barHeight in px scales precisely with zoom
          const rawBarHeightMm = elem.barHeight || (elem.h * 0.65);
          const barHeightScaled = rawBarHeightMm * MM_TO_PX * zoom;
          const textGapScaled = ((elem.textGap !== undefined ? elem.textGap : 1.0) * MM_TO_PX * zoom);
          const fontSizeScaled = (elem.fontSize || 7.5) * (zoom / 1.0);

          const svgStr = BarcodeEngine.renderSVG(elem.codeType || "CODE128", elem.codeValue || "123", {
            barHeight: barHeightScaled,
            moduleWidth: (elem.moduleWidth || 1.2) * zoom,
            showText: elem.showText,
            text: elem.barcodeText !== undefined ? elem.barcodeText : elem.codeValue,
            fontSize: fontSizeScaled,
            fontFamily: elem.fontFamily || "'Courier New', Courier, monospace",
            fontWeight: elem.fontWeight || 'bold',
            textMargin: textGapScaled,
            textAlign: elem.textAlign || "center",
            stretch: elem.stretch !== false,
            margin: 0
          });
          contentHtml = `<div class="cad-barcode-content" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:visible;">${svgStr}</div>`;
        } catch (err) {
          contentHtml = `<div style="font-size:7pt;color:red;">Barcode Error</div>`;
        }
      } else if (elem.type === "qrcode") {
        try {
          const qrSvg = QRCodeEngine.renderSVG(elem.codeValue || "https://example.com", {
            size: Math.min(wPx, hPx),
            margin: 0
          });
          contentHtml = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">${qrSvg}</div>`;
        } catch (err) {
          contentHtml = `<div style="font-size:7pt;color:red;">QR Error</div>`;
        }
      } else if (elem.type === "line") {
        const borderStyle = elem.lineStyle === "dashed" ? "dashed" : "solid";
        contentHtml = `<div style="width:100%;height:0;border-top:${Math.max(elem.thickness * zoom, 1)}px ${borderStyle} #000;margin-top:${(hPx/2).toFixed(1)}px;"></div>`;
      } else if (elem.type === "rect") {
        const borderStyle = elem.lineStyle === "dashed" ? "dashed" : "solid";
        contentHtml = `<div style="width:100%;height:100%;border:${Math.max(elem.thickness * zoom, 1)}px ${borderStyle} #000;background:${elem.fill ? '#000' : 'transparent'};box-sizing:border-box;"></div>`;
      }

      let handlesHtml = "";
      if (isSelected) {
        handlesHtml = `
          <div class="cad-handle nw" data-handle="nw"></div>
          <div class="cad-handle n" data-handle="n"></div>
          <div class="cad-handle ne" data-handle="ne"></div>
          <div class="cad-handle e" data-handle="e"></div>
          <div class="cad-handle se" data-handle="se"></div>
          <div class="cad-handle s" data-handle="s"></div>
          <div class="cad-handle sw" data-handle="sw"></div>
          <div class="cad-handle w" data-handle="w"></div>
          <div class="cad-dimension-badge">${elem.w.toFixed(1)} × ${elem.h.toFixed(1)} mm</div>
        `;
      }

      div.innerHTML = contentHtml + handlesHtml;
      return div;
    }

    renderRulers() {
      if (!this.topRulerEl || !this.leftRulerEl) return;

      const totalW_mm = this.canvas.width;
      const totalH_mm = this.canvas.height;

      let topHtml = "";
      for (let mm = 0; mm <= totalW_mm; mm++) {
        const xPx = this.mmToCanvasPx(mm);
        const is10 = (mm % 10 === 0);
        const is5 = (mm % 5 === 0);
        const tickHeight = is10 ? 12 : (is5 ? 8 : 4);

        topHtml += `<div class="ruler-tick-top" style="left:${xPx.toFixed(1)}px;height:${tickHeight}px;"></div>`;
        if (is10 || (mm === 5 && totalW_mm <= 20)) {
          topHtml += `<div class="ruler-num-top" style="left:${(xPx + 2).toFixed(1)}px;">${mm}</div>`;
        }
      }
      this.topRulerEl.innerHTML = topHtml;

      let leftHtml = "";
      for (let mm = 0; mm <= totalH_mm; mm++) {
        const yPx = this.mmToCanvasPx(mm);
        const is10 = (mm % 10 === 0);
        const is5 = (mm % 5 === 0);
        const tickWidth = is10 ? 12 : (is5 ? 8 : 4);

        leftHtml += `<div class="ruler-tick-left" style="top:${yPx.toFixed(1)}px;width:${tickWidth}px;"></div>`;
        if (is5 || is10) {
          leftHtml += `<div class="ruler-num-left" style="top:${(yPx - 6).toFixed(1)}px;">${mm}</div>`;
        }
      }
      this.leftRulerEl.innerHTML = leftHtml;
    }

    initEvents() {
      const stage = document.getElementById("cad-printable-stage");
      const wrapper = document.getElementById("cad-canvas-wrapper");
      if (!wrapper) return;

      wrapper.addEventListener("mousemove", (e) => {
        if (!stage) return;
        const rect = stage.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (this.cursorXEl) {
          this.cursorXEl.style.left = `${(e.clientX - wrapper.getBoundingClientRect().left).toFixed(1)}px`;
        }
        if (this.cursorYEl) {
          this.cursorYEl.style.top = `${(e.clientY - wrapper.getBoundingClientRect().top).toFixed(1)}px`;
        }

        const mmX = this.canvasPxToMm(mouseX);
        const mmY = this.canvasPxToMm(mouseY);
        const coordsBadge = document.getElementById("cad-coords-badge");
        if (coordsBadge) {
          coordsBadge.textContent = `X: ${Math.max(0, mmX).toFixed(1)} mm | Y: ${Math.max(0, mmY).toFixed(1)} mm`;
        }
      });

      window.addEventListener("pointerdown", (e) => {
        const handleEl = e.target.closest(".cad-handle");
        const elemDiv = e.target.closest(".cad-element");

        if (handleEl && this.selectedId) {
          const handleType = handleEl.getAttribute("data-handle");
          const elem = this.elements.find(el => el.id === this.selectedId);
          if (elem) {
            this.pushHistory();
            this.dragState = {
              action: "resize",
              handle: handleType,
              startX: e.clientX,
              startY: e.clientY,
              initElem: Object.assign({}, elem)
            };
            e.preventDefault();
            return;
          }
        }

        if (elemDiv) {
          const id = elemDiv.getAttribute("data-id");
          this.selectedId = id;
          const elem = this.elements.find(el => el.id === id);
          if (elem) {
            this.pushHistory();
            this.dragState = {
              action: "move",
              startX: e.clientX,
              startY: e.clientY,
              initElem: Object.assign({}, elem)
            };
          }
          this.render();
          this.updatePropertyInspector();
          e.stopPropagation();
          return;
        }

        if (e.target.closest("#cad-canvas-wrapper") && !e.target.closest("#inspector-panel") && !e.target.closest(".cad-ribbon")) {
          this.selectedId = null;
          this.render();
          this.updatePropertyInspector();
        }
      });

      window.addEventListener("pointermove", (e) => {
        if (!this.dragState) return;

        const dxPx = e.clientX - this.dragState.startX;
        const dyPx = e.clientY - this.dragState.startY;
        const dxMm = this.canvasPxToMm(dxPx);
        const dyMm = this.canvasPxToMm(dyPx);

        const elem = this.elements.find(el => el.id === this.selectedId);
        if (!elem) return;

        if (this.dragState.action === "move") {
          let newX = this.dragState.initElem.x + dxMm;
          let newY = this.dragState.initElem.y + dyMm;
          elem.x = this.snapVal(newX);
          elem.y = this.snapVal(newY);
        } else if (this.dragState.action === "resize") {
          const h = this.dragState.handle;
          const init = this.dragState.initElem;

          if (h.includes("e")) elem.w = this.snapVal(Math.max(3.0, init.w + dxMm));
          if (h.includes("s")) elem.h = this.snapVal(Math.max(1.5, init.h + dyMm));
          if (h.includes("w")) {
            const rawW = init.w - dxMm;
            if (rawW > 3.0) {
              elem.w = this.snapVal(rawW);
              elem.x = this.snapVal(init.x + dxMm);
            }
          }
          if (h.includes("n")) {
            const rawH = init.h - dyMm;
            if (rawH > 1.5) {
              elem.h = this.snapVal(rawH);
              elem.y = this.snapVal(init.y + dyMm);
            }
          }
        }

        this.render();
        this.updatePropertyInspector(true);
      });

      window.addEventListener("pointerup", () => {
        if (this.dragState) {
          this.dragState = null;
          this.render();
          this.updatePropertyInspector();
        }
      });

      window.addEventListener("keydown", (e) => {
        if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA") return;

        if (e.key === "Delete" || e.key === "Backspace") {
          this.deleteSelected();
          e.preventDefault();
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
          if (e.shiftKey) this.redo(); else this.undo();
          e.preventDefault();
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
          this.redo();
          e.preventDefault();
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
          this.duplicateSelected();
          e.preventDefault();
        } else if (this.selectedId && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
          const elem = this.elements.find(el => el.id === this.selectedId);
          if (!elem) return;
          const step = e.shiftKey ? 1.0 : 0.2;
          if (e.key === "ArrowLeft") elem.x -= step;
          if (e.key === "ArrowRight") elem.x += step;
          if (e.key === "ArrowUp") elem.y -= step;
          if (e.key === "ArrowDown") elem.y += step;
          this.render();
          this.updatePropertyInspector();
          e.preventDefault();
        }
      });
    }

    updatePropertyInspector(fastUpdateOnly) {
      const panel = this.propertyPanel;
      if (!panel) return;

      const elem = this.elements.find(el => el.id === this.selectedId);

      if (!elem) {
        // Tag / Canvas Properties
        panel.innerHTML = `
          <div class="inspector-card">
            <h4 class="inspector-title">📐 Tag & Canvas Properties</h4>
            <div class="form-group">
              <label>Preset Label Templates</label>
              <select id="insp-preset-template" class="cad-input"></select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Total Width (mm)</label>
                <input type="number" id="insp-canvas-w" class="cad-input" value="${this.canvas.width}" step="1">
              </div>
              <div class="form-group">
                <label>Height (mm)</label>
                <input type="number" id="insp-canvas-h" class="cad-input" value="${this.canvas.height}" step="1">
              </div>
            </div>
            <div class="form-group">
              <label class="cad-checkbox-label">
                <input type="checkbox" id="insp-is-dumbbell" ${this.canvas.isDumbbell ? 'checked' : ''}>
                <span>Optical Dumbbell Tag (with Rat-Tail)</span>
              </label>
            </div>
            <div id="insp-dumbbell-section" style="display:${this.canvas.isDumbbell ? 'block' : 'none'};background:#0f172a;padding:10px;border-radius:6px;margin-bottom:12px;border:1px solid #334155;">
              <div class="form-row">
                <div class="form-group">
                  <label>Head Width (mm)</label>
                  <input type="number" id="insp-printable-w" class="cad-input" value="${this.canvas.printableWidth}" step="1">
                </div>
                <div class="form-group">
                  <label>Gray Tail Width (mm)</label>
                  <input type="number" id="insp-tail-w" class="cad-input" value="${this.canvas.tailWidth}" step="1">
                </div>
              </div>
              <div style="display:flex;gap:6px;margin-top:6px;">
                <button type="button" class="ribbon-btn" id="btn-tail-add-10" style="flex:1;font-size:0.75rem;padding:4px 6px;">+ 10mm Tail</button>
                <button type="button" class="ribbon-btn" id="btn-tail-sub-10" style="flex:1;font-size:0.75rem;padding:4px 6px;">- 10mm Tail</button>
              </div>
            </div>

            <!-- Hardware Print Calibration Offset -->
            <div class="inspector-subtitle">🖨️ Hardware Print Offsets (Calibration)</div>
            <div style="background:#0f172a;padding:10px;border-radius:6px;border:1px solid #334155;margin-bottom:12px;">
              <p style="font-size:0.72rem;color:#94a3b8;margin-bottom:8px;">
                If your physical thermal printer prints slightly shifted, dial the offset here to align perfectly:
              </p>
              <div class="form-row">
                <div class="form-group">
                  <label>X Offset (mm)</label>
                  <input type="number" id="insp-offset-x" class="cad-input" value="${this.canvas.printOffsetX || 0.0}" step="0.5">
                </div>
                <div class="form-group">
                  <label>Y Offset (mm)</label>
                  <input type="number" id="insp-offset-y" class="cad-input" value="${this.canvas.printOffsetY || 0.0}" step="0.5">
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Snap to Grid (mm)</label>
              <select id="insp-grid-snap" class="cad-input">
                <option value="0.5" ${this.snapGrid === 0.5 ? 'selected' : ''}>0.5 mm (Fine CAD Snap)</option>
                <option value="1.0" ${this.snapGrid === 1.0 ? 'selected' : ''}>1.0 mm (Standard Snap)</option>
                <option value="0" ${this.snapGrid === 0 ? 'selected' : ''}>Off (Free Float)</option>
              </select>
            </div>
          </div>
        `;

        const presetSelect = document.getElementById("insp-preset-template");
        if (presetSelect) {
          presetSelect.innerHTML = `<option value="">-- Choose Template --</option>`;
          const safeTmpls = (typeof window !== 'undefined' && window.CAD_PRESET_TEMPLATES) || (typeof globalThis !== 'undefined' && globalThis.CAD_PRESET_TEMPLATES) || {};
          for (let k in safeTmpls) {
            const t = safeTmpls[k];
            presetSelect.innerHTML += `<option value="${k}">${t.name}</option>`;
          }
          presetSelect.addEventListener("change", (e) => {
            if (e.target.value && safeTmpls[e.target.value]) {
              this.loadTemplate(safeTmpls[e.target.value]);
            }
          });
        }

        document.getElementById("insp-canvas-w")?.addEventListener("change", (e) => {
          this.canvas.width = parseFloat(e.target.value) || 91;
          this.render();
        });
        document.getElementById("insp-canvas-h")?.addEventListener("change", (e) => {
          this.canvas.height = parseFloat(e.target.value) || 12;
          this.render();
        });
        document.getElementById("insp-is-dumbbell")?.addEventListener("change", (e) => {
          this.canvas.isDumbbell = e.target.checked;
          document.getElementById("insp-dumbbell-section").style.display = e.target.checked ? "block" : "none";
          this.render();
        });
        document.getElementById("insp-printable-w")?.addEventListener("change", (e) => {
          this.canvas.printableWidth = parseFloat(e.target.value) || 55;
          this.render();
        });
        document.getElementById("insp-tail-w")?.addEventListener("change", (e) => {
          this.canvas.tailWidth = parseFloat(e.target.value) || 36;
          this.canvas.width = this.canvas.printableWidth + this.canvas.tailWidth;
          document.getElementById("insp-canvas-w").value = this.canvas.width;
          this.render();
        });

        document.getElementById("btn-tail-add-10")?.addEventListener("click", () => {
          this.canvas.tailWidth = (this.canvas.tailWidth || 36) + 10;
          this.canvas.width = this.canvas.printableWidth + this.canvas.tailWidth;
          this.render();
          this.updatePropertyInspector();
        });
        document.getElementById("btn-tail-sub-10")?.addEventListener("click", () => {
          if (this.canvas.tailWidth > 10) {
            this.canvas.tailWidth -= 10;
            this.canvas.width = this.canvas.printableWidth + this.canvas.tailWidth;
            this.render();
            this.updatePropertyInspector();
          }
        });

        document.getElementById("insp-offset-x")?.addEventListener("change", (e) => {
          this.canvas.printOffsetX = parseFloat(e.target.value) || 0.0;
        });
        document.getElementById("insp-offset-y")?.addEventListener("change", (e) => {
          this.canvas.printOffsetY = parseFloat(e.target.value) || 0.0;
        });
        document.getElementById("insp-grid-snap")?.addEventListener("change", (e) => {
          this.snapGrid = parseFloat(e.target.value);
        });
        return;
      }

      if (fastUpdateOnly) {
        const inpX = document.getElementById("elem-x");
        const inpY = document.getElementById("elem-y");
        const inpW = document.getElementById("elem-w");
        const inpH = document.getElementById("elem-h");
        if (inpX) inpX.value = elem.x.toFixed(1);
        if (inpY) inpY.value = elem.y.toFixed(1);
        if (inpW) inpW.value = elem.w.toFixed(1);
        if (inpH) inpH.value = elem.h.toFixed(1);
        return;
      }

      let specificFields = "";
      if (elem.type === "text") {
        specificFields = `
          <div class="form-group">
            <label>Text Content</label>
            <textarea id="elem-content" class="cad-input" rows="2">${escapeHtml(elem.content)}</textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Font Size (pt)</label>
              <input type="number" id="elem-font-size" class="cad-input" value="${elem.fontSize}" step="0.5">
            </div>
            <div class="form-group">
              <label>Font Weight</label>
              <select id="elem-font-weight" class="cad-input">
                <option value="bold" ${elem.fontWeight === 'bold' ? 'selected' : ''}>Bold</option>
                <option value="normal" ${elem.fontWeight === 'normal' ? 'selected' : ''}>Regular</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Font Family</label>
              <select id="elem-font-family" class="cad-input">
                <option value="Arial" ${elem.fontFamily === 'Arial' ? 'selected' : ''}>Arial</option>
                <option value="'Courier New', monospace" ${elem.fontFamily?.includes('Courier') ? 'selected' : ''}>Monospace</option>
                <option value="Impact" ${elem.fontFamily === 'Impact' ? 'selected' : ''}>Impact</option>
                <option value="'Times New Roman', serif" ${elem.fontFamily?.includes('Times') ? 'selected' : ''}>Serif</option>
              </select>
            </div>
            <div class="form-group">
              <label>Alignment</label>
              <select id="elem-text-align" class="cad-input">
                <option value="left" ${elem.textAlign === 'left' ? 'selected' : ''}>Left</option>
                <option value="center" ${elem.textAlign === 'center' ? 'selected' : ''}>Center</option>
                <option value="right" ${elem.textAlign === 'right' ? 'selected' : ''}>Right</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Vertical Align</label>
            <select id="elem-vertical-align" class="cad-input">
              <option value="middle" ${(elem.verticalAlign || 'middle') === 'middle' ? 'selected' : ''}>Middle</option>
              <option value="top" ${elem.verticalAlign === 'top' ? 'selected' : ''}>Top</option>
              <option value="bottom" ${elem.verticalAlign === 'bottom' ? 'selected' : ''}>Bottom</option>
            </select>
          </div>
        `;
      } else if (elem.type === "barcode") {
        specificFields = `
          <div class="form-group">
            <label>Barcode Value (Encoded in Scanner)</label>
            <input type="text" id="elem-code-val" class="cad-input" value="${escapeHtml(elem.codeValue)}">
          </div>

          <div class="inspector-subtitle" style="color:#10b981;">🔤 Text Under Barcode (Full Control)</div>
          <div style="background:#0f172a;padding:10px;border-radius:6px;border:1px solid #334155;margin-bottom:12px;">
            <div class="form-group">
              <label>Human-Readable Text (Printed Below)</label>
              <input type="text" id="elem-barcode-text" class="cad-input" value="${escapeHtml(elem.barcodeText !== undefined ? elem.barcodeText : elem.codeValue)}" placeholder="Type custom text to show">
            </div>

            <div class="form-group">
              <label class="cad-checkbox-label">
                <input type="checkbox" id="elem-show-text" ${elem.showText ? 'checked' : ''}>
                <span>Show Text Below Barcode</span>
              </label>
            </div>

            <div id="barcode-text-details" style="display:${elem.showText ? 'block' : 'none'};">
              <div class="form-row">
                <div class="form-group">
                  <label>Text Size (pt)</label>
                  <input type="number" id="elem-barcode-font-size" class="cad-input" value="${elem.fontSize || 7.5}" step="0.5" min="4" max="14">
                </div>
                <div class="form-group">
                  <label>Spacing from Bars (mm)</label>
                  <input type="number" id="elem-barcode-text-gap" class="cad-input" value="${elem.textGap !== undefined ? elem.textGap : 1.0}" step="0.5" min="0" max="5">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Font Family</label>
                  <select id="elem-barcode-font-family" class="cad-input">
                    <option value="'Courier New', Courier, monospace" ${elem.fontFamily?.includes('Courier') ? 'selected' : ''}>Monospace</option>
                    <option value="Arial, sans-serif" ${elem.fontFamily?.includes('Arial') ? 'selected' : ''}>Arial</option>
                    <option value="Impact" ${elem.fontFamily === 'Impact' ? 'selected' : ''}>Impact</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Font Weight</label>
                  <select id="elem-barcode-font-weight" class="cad-input">
                    <option value="bold" ${elem.fontWeight === 'bold' ? 'selected' : ''}>Bold</option>
                    <option value="normal" ${elem.fontWeight === 'normal' ? 'selected' : ''}>Regular</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>Text Alignment</label>
                <select id="elem-barcode-text-align" class="cad-input">
                  <option value="center" ${(elem.textAlign || 'center') === 'center' ? 'selected' : ''}>Center</option>
                  <option value="left" ${elem.textAlign === 'left' ? 'selected' : ''}>Left</option>
                  <option value="right" ${elem.textAlign === 'right' ? 'selected' : ''}>Right</option>
                </select>
              </div>
            </div>
          </div>

          <div class="inspector-subtitle" style="color:#38bdf8;">📊 Bar Sizing & Density</div>
          <div class="form-row">
            <div class="form-group">
              <label>Bar Height (mm)</label>
              <input type="number" id="elem-bar-height" class="cad-input" value="${elem.barHeight || 6.5}" step="0.5" min="2" max="25">
            </div>
            <div class="form-group">
              <label>Bar Thickness (Density)</label>
              <input type="number" id="elem-module-width" class="cad-input" value="${elem.moduleWidth || 1.2}" step="0.1" min="0.8" max="2.5">
            </div>
          </div>
          <div class="form-group">
            <label class="cad-checkbox-label">
              <input type="checkbox" id="elem-stretch" ${elem.stretch !== false ? 'checked' : ''}>
              <span>Fit / Stretch Barcode to Box Width</span>
            </label>
          </div>
        `;
      } else if (elem.type === "qrcode") {
        specificFields = `
          <div class="form-group">
            <label>QR Code Content (URL / Text)</label>
            <input type="text" id="elem-qr-val" class="cad-input" value="${escapeHtml(elem.codeValue)}">
          </div>
        `;
      } else if (elem.type === "line" || elem.type === "rect") {
        specificFields = `
          <div class="form-row">
            <div class="form-group">
              <label>Stroke Style</label>
              <select id="elem-line-style" class="cad-input">
                <option value="solid" ${elem.lineStyle === 'solid' ? 'selected' : ''}>Solid</option>
                <option value="dashed" ${elem.lineStyle === 'dashed' ? 'selected' : ''}>Dashed</option>
              </select>
            </div>
            <div class="form-group">
              <label>Thickness (mm)</label>
              <input type="number" id="elem-thickness" class="cad-input" value="${elem.thickness || 0.3}" step="0.1">
            </div>
          </div>
        `;
      }

      panel.innerHTML = `
        <div class="inspector-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <h4 class="inspector-title" style="margin:0;">⚙️ ${elem.type.toUpperCase()} Properties</h4>
            <span style="font-size:0.75rem;color:#38bdf8;font-weight:bold;">${elem.id.split('_')[0]}</span>
          </div>

          ${specificFields}

          <!-- Transform (Coordinates & Rotation) -->
          <div class="inspector-subtitle">📍 Position & Size (mm)</div>
          <div class="form-row">
            <div class="form-group">
              <label>X (mm)</label>
              <input type="number" id="elem-x" class="cad-input" value="${elem.x.toFixed(1)}" step="0.5">
            </div>
            <div class="form-group">
              <label>Y (mm)</label>
              <input type="number" id="elem-y" class="cad-input" value="${elem.y.toFixed(1)}" step="0.5">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Width (mm)</label>
              <input type="number" id="elem-w" class="cad-input" value="${elem.w.toFixed(1)}" step="0.5">
            </div>
            <div class="form-group">
              <label>Height (mm)</label>
              <input type="number" id="elem-h" class="cad-input" value="${elem.h.toFixed(1)}" step="0.5">
            </div>
          </div>

          <div class="form-group">
            <label>Rotation</label>
            <select id="elem-rotation" class="cad-input">
              <option value="0" ${elem.rotation === 0 ? 'selected' : ''}>0° (Horizontal)</option>
              <option value="90" ${elem.rotation === 90 ? 'selected' : ''}>90° (Vertical Down)</option>
              <option value="180" ${elem.rotation === 180 ? 'selected' : ''}>180° (Inverted)</option>
              <option value="270" ${elem.rotation === 270 ? 'selected' : ''}>270° (Vertical Up)</option>
            </select>
          </div>

          <div style="display:flex;gap:6px;margin-top:14px;">
            <button class="ribbon-btn" id="btn-cad-dup" style="flex:1;">📋 Duplicate</button>
            <button class="ribbon-btn" id="btn-cad-del" style="flex:1;color:#ef4444;border-color:#ef4444;">🗑️ Delete</button>
          </div>
          <div style="display:flex;gap:6px;margin-top:8px;">
            <button class="ribbon-btn" id="btn-cad-front" style="flex:1;font-size:0.75rem;">⬆ Front</button>
            <button class="ribbon-btn" id="btn-cad-back" style="flex:1;font-size:0.75rem;">⬇ Back</button>
          </div>
        </div>
      `;

      // Text Events
      document.getElementById("elem-content")?.addEventListener("input", (e) => {
        elem.content = e.target.value;
        this.render();
      });
      document.getElementById("elem-font-size")?.addEventListener("input", (e) => {
        elem.fontSize = parseFloat(e.target.value) || 8;
        this.render();
      });
      document.getElementById("elem-font-weight")?.addEventListener("change", (e) => {
        elem.fontWeight = e.target.value;
        this.render();
      });
      document.getElementById("elem-font-family")?.addEventListener("change", (e) => {
        elem.fontFamily = e.target.value;
        this.render();
      });
      document.getElementById("elem-text-align")?.addEventListener("change", (e) => {
        elem.textAlign = e.target.value;
        this.render();
      });
      document.getElementById("elem-vertical-align")?.addEventListener("change", (e) => {
        elem.verticalAlign = e.target.value;
        this.render();
      });

      // Barcode Events
      document.getElementById("elem-code-val")?.addEventListener("input", (e) => {
        elem.codeValue = e.target.value;
        if (!elem.barcodeText || elem.barcodeText === elem.codeValue) {
          elem.barcodeText = e.target.value;
          const textInput = document.getElementById("elem-barcode-text");
          if (textInput) textInput.value = e.target.value;
        }
        this.render();
      });
      document.getElementById("elem-barcode-text")?.addEventListener("input", (e) => {
        elem.barcodeText = e.target.value;
        this.render();
      });
      document.getElementById("elem-bar-height")?.addEventListener("input", (e) => {
        elem.barHeight = parseFloat(e.target.value) || 6.5;
        this.render();
      });
      document.getElementById("elem-module-width")?.addEventListener("input", (e) => {
        elem.moduleWidth = parseFloat(e.target.value) || 1.2;
        this.render();
      });
      document.getElementById("elem-stretch")?.addEventListener("change", (e) => {
        elem.stretch = e.target.checked;
        this.render();
      });
      document.getElementById("elem-show-text")?.addEventListener("change", (e) => {
        elem.showText = e.target.checked;
        document.getElementById("barcode-text-details").style.display = e.target.checked ? "block" : "none";
        this.render();
      });
      document.getElementById("elem-barcode-font-size")?.addEventListener("input", (e) => {
        elem.fontSize = parseFloat(e.target.value) || 7.5;
        this.render();
      });
      document.getElementById("elem-barcode-text-gap")?.addEventListener("input", (e) => {
        elem.textGap = parseFloat(e.target.value) || 1.0;
        this.render();
      });
      document.getElementById("elem-barcode-font-family")?.addEventListener("change", (e) => {
        elem.fontFamily = e.target.value;
        this.render();
      });
      document.getElementById("elem-barcode-font-weight")?.addEventListener("change", (e) => {
        elem.fontWeight = e.target.value;
        this.render();
      });
      document.getElementById("elem-barcode-text-align")?.addEventListener("change", (e) => {
        elem.textAlign = e.target.value;
        this.render();
      });

      // Transform Events
      document.getElementById("elem-x")?.addEventListener("change", (e) => {
        elem.x = parseFloat(e.target.value) || 0;
        this.render();
      });
      document.getElementById("elem-y")?.addEventListener("change", (e) => {
        elem.y = parseFloat(e.target.value) || 0;
        this.render();
      });
      document.getElementById("elem-w")?.addEventListener("change", (e) => {
        elem.w = parseFloat(e.target.value) || 10;
        this.render();
      });
      document.getElementById("elem-h")?.addEventListener("change", (e) => {
        elem.h = parseFloat(e.target.value) || 5;
        this.render();
      });
      document.getElementById("elem-rotation")?.addEventListener("change", (e) => {
        elem.rotation = parseInt(e.target.value, 10) || 0;
        this.render();
      });

      document.getElementById("btn-cad-dup")?.addEventListener("click", () => this.duplicateSelected());
      document.getElementById("btn-cad-del")?.addEventListener("click", () => this.deleteSelected());
      document.getElementById("btn-cad-front")?.addEventListener("click", () => this.bringToFront());
      document.getElementById("btn-cad-back")?.addEventListener("click", () => this.sendToBack());
    }

    // --- EXACT 100% PRECISE PRINT OUTPUT (SCALE = 1.0) ---
    buildPrintHtml(customData) {
      const c = this.canvas;
      const elementsToRender = JSON.parse(JSON.stringify(this.elements));
      const offX = c.printOffsetX || 0.0;
      const offY = c.printOffsetY || 0.0;

      if (customData) {
        elementsToRender.forEach(elem => {
          if (elem.id.includes("model") || elem.id.includes("frame") || elem.id.includes("prod")) {
            if (customData.name) elem.content = customData.name;
          }
          if (elem.id.includes("price") || elem.id.includes("offer")) {
            if (customData.price) elem.content = `₹${customData.price} /-`;
          }
          if (elem.type === "barcode") {
            if (customData.barcode) {
              elem.codeValue = customData.barcode;
              elem.barcodeText = customData.barcode;
            }
          }
        });
      }

      // Render elements in unscaled print pixels (zoom = 1.0)
      let innerElements = "";
      elementsToRender.forEach(elem => {
        const leftPx = (elem.x + offX) * MM_TO_PX;
        const topPx = (elem.y + offY) * MM_TO_PX;
        const wPx = elem.w * MM_TO_PX;
        const hPx = elem.h * MM_TO_PX;

        let content = "";
        if (elem.type === "text") {
          const vAlign = elem.verticalAlign || "middle";
          const justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end' };
          const alignMap = { top: 'flex-start', middle: 'center', bottom: 'flex-end' };

          content = `
            <div style="
              font-size: ${elem.fontSize}pt;
              font-weight: ${elem.fontWeight || 'normal'};
              font-family: ${elem.fontFamily || 'Arial'};
              text-align: ${elem.textAlign || 'left'};
              text-decoration: ${elem.textDecoration || 'none'};
              width: 100%;
              height: 100%;
              line-height: 1.15;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              display: flex;
              align-items: ${alignMap[vAlign] || 'center'};
              justify-content: ${justifyMap[elem.textAlign || 'left'] || 'flex-start'};
              box-sizing: border-box;
            ">
              ${escapeHtml(elem.content)}
            </div>
          `;
        } else if (elem.type === "barcode") {
          const rawBarHeightMm = elem.barHeight || (elem.h * 0.65);
          const barHeightScaled = rawBarHeightMm * MM_TO_PX;
          const textGapScaled = (elem.textGap !== undefined ? elem.textGap : 1.0) * MM_TO_PX;

          content = BarcodeEngine.renderSVG(elem.codeType || "CODE128", elem.codeValue || "123", {
            barHeight: barHeightScaled,
            moduleWidth: (elem.moduleWidth || 1.2),
            showText: elem.showText,
            text: elem.barcodeText !== undefined ? elem.barcodeText : elem.codeValue,
            fontSize: elem.fontSize || 7.5,
            fontFamily: elem.fontFamily || "'Courier New', Courier, monospace",
            fontWeight: elem.fontWeight || 'bold',
            textMargin: textGapScaled,
            textAlign: elem.textAlign || "center",
            stretch: elem.stretch !== false,
            margin: 0
          });
        } else if (elem.type === "qrcode") {
          content = QRCodeEngine.renderSVG(elem.codeValue || "https://example.com", {
            size: Math.min(wPx, hPx),
            margin: 0
          });
        } else if (elem.type === "line") {
          content = `<div style="width:100%;height:0;border-top:${Math.max(elem.thickness, 0.3)}mm ${elem.lineStyle} #000;margin-top:${(hPx/2).toFixed(1)}px;"></div>`;
        } else if (elem.type === "rect") {
          content = `<div style="width:100%;height:100%;border:${Math.max(elem.thickness, 0.3)}mm ${elem.lineStyle} #000;background:${elem.fill ? '#000' : 'transparent'};"></div>`;
        }

        const posX = elem.x + offX;
        const posY = elem.y + offY;

        innerElements += `
          <div style="
            position: absolute;
            left: ${posX.toFixed(2)}mm;
            top: ${posY.toFixed(2)}mm;
            width: ${elem.w.toFixed(2)}mm;
            height: ${elem.h.toFixed(2)}mm;
            transform: rotate(${elem.rotation || 0}deg);
            transform-origin: center center;
            box-sizing: border-box;
            overflow: visible;
          ">
            ${content}
          </div>
        `;
      });

      return `
        <div class="print-label-item" style="
          width: ${c.width}mm !important;
          height: ${c.height}mm !important;
          position: relative !important;
          overflow: hidden !important;
          background: #ffffff !important;
          margin: 0 !important;
          padding: 0 !important;
        ">
          <div style="
            width: ${c.printableWidth}mm !important;
            height: ${c.height}mm !important;
            position: relative !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
          ">
            ${innerElements}
          </div>
        </div>
      `;
    }
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeXml(str) {
    return escapeHtml(str);
  }

  global.CadStudio = CadStudio;
  if (typeof window !== 'undefined') window.CadStudio = CadStudio;
  if (typeof globalThis !== 'undefined') globalThis.CadStudio = CadStudio;

})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
