/**
 * ThermalPrint Pro - Main Application Logic (English UI & Optical Dumbbell Support)
 */

(function () {
  'use strict';

  // --- STATE ---
  const state = {
    layoutMode: "two_column", // 'two_column' | 'stacked'
    width: 81,
    height: 12,
    printableWidth: 55,
    tailWidth: 26,
    isDumbbell: true,
    showBorder: false,

    // Store / Brand Header
    storeName: "SPECS BUDDY",
    storeSubtitle: "",
    storeAlign: "left",
    fontSizeStore: 8,

    // Product / Model
    productName: "Heavy Metal Frame",
    variant: "",
    fontSizeProduct: 7.5,

    // Price
    currency: "₹",
    mrp: "",
    showMrpStrike: false,
    price: "1449",
    priceSuffix: "/-",
    fontSizePrice: 10,
    discountBadge: "",
    showDiscountBadge: false,

    // Barcode / SKU
    codeType: "CODE128",
    codeValue: "SB-02581",
    showCodeText: true,
    codeHeight: 20,

    // Batch & Footer
    batchNo: "",
    mfgDate: "",
    footerText: "",

    // UI state
    zoomScale: 2.5,
    copies: 1,
    activeTab: "designer",

    // Batch Queue (Optical Frame Samples)
    batchItems: [
      { id: 1, name: "Heavy Metal Frame", barcode: "SB-02581", price: "1449", qty: 10 },
      { id: 2, name: "TR90 Matte Black Frame", barcode: "SB-02582", price: "1299", qty: 5 },
      { id: 3, name: "Rimless Titanium Frame", barcode: "SB-02583", price: "1899", qty: 5 },
      { id: 4, name: "Classic Aviator Gold", barcode: "SB-02584", price: "1599", qty: 8 }
    ]
  };

  // --- DOM ELEMENTS ---
  const el = {
    selectPresetTemplate: document.getElementById("select-preset-template"),
    selectLabelSize: document.getElementById("select-label-size"),
    selectLayoutMode: document.getElementById("select-layout-mode"),
    rowCustomSize: document.getElementById("row-custom-size"),
    inputCustomW: document.getElementById("input-custom-w"),
    inputCustomH: document.getElementById("input-custom-h"),
    rowDumbbellDetails: document.getElementById("row-dumbbell-details"),
    inputPrintableW: document.getElementById("input-printable-w"),
    inputTailW: document.getElementById("input-tail-w"),
    chkShowBorder: document.getElementById("chk-show-border"),

    // Brand inputs
    inputStoreName: document.getElementById("input-store-name"),
    inputStoreSub: document.getElementById("input-store-sub"),
    inputStoreFontSize: document.getElementById("input-store-font-size"),
    selectStoreAlign: document.getElementById("select-store-align"),

    // Product inputs
    inputProductName: document.getElementById("input-product-name"),
    inputVariant: document.getElementById("input-variant"),
    inputProductFontSize: document.getElementById("input-product-font-size"),
    grpVariant: document.getElementById("grp-variant"),

    // Price inputs
    selectCurrency: document.getElementById("select-currency"),
    inputPrice: document.getElementById("input-price"),
    inputPriceSuffix: document.getElementById("input-price-suffix"),
    inputPriceFontSize: document.getElementById("input-price-font-size"),
    rowMrpGroup: document.getElementById("row-mrp-group"),
    inputMrp: document.getElementById("input-mrp"),
    inputDiscountBadge: document.getElementById("input-discount-badge"),
    chkShowDiscount: document.getElementById("chk-show-discount"),
    lblChkDiscount: document.getElementById("lbl-chk-discount"),

    // Barcode inputs
    selectCodeType: document.getElementById("select-code-type"),
    inputCodeVal: document.getElementById("input-code-val"),
    inputCodeHeight: document.getElementById("input-code-height"),
    chkShowCodeText: document.getElementById("chk-show-code-text"),
    btnRandBarcode: document.getElementById("btn-rand-barcode"),

    // Batch & Footer
    secBatchFooter: document.getElementById("sec-batch-footer"),
    inputBatchNo: document.getElementById("input-batch-no"),
    inputMfgDate: document.getElementById("input-mfg-date"),
    inputFooterText: document.getElementById("input-footer-text"),

    // Preview
    previewSticker: document.getElementById("preview-sticker"),
    dimensionText: document.getElementById("dimension-text"),

    // Zoom & Print
    btnZoomOut: document.getElementById("btn-zoom-out"),
    btnZoomIn: document.getElementById("btn-zoom-in"),
    zoomLevelText: document.getElementById("zoom-level-text"),
    inputPrintCopies: document.getElementById("input-print-copies"),
    btnWorkspacePrint: document.getElementById("btn-workspace-print"),
    btnHeaderPrint: document.getElementById("btn-header-print"),
    btnTestPrint: document.getElementById("btn-test-print"),

    // Guide Modal
    btnGuide: document.getElementById("btn-guide"),
    guideModal: document.getElementById("guide-modal"),
    btnCloseGuide: document.getElementById("btn-close-guide"),
    btnModalGotIt: document.getElementById("btn-modal-got-it"),

    // Tabs
    tabBtnDesigner: document.getElementById("tab-btn-designer"),
    tabBtnBatch: document.getElementById("tab-btn-batch"),
    viewDesignerControls: document.getElementById("view-designer-controls"),
    viewBatchControls: document.getElementById("view-batch-controls"),
    batchBadgeCount: document.getElementById("batch-badge-count"),

    // Batch Controls
    btnAddCurrentToBatch: document.getElementById("btn-add-current-to-batch"),
    btnAddEmptyBatchRow: document.getElementById("btn-add-empty-batch-row"),
    btnClearBatch: document.getElementById("btn-clear-batch"),
    batchTableBody: document.getElementById("batch-table-body"),
    inputCsvFile: document.getElementById("input-csv-file"),
    btnDownloadSampleCsv: document.getElementById("btn-download-sample-csv"),

    // Saved Templates
    inputTemplateName: document.getElementById("input-template-name"),
    btnSaveTemplate: document.getElementById("btn-save-template"),
    savedTemplatesList: document.getElementById("saved-templates-list"),

    // Hidden print container
    printStage: document.getElementById("print-stage")
  };

  // --- INITIALIZATION ---
  function init() {
    populatePresetDropdowns();
    syncFormFromState();
    bindEvents();
    renderBatchTable();
    loadSavedTemplatesList();
    renderLivePreview();
  }

  // --- POPULATE DROPDOWNS ---
  function populatePresetDropdowns() {
    el.selectPresetTemplate.innerHTML = '<option value="">-- Choose Preset Template --</option>';
    for (let key in PRESET_TEMPLATES) {
      const t = PRESET_TEMPLATES[key];
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = t.name;
      if (key === "optical_dumbbell") opt.selected = true;
      el.selectPresetTemplate.appendChild(opt);
    }

    el.selectLabelSize.innerHTML = "";
    STANDARD_LABEL_SIZES.forEach((s, idx) => {
      const opt = document.createElement("option");
      opt.value = idx;
      opt.textContent = s.label;
      if (s.width === state.width && s.height === state.height) {
        opt.selected = true;
      }
      el.selectLabelSize.appendChild(opt);
    });
  }

  // --- SYNC FORM FROM STATE ---
  function syncFormFromState() {
    el.selectLayoutMode.value = state.layoutMode;
    el.inputCustomW.value = state.width;
    el.inputCustomH.value = state.height;
    el.inputPrintableW.value = state.printableWidth;
    el.inputTailW.value = state.tailWidth;
    el.chkShowBorder.checked = state.showBorder;

    el.inputStoreName.value = state.storeName;
    el.inputStoreSub.value = state.storeSubtitle;
    el.inputStoreFontSize.value = state.fontSizeStore;
    el.selectStoreAlign.value = state.storeAlign;

    el.inputProductName.value = state.productName;
    el.inputVariant.value = state.variant;
    el.inputProductFontSize.value = state.fontSizeProduct;

    el.selectCurrency.value = state.currency;
    el.inputPrice.value = state.price;
    el.inputPriceSuffix.value = state.priceSuffix || "";
    el.inputPriceFontSize.value = state.fontSizePrice;
    el.inputMrp.value = state.mrp || "";
    el.inputDiscountBadge.value = state.discountBadge || "";
    el.chkShowDiscount.checked = state.showDiscountBadge || false;

    el.selectCodeType.value = state.codeType;
    el.inputCodeVal.value = state.codeValue;
    el.inputCodeHeight.value = state.codeHeight;
    el.chkShowCodeText.checked = state.showCodeText;

    el.inputBatchNo.value = state.batchNo || "";
    el.inputMfgDate.value = state.mfgDate || "";
    el.inputFooterText.value = state.footerText || "";

    // Toggle dumbbell controls visibility
    if (state.isDumbbell || state.tailWidth > 0) {
      el.rowDumbbellDetails.style.display = "flex";
    } else {
      el.rowDumbbellDetails.style.display = "none";
    }
  }

  // --- SYNC STATE FROM FORM ---
  function syncStateFromForm() {
    state.layoutMode = el.selectLayoutMode.value;
    state.printableWidth = parseFloat(el.inputPrintableW.value) || 55;
    state.tailWidth = parseFloat(el.inputTailW.value) || 0;
    state.isDumbbell = state.tailWidth > 0;

    state.storeName = el.inputStoreName.value.trim();
    state.storeSubtitle = el.inputStoreSub.value.trim();
    state.fontSizeStore = parseFloat(el.inputStoreFontSize.value) || 8;
    state.storeAlign = el.selectStoreAlign.value;

    state.productName = el.inputProductName.value.trim();
    state.variant = el.inputVariant.value.trim();
    state.fontSizeProduct = parseFloat(el.inputProductFontSize.value) || 7.5;

    state.currency = el.selectCurrency.value;
    state.price = el.inputPrice.value.trim();
    state.priceSuffix = el.inputPriceSuffix.value.trim();
    state.fontSizePrice = parseFloat(el.inputPriceFontSize.value) || 10;
    state.mrp = el.inputMrp.value.trim();
    state.discountBadge = el.inputDiscountBadge.value.trim();
    state.showDiscountBadge = el.chkShowDiscount.checked;

    state.codeType = el.selectCodeType.value;
    state.codeValue = el.inputCodeVal.value.trim();
    state.codeHeight = parseInt(el.inputCodeHeight.value, 10) || 20;
    state.showCodeText = el.chkShowCodeText.checked;

    state.batchNo = el.inputBatchNo.value.trim();
    state.mfgDate = el.inputMfgDate.value.trim();
    state.footerText = el.inputFooterText.value.trim();
    state.showBorder = el.chkShowBorder.checked;

    renderLivePreview();
  }

  // --- APPLY PRESET TEMPLATE ---
  function applyPreset(key) {
    const t = PRESET_TEMPLATES[key];
    if (!t) return;

    Object.assign(state, t);

    // Match in standard sizes
    let matchedIdx = -1;
    STANDARD_LABEL_SIZES.forEach((s, idx) => {
      if (s.width === t.width && s.height === t.height && s.printableWidth === t.printableWidth) {
        matchedIdx = idx;
      }
    });

    if (matchedIdx !== -1) {
      el.selectLabelSize.value = matchedIdx;
      el.rowCustomSize.style.display = "none";
    } else {
      el.selectLabelSize.value = STANDARD_LABEL_SIZES.length - 1;
      el.rowCustomSize.style.display = "flex";
    }

    syncFormFromState();
    renderLivePreview();
  }

  // --- BUILD INNER LABEL HTML ---
  function buildLabelHtml(data) {
    const d = data || state;
    const borderClass = d.showBorder ? "has-border" : "";
    const curr = d.currency || "";
    const priceFormatted = d.price ? `${curr}${escapeHtml(d.price)} ${escapeHtml(d.priceSuffix || "")}`.trim() : "";

    // Generate Barcode SVG
    let barcodeSvg = "";
    if (d.codeValue) {
      try {
        if (d.codeType === "QR") {
          barcodeSvg = QRCodeEngine.renderSVG(d.codeValue, { size: d.codeHeight * 1.5, margin: 1 });
        } else {
          barcodeSvg = BarcodeEngine.renderSVG(d.codeType || "CODE128", d.codeValue, {
            height: d.codeHeight || 20,
            moduleWidth: 1.3,
            showText: d.showCodeText,
            fontSize: 8.5,
            margin: 1.5
          });
        }
      } catch (err) {
        barcodeSvg = `<div style="font-size:7pt;color:red;">Error: ${err.message}</div>`;
      }
    }

    // MODE 1: TWO-COLUMN (Optical / Eyewear Dumbbell Tag - EXACT MATCH TO USER'S PHOTO)
    if (d.layoutMode === "two_column") {
      return `
        <div class="label-inner ${borderClass}" style="padding: 0;">
          <div class="layout-two-column">
            <!-- Left Info Block -->
            <div class="col-left" style="text-align: ${d.storeAlign || 'left'};">
              <div class="lbl-store-name" style="font-size: ${d.fontSizeStore}pt;">${escapeHtml(d.storeName || "")}</div>
              <div class="lbl-product-name" style="font-size: ${d.fontSizeProduct}pt;">${escapeHtml(d.productName || "")}</div>
              <div class="lbl-price-val" style="font-size: ${d.fontSizePrice}pt;">${priceFormatted}</div>
            </div>

            <!-- Right Barcode Block -->
            <div class="col-right">
              <div class="barcode-svg-wrap">
                ${barcodeSvg}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // MODE 2: STACKED (Standard Retail / Apparel / Grocery)
    let headerHtml = "";
    if (d.storeName) {
      headerHtml = `
        <div class="lbl-header" style="text-align: ${d.storeAlign || 'center'};">
          <div class="lbl-store-name" style="font-size: ${d.fontSizeStore}pt;">${escapeHtml(d.storeName)}</div>
          ${d.storeSubtitle ? `<div style="font-size:7pt;font-weight:500;">${escapeHtml(d.storeSubtitle)}</div>` : ""}
        </div>
      `;
    }

    let productHtml = "";
    if (d.productName) {
      productHtml += `<div class="lbl-product-name-stacked" style="font-size: ${d.fontSizeProduct}pt;">${escapeHtml(d.productName)}</div>`;
    }
    if (d.variant) {
      productHtml += `<div class="lbl-variant-stacked">${escapeHtml(d.variant)}</div>`;
    }

    let priceHtml = "";
    if (d.price) {
      priceHtml = `
        <div class="lbl-price-row-stacked">
          ${d.mrp ? `<span class="lbl-mrp-group">MRP: <span class="lbl-mrp-val strike">${curr}${escapeHtml(d.mrp)}</span></span>` : ""}
          <span style="font-size: ${d.fontSizePrice}pt; font-weight: 900;">${priceFormatted}</span>
          ${d.showDiscountBadge && d.discountBadge ? `<span class="lbl-discount-badge">${escapeHtml(d.discountBadge)}</span>` : ""}
        </div>
      `;
    }

    return `
      <div class="label-inner ${borderClass}">
        <div>
          ${headerHtml}
          ${productHtml}
        </div>
        <div>
          ${priceHtml}
          <div class="lbl-barcode-container-stacked">
            ${barcodeSvg}
          </div>
        </div>
        ${(d.batchNo || d.mfgDate || d.footerText) ? `
          <div>
            <div class="lbl-meta-row-stacked">
              <span>${escapeHtml(d.batchNo || "")}</span>
              <span>${escapeHtml(d.mfgDate || "")}</span>
            </div>
            ${d.footerText ? `<div style="font-size:6pt;text-align:center;margin-top:0.5mm;">${escapeHtml(d.footerText)}</div>` : ""}
          </div>
        ` : ""}
      </div>
    `;
  }

  // --- RENDER LIVE PREVIEW ---
  function renderLivePreview() {
    const mmToPx = 3.7795275591; // 1mm in px at 96 DPI
    const zoom = state.zoomScale;

    const printableW_px = (state.printableWidth * mmToPx * zoom);
    const labelH_px = (state.height * mmToPx * zoom);
    const tailW_px = (state.tailWidth * mmToPx * zoom);
    const tailH_px = Math.max(3.2 * mmToPx * zoom, 8); // tail height ~3.5mm

    el.zoomLevelText.textContent = `${Math.round(zoom * 100)}%`;

    if (state.isDumbbell && state.tailWidth > 0) {
      el.dimensionText.textContent = `${state.width} mm × ${state.height} mm (Printable: ${state.printableWidth} mm + ${state.tailWidth} mm Tail)`;
      
      // Render Dumbbell / Spectacle Tag with Tail
      el.previewSticker.innerHTML = `
        <div class="dumbbell-wrapper">
          <div class="dumbbell-head" style="width: ${printableW_px.toFixed(1)}px; height: ${labelH_px.toFixed(1)}px;">
            ${buildLabelHtml(state)}
          </div>
          <div class="dumbbell-tail" style="width: ${tailW_px.toFixed(1)}px; height: ${tailH_px.toFixed(1)}px;" title="Rat-tail / Loop around frame bridge">
          </div>
        </div>
      `;
    } else {
      el.dimensionText.textContent = `${state.width} mm × ${state.height} mm`;

      el.previewSticker.innerHTML = `
        <div class="dumbbell-head" style="width: ${printableW_px.toFixed(1)}px; height: ${labelH_px.toFixed(1)}px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
          ${buildLabelHtml(state)}
        </div>
      `;
    }
  }

  // --- BATCH MANAGER ---
  function renderBatchTable() {
    el.batchTableBody.innerHTML = "";
    el.batchBadgeCount.textContent = state.batchItems.length;

    if (state.batchItems.length === 0) {
      el.batchTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: #94a3b8; padding: 24px;">
            Batch queue is empty. Click "Add Current Design to Queue" or import a CSV file.
          </td>
        </tr>
      `;
      return;
    }

    state.batchItems.forEach((item, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input type="text" value="${escapeHtml(item.name || "")}" data-field="name" data-idx="${idx}"></td>
        <td><input type="text" value="${escapeHtml(item.barcode || "")}" data-field="barcode" data-idx="${idx}"></td>
        <td><input type="text" value="${escapeHtml(item.price || "")}" data-field="price" data-idx="${idx}" style="width:75px;"></td>
        <td><input type="number" value="${item.qty || 1}" min="1" max="1000" data-field="qty" data-idx="${idx}" style="width:60px;"></td>
        <td>
          <button class="btn btn-danger btn-sm btn-delete-row" data-idx="${idx}" style="padding: 2px 7px;">✕</button>
        </td>
      `;
      el.batchTableBody.appendChild(tr);
    });

    el.batchTableBody.querySelectorAll("input").forEach(input => {
      input.addEventListener("input", function () {
        const idx = parseInt(this.getAttribute("data-idx"), 10);
        const field = this.getAttribute("data-field");
        state.batchItems[idx][field] = this.value;
      });
    });

    el.batchTableBody.querySelectorAll(".btn-delete-row").forEach(btn => {
      btn.addEventListener("click", function () {
        const idx = parseInt(this.getAttribute("data-idx"), 10);
        state.batchItems.splice(idx, 1);
        renderBatchTable();
      });
    });
  }

  function addCurrentToBatch() {
    state.batchItems.push({
      id: Date.now(),
      name: state.productName || "Frame",
      barcode: state.codeValue || "SB-001",
      price: state.price || "0",
      qty: parseInt(el.inputPrintCopies.value, 10) || 1
    });
    renderBatchTable();
    showToast("Added current label to batch queue!");
  }

  function addEmptyBatchRow() {
    const nextNum = Math.floor(10000 + Math.random() * 90000);
    state.batchItems.push({
      id: Date.now(),
      name: "Metal Frame",
      barcode: `SB-${nextNum}`,
      price: "1449",
      qty: 1
    });
    renderBatchTable();
  }

  // --- CSV IMPORT / EXPORT ---
  function handleCsvUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
      const text = evt.target.result;
      const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
      if (lines.length <= 1) {
        alert("CSV file is empty or contains only headers.");
        return;
      }

      const rows = [];
      const startIdx = lines[0].toLowerCase().includes("model") || lines[0].toLowerCase().includes("name") ? 1 : 0;
      for (let i = startIdx; i < lines.length; i++) {
        const parts = lines[i].split(",").map(p => p.trim().replace(/^["']|["']$/g, ""));
        if (parts.length >= 2) {
          rows.push({
            id: Date.now() + i,
            name: parts[0] || "Frame",
            barcode: parts[1] || "",
            price: parts[2] || "999",
            qty: parseInt(parts[3], 10) || 1
          });
        }
      }

      state.batchItems = state.batchItems.concat(rows);
      renderBatchTable();
      showToast(`${rows.length} items imported from CSV!`);
      el.inputCsvFile.value = "";
    };
    reader.readAsText(file);
  }

  function downloadSampleCsv() {
    const csvContent = 
`Model Name,Barcode,Price,Qty
Heavy Metal Frame,SB-02581,1449,10
TR90 Matte Black Frame,SB-02582,1299,5
Rimless Titanium Frame,SB-02583,1899,5
Classic Aviator Gold,SB-02584,1599,8
Round Vintage Spectacle,SB-02585,1349,6`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "specs_frames_sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- PRINT ENGINE ---
  function executePrint(mode) {
    el.printStage.innerHTML = "";

    const totalWidthMm = state.width;
    const heightMm = state.height;
    const printableWidthMm = state.printableWidth;

    let dynamicStyle = document.getElementById("dynamic-print-style");
    if (!dynamicStyle) {
      dynamicStyle = document.createElement("style");
      dynamicStyle.id = "dynamic-print-style";
      document.head.appendChild(dynamicStyle);
    }
    dynamicStyle.textContent = `
      @page {
        size: ${totalWidthMm}mm ${heightMm}mm !important;
        margin: 0mm !important;
      }
      .print-label-item {
        width: ${totalWidthMm}mm !important;
        height: ${heightMm}mm !important;
        display: flex !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
      }
      .print-head-area {
        width: ${printableWidthMm}mm !important;
        height: ${heightMm}mm !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
      }
    `;

    if (mode === "test") {
      const testItem = document.createElement("div");
      testItem.className = "print-label-item";
      testItem.innerHTML = `
        <div class="print-head-area">
          <div class="label-inner has-border" style="display:flex;align-items:center;justify-content:space-between;padding:1mm;">
            <div style="font-size:7pt;font-weight:bold;">
              <div>ALIGN TEST</div>
              <div style="font-size:6pt;">${totalWidthMm}x${heightMm}mm</div>
            </div>
            <div>
              ${BarcodeEngine.renderSVG("CODE128", "TEST-01", { height: 16, showText: true, fontSize: 7 })}
            </div>
          </div>
        </div>
      `;
      el.printStage.appendChild(testItem);
    } else if (state.activeTab === "batch" && state.batchItems.length > 0) {
      // Print batch items
      state.batchItems.forEach(item => {
        const qty = parseInt(item.qty, 10) || 1;
        const itemData = Object.assign({}, state, {
          productName: item.name,
          codeValue: item.barcode,
          price: item.price
        });

        const itemHtml = `
          <div class="print-head-area">
            ${buildLabelHtml(itemData)}
          </div>
        `;

        for (let c = 0; c < qty; c++) {
          const div = document.createElement("div");
          div.className = "print-label-item";
          div.innerHTML = itemHtml;
          el.printStage.appendChild(div);
        }
      });
    } else {
      // Print single label copies
      const copies = parseInt(el.inputPrintCopies.value, 10) || 1;
      const labelContent = `
        <div class="print-head-area">
          ${buildLabelHtml(state)}
        </div>
      `;

      for (let i = 0; i < copies; i++) {
        const div = document.createElement("div");
        div.className = "print-label-item";
        div.innerHTML = labelContent;
        el.printStage.appendChild(div);
      }
    }

    setTimeout(() => {
      window.print();
    }, 120);
  }

  // --- TEMPLATE STORAGE ---
  const STORAGE_KEY = "thermalprint_saved_templates_en";

  function getSavedTemplates() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  function saveTemplate() {
    const name = el.inputTemplateName.value.trim();
    if (!name) {
      alert("Please enter a template name!");
      return;
    }

    const templates = getSavedTemplates();
    templates[name] = Object.assign({}, state);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
      el.inputTemplateName.value = "";
      loadSavedTemplatesList();
      showToast(`Template "${name}" saved successfully!`);
    } catch (e) {
      alert("Could not save template: " + e.message);
    }
  }

  function loadSavedTemplatesList() {
    const templates = getSavedTemplates();
    const names = Object.keys(templates);
    if (names.length === 0) {
      el.savedTemplatesList.innerHTML = `<span style="color:#94a3b8;">No custom presets saved.</span>`;
      return;
    }

    let html = `<ul style="list-style: none; padding: 0; margin-top: 6px;">`;
    names.forEach(name => {
      html += `
        <li style="display:flex; justify-content:space-between; align-items:center; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">
          <strong style="color:#1e293b; font-size:0.84rem;">${escapeHtml(name)}</strong>
          <div style="display:flex; gap: 6px;">
            <button class="btn btn-secondary btn-sm btn-load-tmpl" data-name="${escapeHtml(name)}" style="padding:2px 8px; font-size:0.75rem;">Load</button>
            <button class="btn btn-danger btn-sm btn-del-tmpl" data-name="${escapeHtml(name)}" style="padding:2px 6px; font-size:0.75rem;">✕</button>
          </div>
        </li>
      `;
    });
    html += `</ul>`;
    el.savedTemplatesList.innerHTML = html;

    el.savedTemplatesList.querySelectorAll(".btn-load-tmpl").forEach(btn => {
      btn.addEventListener("click", function () {
        const name = this.getAttribute("data-name");
        const t = getSavedTemplates()[name];
        if (t) {
          Object.assign(state, t);
          syncFormFromState();
          renderLivePreview();
          showToast(`Loaded template "${name}"!`);
        }
      });
    });

    el.savedTemplatesList.querySelectorAll(".btn-del-tmpl").forEach(btn => {
      btn.addEventListener("click", function () {
        const name = this.getAttribute("data-name");
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
          const templates = getSavedTemplates();
          delete templates[name];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
          loadSavedTemplatesList();
        }
      });
    });
  }

  // --- EVENT LISTENERS ---
  function bindEvents() {
    const liveInputs = [
      el.selectLayoutMode, el.inputPrintableW, el.inputTailW, el.chkShowBorder,
      el.inputStoreName, el.inputStoreSub, el.inputStoreFontSize, el.selectStoreAlign,
      el.inputProductName, el.inputVariant, el.inputProductFontSize,
      el.selectCurrency, el.inputPrice, el.inputPriceSuffix, el.inputPriceFontSize,
      el.inputMrp, el.inputDiscountBadge, el.chkShowDiscount,
      el.selectCodeType, el.inputCodeVal, el.inputCodeHeight, el.chkShowCodeText,
      el.inputBatchNo, el.inputMfgDate, el.inputFooterText
    ];

    liveInputs.forEach(input => {
      input.addEventListener("input", syncStateFromForm);
      input.addEventListener("change", syncStateFromForm);
    });

    el.selectPresetTemplate.addEventListener("change", function () {
      if (this.value) {
        applyPreset(this.value);
      }
    });

    el.selectLabelSize.addEventListener("change", function () {
      const idx = parseInt(this.value, 10);
      const s = STANDARD_LABEL_SIZES[idx];
      if (s.width === 0 && s.height === 0) {
        el.rowCustomSize.style.display = "flex";
      } else {
        el.rowCustomSize.style.display = "none";
        state.width = s.width;
        state.height = s.height;
        state.printableWidth = s.printableWidth;
        state.tailWidth = s.tailWidth;
        state.isDumbbell = s.isDumbbell;
        state.layoutMode = s.layoutMode;
        el.inputCustomW.value = s.width;
        el.inputCustomH.value = s.height;
        el.inputPrintableW.value = s.printableWidth;
        el.inputTailW.value = s.tailWidth;
        el.selectLayoutMode.value = s.layoutMode;
        if (state.isDumbbell) {
          el.rowDumbbellDetails.style.display = "flex";
        } else {
          el.rowDumbbellDetails.style.display = "none";
        }
        renderLivePreview();
      }
    });

    el.inputCustomW.addEventListener("input", function () {
      state.width = parseFloat(this.value) || 81;
      renderLivePreview();
    });
    el.inputCustomH.addEventListener("input", function () {
      state.height = parseFloat(this.value) || 12;
      renderLivePreview();
    });

    el.btnRandBarcode.addEventListener("click", function () {
      const randNum = Math.floor(10000 + Math.random() * 90000);
      state.codeValue = `SB-${randNum}`;
      el.inputCodeVal.value = state.codeValue;
      renderLivePreview();
    });

    el.btnZoomIn.addEventListener("click", function () {
      if (state.zoomScale < 4.0) {
        state.zoomScale = parseFloat((state.zoomScale + 0.25).toFixed(2));
        renderLivePreview();
      }
    });
    el.btnZoomOut.addEventListener("click", function () {
      if (state.zoomScale > 0.75) {
        state.zoomScale = parseFloat((state.zoomScale - 0.25).toFixed(2));
        renderLivePreview();
      }
    });

    el.btnWorkspacePrint.addEventListener("click", () => executePrint("current"));
    el.btnHeaderPrint.addEventListener("click", () => executePrint("current"));
    el.btnTestPrint.addEventListener("click", () => executePrint("test"));

    el.tabBtnDesigner.addEventListener("click", function () {
      state.activeTab = "designer";
      el.tabBtnDesigner.classList.add("active");
      el.tabBtnBatch.classList.remove("active");
      el.viewDesignerControls.style.display = "block";
      el.viewBatchControls.style.display = "none";
    });

    el.tabBtnBatch.addEventListener("click", function () {
      state.activeTab = "batch";
      el.tabBtnBatch.classList.add("active");
      el.tabBtnDesigner.classList.remove("active");
      el.viewDesignerControls.style.display = "none";
      el.viewBatchControls.style.display = "block";
    });

    el.btnAddCurrentToBatch.addEventListener("click", addCurrentToBatch);
    el.btnAddEmptyBatchRow.addEventListener("click", addEmptyBatchRow);
    el.btnClearBatch.addEventListener("click", function () {
      if (confirm("Are you sure you want to clear all batch queue items?")) {
        state.batchItems = [];
        renderBatchTable();
      }
    });

    el.inputCsvFile.addEventListener("change", handleCsvUpload);
    el.btnDownloadSampleCsv.addEventListener("click", downloadSampleCsv);
    el.btnSaveTemplate.addEventListener("click", saveTemplate);

    el.btnGuide.addEventListener("click", () => el.guideModal.classList.add("active"));
    el.btnCloseGuide.addEventListener("click", () => el.guideModal.classList.remove("active"));
    el.btnModalGotIt.addEventListener("click", () => el.guideModal.classList.remove("active"));
    el.guideModal.addEventListener("click", (e) => {
      if (e.target === el.guideModal) el.guideModal.classList.remove("active");
    });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showToast(msg) {
    let toast = document.getElementById("app-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "app-toast";
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #0f172a;
        color: white;
        padding: 10px 18px;
        border-radius: 8px;
        font-size: 0.88rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        z-index: 1000;
        transition: opacity 0.3s;
        pointer-events: none;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = "1";
    setTimeout(() => {
      toast.style.opacity = "0";
    }, 2800);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
