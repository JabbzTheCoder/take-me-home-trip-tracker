// lib/voucher.js - Re-routes print requests to official Tax Invoice template
import { printTaxInvoice, downloadTaxInvoicePdf, getInvoiceData } from './invoice.js';

export function printTripVoucher(trip) {
  return printTaxInvoice(trip);
}

export { printTaxInvoice, downloadTaxInvoicePdf, getInvoiceData };
