"use client";

import { QRCodeSVG } from "qrcode.react";

// CAMBIA este numero por el de tu WhatsApp (lada 52 + 10 digitos, sin espacios ni +)
const WHATSAPP = "525618978630";

export default function QrFacturacion({
  folio,
  total,
  cliente,
}: {
  folio: string;
  total: number;
  cliente: string;
}) {
  const totalFmt = total.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });

  const mensaje =
    `🔧 ¡Hola! Le comparto la cotización de Comercializadora Peja 🧾\n\n` +
    `📋 Folio: #${folio}\n` +
    `💰 Total: ${totalFmt}\n` +
    `🏢 Cliente: ${cliente}\n\n` +
    `En caso de requerir factura, le pedimos nos comparta sus datos fiscales 👇\n` +
    `RFC:\n` +
    `Razón social:\n` +
    `Uso de CFDI:\n` +
    `Código postal:\n\n` +
    `¡Quedamos a sus órdenes! 🔩`;

  const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

  return (
    <div className="flex items-center gap-4 rounded-lg border border-[var(--peja-gris)] p-3">
      <QRCodeSVG value={url} size={90} />
      <div className="text-xs text-[var(--peja-pizarra)]">
        <div className="mb-1 font-bold text-[var(--peja-azul)]">
          ¿Requiere factura?
        </div>
        <div>Escanee el código QR con su celular</div>
        <div>y envíenos sus datos fiscales por WhatsApp.</div>
      </div>
    </div>
  );
}