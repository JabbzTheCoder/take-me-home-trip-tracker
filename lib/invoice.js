// lib/invoice.js - Official TMH Tax Invoice Generator Matching Company Template

export function printTaxInvoice(trip) {
  if (!trip) return;

  const printWin = window.open('', '_blank', 'width=880,height=960');
  if (!printWin) {
    window.print();
    return;
  }

  const tripDate = trip.date || new Date().toISOString().split('T')[0];
  const invoiceNum = trip.invoiceNumber || '371';
  const fare = parseFloat(trip.fare) || 450.00;
  const fareFormatted = `R${fare.toFixed(2)}`;
  const clientName = trip.clientName || 'Azoza';
  const clientPhone = trip.clientPhone || '0119919000/8000';
  const refCode = `26-0515534-U-${(trip._id || trip.id || '01').toString().slice(-2).toUpperCase()}`;

  // Description based on trip service
  const serviceDesc = trip.type === 'chauffeur' 
    ? 'Call-out (Chauffeur Service)' 
    : 'Call-out';

  const invoiceHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Tax_Invoice_${invoiceNum}_${clientName.replace(/\s+/g, '_')}</title>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        @page {
          size: A4 portrait;
          margin: 15mm 15mm 15mm 15mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: Arial, Helvetica, sans-serif;
          background: #ffffff;
          color: #000000;
          font-size: 11pt;
          line-height: 1.35;
          padding: 20px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .invoice-container {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
        }

        /* Top Title */
        .title {
          font-size: 18pt;
          font-weight: bold;
          margin-bottom: 24px;
          letter-spacing: 0.5px;
        }

        /* Main Grid Structure */
        .grid-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }

        .grid-table td, .grid-table th {
          border: 1px solid #d1d5db;
          padding: 6px 10px;
          vertical-align: top;
          font-size: 9.5pt;
        }

        .no-border {
          border: none !important;
        }

        /* Header Info Layout matching the template spreadsheet exactly */
        .info-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12px;
        }

        .info-table td {
          border: 1px solid #e2e8f0;
          padding: 5px 8px;
          font-size: 9.5pt;
          vertical-align: top;
        }

        .col-left {
          width: 38%;
        }

        .col-mid {
          width: 14%;
          font-weight: normal;
        }

        .col-right {
          width: 48%;
        }

        .empty-cell {
          height: 18px;
        }

        /* Line Items Table */
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
          margin-bottom: 24px;
        }

        .items-table th {
          background-color: #a6a6a6 !important;
          color: #000000;
          border: 1px solid #737373;
          padding: 7px 8px;
          text-align: left;
          font-size: 9.5pt;
          font-weight: normal;
        }

        .items-table td {
          border: 1px solid #d1d5db;
          padding: 8px;
          font-size: 9.5pt;
        }

        .text-center {
          text-align: center;
        }

        .text-right {
          text-align: right;
        }

        /* Banking details block */
        .banking-section {
          margin-top: 10px;
          font-size: 9.5pt;
          line-height: 1.5;
        }

        .banking-title {
          font-weight: normal;
          margin-bottom: 3px;
        }

        .bank-bold {
          font-weight: bold;
        }

        /* Printable Sheet Lines at the Bottom (Matching template rows) */
        .blank-grid {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }

        .blank-grid td {
          border: 1px solid #e2e8f0;
          height: 22px;
        }

        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        
        <!-- Document Heading -->
        <h1 class="title">TAX INVOICE</h1>

        <!-- Header Two-Column Grid matching exactly the invoice template -->
        <table class="info-table">
          <tr>
            <td class="col-left" style="font-weight: normal;">Team 234</td>
            <td class="col-mid"></td>
            <td class="col-right"></td>
          </tr>
          <tr>
            <td class="col-left"></td>
            <td class="col-mid">Date:</td>
            <td class="col-right">${tripDate}</td>
          </tr>
          <tr>
            <td class="col-left"></td>
            <td class="col-mid">Invoice #:</td>
            <td class="col-right">${invoiceNum}</td>
          </tr>
          <tr>
            <td class="col-left">TMH 234</td>
            <td class="col-mid">Bill To:</td>
            <td class="col-right" style="font-weight: normal;">${clientName}</td>
          </tr>
          <tr>
            <td class="col-left">1195 Mwazi street</td>
            <td class="col-mid"></td>
            <td class="col-right">${trip.dropoff || '4 Ellis Road'}</td>
          </tr>
          <tr>
            <td class="col-left">Mofolo Central</td>
            <td class="col-mid"></td>
            <td class="col-right">Block E, 4th Floor</td>
          </tr>
          <tr>
            <td class="col-left">1801</td>
            <td class="col-mid"></td>
            <td class="col-right">Constantia Kloof</td>
          </tr>
          <tr>
            <td class="col-left">0611615280</td>
            <td class="col-mid"></td>
            <td class="col-right">1709</td>
          </tr>
          <tr>
            <td class="col-left">Not VAT Reg</td>
            <td class="col-mid"></td>
            <td class="col-right">${clientPhone}</td>
          </tr>
          <tr>
            <td class="col-left">Azoza Reference: ${refCode}</td>
            <td class="col-mid"></td>
            <td class="col-right">Vat number: 4530125071</td>
          </tr>
        </table>

        <!-- Line Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 25%;">Date</th>
              <th style="width: 10%; text-align: center;">Quantity</th>
              <th style="width: 25%;">Description</th>
              <th style="width: 15%; text-align: right;">Amount before VAT</th>
              <th style="width: 10%; text-align: right;">VAT</th>
              <th style="width: 15%; text-align: right;">Amount after VAT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${tripDate}</td>
              <td class="text-center">1</td>
              <td>${serviceDesc}</td>
              <td class="text-right">${fareFormatted}</td>
              <td class="text-right">R0.00</td>
              <td class="text-right">${fareFormatted}</td>
            </tr>
            <tr>
              <td class="empty-cell"></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td class="empty-cell"></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <!-- Banking Details Block -->
        <div class="banking-section">
          <p class="banking-title">Banking details:</p>
          <p>First National Bank</p>
          <p>Account Holder Name: Kabelo Motlhale</p>
          <p>Account type: Current Account</p>
          <p>Account Number: <span class="bank-bold">62474196302</span></p>
          <p>Branch Code: <span class="bank-bold">258623</span></p>
        </div>

        <!-- Blank Spreadsheet Template Rows at the bottom (matching image grid) -->
        <table class="blank-grid">
          <tr><td></td><td></td><td></td><td></td></tr>
          <tr><td></td><td></td><td></td><td></td></tr>
          <tr><td></td><td></td><td></td><td></td></tr>
          <tr><td></td><td></td><td></td><td></td></tr>
        </table>

      </div>

      <script>
        window.addEventListener('load', () => {
          setTimeout(() => {
            window.print();
          }, 250);
        });
      </script>
    </body>
    </html>
  `;

  printWin.document.open();
  printWin.document.write(invoiceHtml);
  printWin.document.close();
}
