// Required env vars (all optional — email is silently disabled when SMTP_HOST is unset):
//   SMTP_HOST     — e.g. "smtp.gmail.com" or "localhost"
//   SMTP_PORT     — defaults to 587
//   SMTP_USER     — SMTP username; also used as the From address
//   SMTP_PASS     — Gmail App Password (not your account password)
//   APP_BASE_URL  — used for deep links in emails, defaults to "http://localhost:3000"

import nodemailer from "nodemailer";
import supplierEmails from "../data/supplier-emails.json";

const APP_BASE_URL = process.env.APP_BASE_URL ?? "http://localhost:3000";

export function getSupplierEmail(supplierId: string): string | undefined {
  return (supplierEmails as Record<string, string>)[supplierId];
}

function createTransport() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    auth:
      process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? "" }
        : undefined,
  });
}

export async function sendMail(to: string, subject: string, html: string): Promise<void> {
  const transport = createTransport();
  if (!transport) return;
  const from = process.env.SMTP_USER ?? "noreply@skola.example";
  await transport.sendMail({ from, to, subject, html });
}

export function buildRequestEmail(opts: {
  supplierName: string;
  kidLabels: string[];
  requestId: string;
  kidIds: string[];
  dueDate?: string;
  note?: string;
  isReminder: boolean;
}): { subject: string; html: string } {
  const firstName = opts.supplierName.split(" ")[0];

  const baseSubject = opts.isReminder
    ? "Påminnelse: obesvarad förfrågan om observation"
    : "Ny förfrågan om observation";
  const subject = `${firstName}: ${baseSubject}`;

  const intro = opts.isReminder
    ? `<p>Hej ${opts.supplierName},</p><p>Det här är en påminnelse om att du har en obesvarad förfrågan.</p>`
    : `<p>Hej ${opts.supplierName},</p><p>Du har fått en ny förfrågan om observation.</p>`;

  const kidLinks = opts.kidIds
    .map(
      (kidId, i) =>
        `<li><a href="${APP_BASE_URL}/supplier/requests/${opts.requestId}/kids/${kidId}">${opts.kidLabels[i] ?? kidId}</a></li>`
    )
    .join("");

  const dueLine = opts.dueDate
    ? `<p><strong>Sista svarsdatum:</strong> ${opts.dueDate}</p>`
    : "";

  const noteLine = opts.note ? `<p><em>${opts.note}</em></p>` : "";

  const html = `${intro}${dueLine}${noteLine}<p>Elever att observera:</p><ul>${kidLinks}</ul>`;
  return { subject, html };
}
