'use client';

import React from 'react';
import { getInvoiceData, downloadTaxInvoicePdf } from '@/lib/invoice';

export default function TaxInvoiceModal({ trip, isOpen, onClose }) {
  if (!isOpen || !trip) return null;

  const data = getInvoiceData(trip);

  const handleDownloadPdf = () => {
    downloadTaxInvoicePdf(trip);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-3xl my-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header & Actions Bar */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-800/90 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Tax Invoice</span>
                <span className="text-amber-400 font-mono text-sm sm:text-base">#{data.invoiceNumber}</span>
              </h2>
              <p className="text-xs text-slate-400">Official Company Template &bull; {data.clientName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="btn btn-emerald btn-sm flex items-center gap-1.5 shadow-md font-bold px-3 py-1.5"
              title="Download official PDF directly to your device"
            >
              <span>📥</span>
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors ml-1"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="sm:hidden bg-amber-500/10 border-b border-amber-500/20 px-3 py-1.5 text-center text-xs text-amber-300 font-medium">
          📱 Swipe horizontally on invoice below to view full columns
        </div>

        {/* Paper Sheet Preview Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-950 flex justify-center">
          <div className="w-full max-w-[720px] bg-white text-black p-4 sm:p-8 rounded-lg shadow-xl overflow-x-auto select-text font-sans">
            
            {/* Title Block */}
            <div className="mb-4">
              <h1 className="text-xl sm:text-2xl font-black tracking-wide text-black m-0">TAX INVOICE</h1>
              <div className="text-sm font-semibold text-black mt-1">Team 234</div>
            </div>

            {/* Meta Information Grid matching template spreadsheet */}
            <table className="w-full border-collapse mb-4 text-xs sm:text-sm">
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-1.5 w-[45%]"></td>
                  <td className="border border-slate-300 p-1.5 w-[18%] font-semibold text-slate-800">Date:</td>
                  <td className="border border-slate-300 p-1.5 w-[37%] font-mono">{data.date}</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1.5"></td>
                  <td className="border border-slate-300 p-1.5 font-semibold text-slate-800">Invoice #:</td>
                  <td className="border border-slate-300 p-1.5 font-mono font-bold">{data.invoiceNumber}</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1.5 font-semibold text-slate-900">TMH 234</td>
                  <td className="border border-slate-300 p-1.5 font-semibold text-slate-800">Bill To:</td>
                  <td className="border border-slate-300 p-1.5 font-bold text-slate-900">{data.clientName}</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1.5">1195 Mwazi street</td>
                  <td className="border border-slate-300 p-1.5"></td>
                  <td className="border border-slate-300 p-1.5">{data.clientAddress1}</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1.5">Mofolo Central</td>
                  <td className="border border-slate-300 p-1.5"></td>
                  <td className="border border-slate-300 p-1.5">{data.clientAddress2}</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1.5">1801</td>
                  <td className="border border-slate-300 p-1.5"></td>
                  <td className="border border-slate-300 p-1.5">{data.clientAddress3}</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1.5">0611615280</td>
                  <td className="border border-slate-300 p-1.5"></td>
                  <td className="border border-slate-300 p-1.5">{data.clientPostalCode}</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1.5 font-medium">Not VAT Reg</td>
                  <td className="border border-slate-300 p-1.5"></td>
                  <td className="border border-slate-300 p-1.5 font-mono">{data.clientPhone}</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1.5 font-mono text-[11px] sm:text-xs">
                    Azoza Reference: {data.referenceCode}
                  </td>
                  <td className="border border-slate-300 p-1.5"></td>
                  <td className="border border-slate-300 p-1.5 font-mono text-[11px] sm:text-xs">
                    Vat number: {data.clientVat}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Line Items Table */}
            <div className="overflow-x-auto mb-5">
              <table className="w-full min-w-[540px] border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#a6a6a6] text-black">
                    <th className="border border-[#737373] p-1.5 text-left font-semibold w-[22%]">Date</th>
                    <th className="border border-[#737373] p-1.5 text-center font-semibold w-[12%]">Quantity</th>
                    <th className="border border-[#737373] p-1.5 text-left font-semibold w-[26%]">Description</th>
                    <th className="border border-[#737373] p-1.5 text-right font-semibold w-[16%]">Amount before VAT</th>
                    <th className="border border-[#737373] p-1.5 text-right font-semibold w-[10%]">VAT</th>
                    <th className="border border-[#737373] p-1.5 text-right font-semibold w-[14%]">Amount after VAT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 p-1.5 font-mono">{data.date}</td>
                    <td className="border border-slate-300 p-1.5 text-center font-mono">1</td>
                    <td className="border border-slate-300 p-1.5">{data.serviceDesc}</td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono font-medium">{data.fareFormatted}</td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono">R0.00</td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono font-bold">{data.fareFormatted}</td>
                  </tr>
                  {/* Empty Spreadsheet Rows */}
                  {[1, 2, 3].map((idx) => (
                    <tr key={idx} className="h-6">
                      <td className="border border-slate-200 p-1.5"></td>
                      <td className="border border-slate-200 p-1.5"></td>
                      <td className="border border-slate-200 p-1.5"></td>
                      <td className="border border-slate-200 p-1.5"></td>
                      <td className="border border-slate-200 p-1.5"></td>
                      <td className="border border-slate-200 p-1.5"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Banking Details Block */}
            <div className="mb-4 text-xs sm:text-sm leading-relaxed text-slate-900">
              <div className="font-semibold text-black mb-0.5">Banking details:</div>
              <div>First National Bank</div>
              <div>Account Holder Name: Kabelo Motlhale</div>
              <div>Account type: Current Account</div>
              <div className="font-semibold">
                Account Number: <span className="font-mono tracking-wider font-bold">62474196302</span>
              </div>
              <div className="font-semibold">
                Branch Code: <span className="font-mono tracking-wider font-bold">258623</span>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Action Footer for Mobile & Quick Actions */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400 hidden sm:block">
            Generates pure vector PDF formatted exactly as official template.
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="btn btn-emerald btn-sm flex-1 sm:flex-initial flex items-center justify-center gap-1.5 font-bold"
            >
              <span>📥</span>
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-sm"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
