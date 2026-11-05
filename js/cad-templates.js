/**
 * ThermalPrint Pro CAD - Standard Templates
 * Pre-configured CAD element layouts in millimeter coordinates.
 */

const CAD_PRESET_TEMPLATES = {
  specs_buddy_sample: {
    id: "specs_buddy_sample",
    name: "👓 Specs Buddy Sample Tag (81 × 12 mm - Original)",
    canvas: {
      width: 81,
      height: 12,
      isDumbbell: true,
      printableWidth: 55,
      tailWidth: 26,
      tailHeight: 3.5,
      printOffsetX: 0.0,
      printOffsetY: 0.0
    },
    elements: [
      {
        id: "brand_name",
        type: "text",
        x: 1.5,
        y: 1.0,
        w: 26.0,
        h: 3.4,
        content: "SPECS BUDDY",
        fontSize: 8.5,
        fontWeight: "bold",
        fontFamily: "Arial",
        textAlign: "left",
        verticalAlign: "middle",
        rotation: 0
      },
      {
        id: "frame_model",
        type: "text",
        x: 1.5,
        y: 4.6,
        w: 26.0,
        h: 3.2,
        content: "Heavy Metal Frame",
        fontSize: 7.5,
        fontWeight: "bold",
        fontFamily: "Arial",
        textAlign: "left",
        verticalAlign: "middle",
        rotation: 0
      },
      {
        id: "price_tag",
        type: "text",
        x: 1.5,
        y: 8.0,
        w: 26.0,
        h: 3.5,
        content: "₹1449 /-",
        fontSize: 9.5,
        fontWeight: "bold",
        fontFamily: "Arial",
        textAlign: "left",
        verticalAlign: "middle",
        rotation: 0
      },
      {
        id: "barcode_1",
        type: "barcode",
        x: 29.0,
        y: 1.0,
        w: 24.5,
        h: 6.8,
        codeType: "CODE128",
        codeValue: "SB-02581",
        barcodeText: "SB-02581",
        showText: false,
        moduleWidth: 1.2,
        stretch: true,
        rotation: 0
      },
      {
        id: "barcode_text",
        type: "text",
        x: 29.0,
        y: 8.0,
        w: 24.5,
        h: 3.5,
        content: "SB-02581",
        fontSize: 8.0,
        fontWeight: "bold",
        fontFamily: "'Courier New', Courier, monospace",
        textAlign: "center",
        verticalAlign: "middle",
        rotation: 0
      }
    ]
  },
  specs_buddy_91mm: {
    id: "specs_buddy_91mm",
    name: "👓 Specs Buddy Tag +10mm Tail (91 × 12 mm - 36mm Tail)",
    canvas: {
      width: 91,
      height: 12,
      isDumbbell: true,
      printableWidth: 55,
      tailWidth: 36, // +10mm tail
      tailHeight: 3.5,
      printOffsetX: 0.0,
      printOffsetY: 0.0
    },
    elements: [
      {
        id: "brand_name",
        type: "text",
        x: 1.5,
        y: 1.0,
        w: 26.0,
        h: 3.4,
        content: "SPECS BUDDY",
        fontSize: 8.5,
        fontWeight: "bold",
        fontFamily: "Arial",
        textAlign: "left",
        verticalAlign: "middle",
        rotation: 0
      },
      {
        id: "frame_model",
        type: "text",
        x: 1.5,
        y: 4.6,
        w: 26.0,
        h: 3.2,
        content: "Heavy Metal Frame",
        fontSize: 7.5,
        fontWeight: "bold",
        fontFamily: "Arial",
        textAlign: "left",
        verticalAlign: "middle",
        rotation: 0
      },
      {
        id: "price_tag",
        type: "text",
        x: 1.5,
        y: 8.0,
        w: 26.0,
        h: 3.5,
        content: "₹1449 /-",
        fontSize: 9.5,
        fontWeight: "bold",
        fontFamily: "Arial",
        textAlign: "left",
        verticalAlign: "middle",
        rotation: 0
      },
      {
        id: "barcode_1",
        type: "barcode",
        x: 29.0,
        y: 1.0,
        w: 24.5,
        h: 6.8,
        codeType: "CODE128",
        codeValue: "SB-02581",
        barcodeText: "SB-02581",
        showText: false,
        moduleWidth: 1.2,
        stretch: true,
        rotation: 0
      },
      {
        id: "barcode_text",
        type: "text",
        x: 29.0,
        y: 8.0,
        w: 24.5,
        h: 3.5,
        content: "SB-02581",
        fontSize: 8.0,
        fontWeight: "bold",
        fontFamily: "'Courier New', Courier, monospace",
        textAlign: "center",
        verticalAlign: "middle",
        rotation: 0
      }
    ]
  },
  specs_tag_head_only: {
    id: "specs_tag_head_only",
    name: "👓 Specs Tag Head Only (55 × 12 mm)",
    canvas: {
      width: 55,
      height: 12,
      isDumbbell: false,
      printableWidth: 55,
      tailWidth: 0,
      tailHeight: 0,
      printOffsetX: 0.0,
      printOffsetY: 0.0
    },
    elements: [
      {
        id: "brand_name",
        type: "text",
        x: 1.5,
        y: 1.0,
        w: 26.0,
        h: 3.4,
        content: "SPECS BUDDY",
        fontSize: 8.5,
        fontWeight: "bold",
        fontFamily: "Arial",
        textAlign: "left",
        verticalAlign: "middle",
        rotation: 0
      },
      {
        id: "frame_model",
        type: "text",
        x: 1.5,
        y: 4.6,
        w: 26.0,
        h: 3.2,
        content: "Heavy Metal Frame",
        fontSize: 7.5,
        fontWeight: "bold",
        fontFamily: "Arial",
        textAlign: "left",
        verticalAlign: "middle",
        rotation: 0
      },
      {
        id: "price_tag",
        type: "text",
        x: 1.5,
        y: 8.0,
        w: 26.0,
        h: 3.5,
        content: "₹1449 /-",
        fontSize: 9.5,
        fontWeight: "bold",
        fontFamily: "Arial",
        textAlign: "left",
        verticalAlign: "middle",
        rotation: 0
      },
      {
        id: "barcode_1",
        type: "barcode",
        x: 29.0,
        y: 1.0,
        w: 24.5,
        h: 6.8,
        codeType: "CODE128",
        codeValue: "SB-02581",
        barcodeText: "SB-02581",
        showText: false,
        moduleWidth: 1.2,
        stretch: true,
        rotation: 0
      },
      {
        id: "barcode_text",
        type: "text",
        x: 29.0,
        y: 8.0,
        w: 24.5,
        h: 3.5,
        content: "SB-02581",
        fontSize: 8.0,
        fontWeight: "bold",
        fontFamily: "'Courier New', Courier, monospace",
        textAlign: "center",
        verticalAlign: "middle",
        rotation: 0
      }
    ]
  },
  retail_apparel_50x30: {
    id: "retail_apparel_50x30",
    name: "👕 Garments & Apparel Tag (50 × 30 mm)",
    canvas: {
      width: 50,
      height: 30,
      isDumbbell: false,
      printableWidth: 50,
      tailWidth: 0,
      tailHeight: 0,
      printOffsetX: 0.0,
      printOffsetY: 0.0
    },
    elements: [
      {
        id: "store_header",
        type: "text",
        x: 2.0,
        y: 1.5,
        w: 46.0,
        h: 4.0,
        content: "TRENDZ FASHION",
        fontSize: 10.0,
        fontWeight: "bold",
        fontFamily: "Arial",
        textAlign: "center",
        verticalAlign: "middle",
        rotation: 0
      },
      {
        id: "div_line",
        type: "line",
        x: 2.0,
        y: 6.0,
        w: 46.0,
        h: 0.5,
        lineStyle: "dashed",
        thickness: 0.4,
        rotation: 0
      },
      {
        id: "prod_title",
        type: "text",
        x: 2.0,
        y: 7.0,
        w: 46.0,
        h: 3.5,
        content: "Men's Cotton Polo T-Shirt",
        fontSize: 8.5,
        fontWeight: "bold",
        fontFamily: "Arial",
        textAlign: "center",
        verticalAlign: "middle",
        rotation: 0
      },
      {
        id: "prod_spec",
        type: "text",
        x: 2.0,
        y: 10.8,
        w: 46.0,
        h: 3.0,
        content: "Size: XL | Col: Navy Blue",
        fontSize: 7.0,
        fontWeight: "normal",
        fontFamily: "Arial",
        textAlign: "center",
        verticalAlign: "middle",
        rotation: 0
      },
      {
        id: "mrp_crossed",
        type: "text",
        x: 5.0,
        y: 14.5,
        w: 18.0,
        h: 3.5,
        content: "MRP: ₹999",
        fontSize: 7.5,
        fontWeight: "normal",
        fontFamily: "Arial",
        textAlign: "left",
        verticalAlign: "middle",
        textDecoration: "line-through",
        rotation: 0
      },
      {
        id: "offer_price",
        type: "text",
        x: 24.0,
        y: 14.0,
        w: 22.0,
        h: 4.5,
        content: "₹599 /-",
        fontSize: 12.0,
        fontWeight: "bold",
        fontFamily: "Arial",
        textAlign: "right",
        verticalAlign: "middle",
        rotation: 0
      },
      {
        id: "barcode_tag",
        type: "barcode",
        x: 5.0,
        y: 19.0,
        w: 40.0,
        h: 9.0,
        codeType: "CODE128",
        codeValue: "TRZ-POLO-XL",
        barcodeText: "TRZ-POLO-XL",
        showText: true,
        fontSize: 7.5,
        barHeight: 6.0,
        moduleWidth: 1.3,
        textGap: 1.0,
        fontWeight: "bold",
        rotation: 0
      }
    ]
  }
};

// Backward-compatibility alias
CAD_PRESET_TEMPLATES.specs_buddy_dumbbell = CAD_PRESET_TEMPLATES.specs_buddy_sample;

// Ensure it is bound to global window in all browser contexts
if (typeof window !== 'undefined') {
  window.CAD_PRESET_TEMPLATES = CAD_PRESET_TEMPLATES;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CAD_PRESET_TEMPLATES };
}
