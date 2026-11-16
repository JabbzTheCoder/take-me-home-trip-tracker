'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getInvoiceData, downloadTaxInvoicePdf } from '@/lib/invoice';

export default function StandaloneInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTrip() {
      try {
        const id = params?.id;
        if (!id) throw new Error('Missing trip ID');

        const res = await fetch(`/api/trips/${id}`);
        if (!res.ok) {
          throw new Error(`Failed to load trip: ${res.statusText}`);
        }
        const data = await res.json();
        setTrip(data);
      } catch (err) {
        setError(err.message || 'Error loading invoice');
      } finally {
        setLoading(false);
      }
    }

    loadTrip();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-sans p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-300 text-sm">Loading official Tax Invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-sans p-4">
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl max-w-md text-center">
          <div className="text-3xl mb-2">⚠️</div>
          <h2 className="text-lg font-bold text-rose-400 mb-2">Invoice Not Found</h2>
          <p className="text-slate-300 text-sm mb-4">{error || 'Could not find the requested trip record.'}</p>
          <button
            onClick={() => router.push('/')}
            className="btn btn-gold btn-sm"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const data = getInvoiceData(trip);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center">
      
      {/* Floating Action Header (Hidden in Print) */}
      <header className="w-full max-w-4xl px-4 py-3 bg-slate-900/90 border-b border-slate-800 sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 shadow-lg print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="btn btn-secondary btn-sm flex items-center gap-1.5"
          >
            <span>⬅️</span>
            <span>Dashboard</span>
          </button>
          <span className="text-sm font-bold text-white hidden sm:inline">
            TAX INVOICE #{data.invoiceNumber}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadTaxInvoicePdf(trip)}
            className="btn btn-emerald btn-sm flex items-center gap-1.5 font-bold"
            title="Download pure vector PDF"
          >
            <span>📥</span>
            <span>Download PDF</span>
          </button>

          <button
            onClick={() => window.print()}
            className="btn btn-gold btn-sm flex items-center gap-1.5 font-bold"
            title="Print or Save to Files via browser print"
          >
            <span>🖨️</span>
            <span>Print / Save PDF</span>
          </button>
        </div>
      </header>

      {/* Main Document Body */}
      <main className="w-full max-w-4xl p-3 sm:p-8 flex justify-center flex-1">
        <div 
          id="tax-invoice-print-container"
          className="w-full max-w-[760px] bg-white text-black p-4 sm:p-10 rounded-lg shadow-2xl font-sans overflow-x-auto print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full"
        >
          {/* Title */}
          <div className="mb-4">
            <h1 className="text-2xl sm:text-3xl font-black tracking-wide text-black m-0">TAX INVOICE</h1>
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
      </main>

    </div>
  );
}
