// lib/invoice.js - Official TMH Tax Invoice Generator Matching Company Spreadsheet Specification
import { jsPDF } from 'jspdf';

/**
 * Extracts and normalizes trip data into invoice fields matching the company template.
 */
export function getInvoiceData(trip) {
  if (!trip) {
    return {
      date: '2026-11-16',
      invoiceNumber: '371',
      fare: 450.00,
      fareFormatted: 'R450.00',
      clientName: 'Azoza',
      clientAddress1: '4 Ellis Road',
      clientAddress2: 'Block E, 4th Floor',
      clientAddress3: 'Constantia Kloof',
      clientPostalCode: '1709',
      clientPhone: '0119919000/8000',
      clientVat: '4530125071',
      serviceDesc: 'Call-out',
      referenceCode: '26-0515534-U-01',
    };
  }

  const date = trip.date || new Date().toISOString().split('T')[0];
  const invoiceNumber = trip.invoiceNumber || '371';
  const fare = parseFloat(trip.fare) || 450.00;
  const fareFormatted = `R${fare.toFixed(2)}`;
  const clientName = trip.billTo || 'Azoza';

  // Description matching company template
  const serviceDesc = trip.description || 'Call-out';

  // Reference code
  const referenceCode = trip.referenceNumber || trip.azozaReference || '26-0515534-U-01';

  return {
    date,
    invoiceNumber,
    fare,
    fareFormatted,
    clientName,
    clientAddress1: '4 Ellis Road',
    clientAddress2: 'Block E, 4th Floor',
    clientAddress3: 'Constantia Kloof',
    clientPostalCode: '1709',
    clientPhone: '0119919000/8000',
    clientVat: '4530125071',
    serviceDesc,
    referenceCode,
  };
}

/**
 * Generates vector PDF document using jsPDF matching the company template.
 */
export function createTaxInvoicePdf(trip) {
  const data = getInvoiceData(trip);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const marginX = 15;
  let y = 18;

  // Title: TAX INVOICE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('TAX INVOICE', marginX, y);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Team 234', marginX, y);

  y += 6;

  // Header meta table matching the template spreadsheet
  const colA = marginX;
  const colB = 105;
  const colC = 130;
  const rowH = 5.2;

  const headerRows = [
    { left: '', label: 'Date:', val: data.date },
    { left: '', label: 'Invoice #:', val: data.invoiceNumber },
    { left: 'TMH 234', label: 'Bill To:', val: data.clientName },
    { left: '1195 Mwazi street', label: '', val: data.clientAddress1 },
    { left: 'Mofolo Central', label: '', val: data.clientAddress2 },
    { left: '1801', label: '', val: data.clientAddress3 },
    { left: '0611615280', label: '', val: data.clientPostalCode },
    { left: 'Not VAT Reg', label: '', val: data.clientPhone },
    { left: `Azoza Reference: ${data.referenceCode}`, label: '', val: `Vat number: ${data.clientVat}` },
  ];

  doc.setFontSize(9);
  headerRows.forEach((r) => {
    if (r.left) {
      doc.text(r.left, colA, y);
    }
    if (r.label) {
      doc.text(r.label, colB, y);
    }
    if (r.val) {
      doc.text(r.val, colC, y);
    }
    y += rowH;
  });

  y += 4;

  // Table of line items
  // Columns: Date (30mm), Quantity (18mm), Description (42mm), Amount before VAT (32mm), VAT (22mm), Amount after VAT (36mm) = total 180mm
  const tableX = marginX;
  const tableW = 180;
  const cols = [
    { title: 'Date', w: 30, align: 'left' },
    { title: 'Quantity', w: 18, align: 'center' },
    { title: 'Description', w: 42, align: 'left' },
    { title: 'Amount before VAT', w: 32, align: 'right' },
    { title: 'VAT', w: 22, align: 'right' },
    { title: 'Amount after VAT', w: 36, align: 'right' },
  ];

  // Draw Header Row
  const headerH = 7.5;
  doc.setFillColor(166, 166, 166);
  doc.setDrawColor(115, 115, 115);
  doc.rect(tableX, y, tableW, headerH, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);

  let curX = tableX;
  cols.forEach((c) => {
    doc.line(curX, y, curX, y + headerH);
    const textX = c.align === 'center'
      ? curX + c.w / 2
      : c.align === 'right'
      ? curX + c.w - 3
      : curX + 2.5;
    doc.text(c.title, textX, y + 5, { align: c.align });
    curX += c.w;
  });
  doc.line(tableX + tableW, y, tableX + tableW, y + headerH);

  y += headerH;

  // Row 1: Line Item Data
  const row1H = 7;
  doc.setDrawColor(180, 180, 180);
  doc.setFillColor(255, 255, 255);
  doc.rect(tableX, y, tableW, row1H, 'FD');

  const rowData = [
    { val: data.date, align: 'left' },
    { val: '1', align: 'center' },
    { val: data.serviceDesc, align: 'left' },
    { val: data.fareFormatted, align: 'right' },
    { val: 'R0.00', align: 'right' },
    { val: data.fareFormatted, align: 'right' },
  ];

  curX = tableX;
  rowData.forEach((d, i) => {
    doc.line(curX, y, curX, y + row1H);
    const textX = d.align === 'center'
      ? curX + cols[i].w / 2
      : d.align === 'right'
      ? curX + cols[i].w - 3
      : curX + 2.5;
    doc.text(d.val, textX, y + 4.8, { align: d.align });
    curX += cols[i].w;
  });
  doc.line(tableX + tableW, y, tableX + tableW, y + row1H);

  y += row1H;

  // Blank rows (3 rows)
  for (let b = 0; b < 3; b++) {
    const blankH = 6;
    doc.rect(tableX, y, tableW, blankH);
    curX = tableX;
    cols.forEach((c) => {
      doc.line(curX, y, curX, y + blankH);
      curX += c.w;
    });
    doc.line(tableX + tableW, y, tableX + tableW, y + blankH);
    y += blankH;
  }

  y += 7;

  // Banking details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Banking details:', marginX, y);
  y += 5;
  doc.text('First National Bank', marginX, y);
  y += 5;
  doc.text('Account Holder Name: Kabelo Motlhale', marginX, y);
  y += 5;
  doc.text('Account type: Current Account', marginX, y);
  y += 5;
  doc.text('Account Number: 62474196302', marginX, y);
  y += 5;
  doc.text('Branch Code: 258623', marginX, y);

  y += 10;

  // Blank spreadsheet grid rows at bottom (4 rows)
  for (let b = 0; b < 4; b++) {
    const gridH = 5.5;
    doc.setDrawColor(220, 220, 220);
    doc.rect(tableX, y, tableW, gridH);
    const colStep = tableW / 4;
    for (let c = 1; c < 4; c++) {
      doc.line(tableX + c * colStep, y, tableX + c * colStep, y + gridH);
    }
    y += gridH;
  }

  return doc;
}

/**
 * Downloads the Tax Invoice as a crisp vector PDF file directly on mobile or desktop.
 */
export function downloadTaxInvoicePdf(trip) {
  const data = getInvoiceData(trip);
  const doc = createTaxInvoicePdf(trip);
  const fileName = `Tax_Invoice_${data.invoiceNumber}_${data.clientName.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}

/**
 * Generates self-contained HTML for display and printing of the Tax Invoice.
 */
export function generateTaxInvoiceHtml(trip) {
  const data = getInvoiceData(trip);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Tax_Invoice_${data.invoiceNumber}_${data.clientName.replace(/\s+/g, '_')}</title>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 15mm 12mm 15mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        html, body {
          background: #ffffff;
          color: #000000;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 10pt;
          line-height: 1.35;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .invoice-sheet {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          background: #ffffff;
          padding: 16px;
        }

        /* Top Title */
        .title {
          font-size: 18pt;
          font-weight: bold;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
          color: #000000;
        }

        .team-id {
          font-size: 10pt;
          margin-bottom: 12px;
          color: #000000;
        }

        /* Header Information Grid */
        .meta-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12px;
        }

        .meta-table td {
          border: 1px solid #e2e8f0;
          padding: 4px 8px;
          font-size: 9pt;
          vertical-align: top;
          color: #000000;
        }

        .col-left {
          width: 48%;
        }

        .col-mid {
          width: 16%;
          font-weight: normal;
        }

        .col-right {
          width: 36%;
        }

        /* Table of Line Items */
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 6px;
          margin-bottom: 20px;
        }

        .items-table th {
          background-color: #a6a6a6 !important;
          color: #000000;
          border: 1px solid #737373;
          padding: 6px 8px;
          text-align: left;
          font-size: 8.5pt;
          font-weight: normal;
        }

        .items-table td {
          border: 1px solid #d1d5db;
          padding: 6px 8px;
          font-size: 9pt;
          color: #000000;
        }

        .text-center {
          text-align: center;
        }

        .text-right {
          text-align: right;
        }

        .empty-row td {
          height: 20px;
        }

        /* Banking Details */
        .banking-block {
          margin-top: 8px;
          margin-bottom: 16px;
          font-size: 9pt;
          line-height: 1.5;
          color: #000000;
        }

        .banking-title {
          font-weight: normal;
          margin-bottom: 2px;
        }

        /* Bottom blank spreadsheet grid lines */
        .grid-footer {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        .grid-footer td {
          border: 1px solid #e2e8f0;
          height: 20px;
          width: 25%;
        }

        @media print {
          body {
            padding: 0;
            background: #ffffff !important;
          }
          .invoice-sheet {
            max-width: 100% !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-sheet">
        <h1 class="title">TAX INVOICE</h1>
        <div class="team-id">Team 234</div>

        <!-- Meta Two-Column Layout -->
        <table class="meta-table">
          <tr>
            <td class="col-left"></td>
            <td class="col-mid">Date:</td>
            <td class="col-right">${data.date}</td>
          </tr>
          <tr>
            <td class="col-left"></td>
            <td class="col-mid">Invoice #:</td>
            <td class="col-right">${data.invoiceNumber}</td>
          </tr>
          <tr>
            <td class="col-left">TMH 234</td>
            <td class="col-mid">Bill To:</td>
            <td class="col-right">${data.clientName}</td>
          </tr>
          <tr>
            <td class="col-left">1195 Mwazi street</td>
            <td class="col-mid"></td>
            <td class="col-right">${data.clientAddress1}</td>
          </tr>
          <tr>
            <td class="col-left">Mofolo Central</td>
            <td class="col-mid"></td>
            <td class="col-right">${data.clientAddress2}</td>
          </tr>
          <tr>
            <td class="col-left">1801</td>
            <td class="col-mid"></td>
            <td class="col-right">${data.clientAddress3}</td>
          </tr>
          <tr>
            <td class="col-left">0611615280</td>
            <td class="col-mid"></td>
            <td class="col-right">${data.clientPostalCode}</td>
          </tr>
          <tr>
            <td class="col-left">Not VAT Reg</td>
            <td class="col-mid"></td>
            <td class="col-right">${data.clientPhone}</td>
          </tr>
          <tr>
            <td class="col-left">Azoza Reference: ${data.referenceCode}</td>
            <td class="col-mid"></td>
            <td class="col-right">Vat number: ${data.clientVat}</td>
          </tr>
        </table>

        <!-- Line Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 20%;">Date</th>
              <th style="width: 10%; text-align: center;">Quantity</th>
              <th style="width: 25%;">Description</th>
              <th style="width: 15%; text-align: right;">Amount before VAT</th>
              <th style="width: 12%; text-align: right;">VAT</th>
              <th style="width: 18%; text-align: right;">Amount after VAT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${data.date}</td>
              <td class="text-center">1</td>
              <td>${data.serviceDesc}</td>
              <td class="text-right">${data.fareFormatted}</td>
              <td class="text-right">R0.00</td>
              <td class="text-right">${data.fareFormatted}</td>
            </tr>
            <tr class="empty-row">
              <td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="empty-row">
              <td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="empty-row">
              <td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
          </tbody>
        </table>

        <!-- Banking Details -->
        <div class="banking-block">
          <p class="banking-title">Banking details:</p>
          <p>First National Bank</p>
          <p>Account Holder Name: Kabelo Motlhale</p>
          <p>Account type: Current Account</p>
          <p>Account Number: 62474196302</p>
          <p>Branch Code: 258623</p>
        </div>

        <!-- Trailing Spreadsheet Rows -->
        <table class="grid-footer">
          <tr><td></td><td></td><td></td><td></td></tr>
          <tr><td></td><td></td><td></td><td></td></tr>
          <tr><td></td><td></td><td></td><td></td></tr>
          <tr><td></td><td></td><td></td><td></td></tr>
        </table>
      </div>
    </body>
    </html>
  `;
}

/**
 * Isolated print execution using an invisible iframe.
 * Ensures the website background is NEVER printed, and bypasses mobile popup blockers!
 */
export function printTaxInvoice(trip) {
  if (typeof window === 'undefined') return;

  const html = generateTaxInvoiceHtml(trip);

  // Remove existing print iframe if present
  const existingFrame = document.getElementById('tax-invoice-print-frame');
  if (existingFrame) {
    existingFrame.remove();
  }

  // Create an invisible iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'tax-invoice-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow || iframe.contentDocument;
  const docObj = doc.document || doc;

  docObj.open();
  docObj.write(html);
  docObj.close();

  // Trigger print cleanly once iframe loads
  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch {
      // Fallback: If iframe printing is restricted by the mobile browser, open clean window
      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.open();
        printWin.document.write(html);
        printWin.document.close();
        setTimeout(() => printWin.print(), 300);
      }
    }
  }, 350);
}
