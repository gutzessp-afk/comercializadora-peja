"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SubirPdf({
  onSubido,
}: {
  onSubido: (url: string) => void;
}) {
  const [subiendo, setSubiendo] = useState(false);
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");

  async function subir(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    setError("");
    const ruta = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const { error: errUp } = await supabase.storage
      .from("comprobantes")
      .upload(ruta, file);
    if (errUp) {
      setError("Error al subir: " + errUp.message);
      setSubiendo(false);
      return;
    }
    const { data } = supabase.storage.from("comprobantes").getPublicUrl(ruta);
    setNombre(file.name);
    onSubido(data.publicUrl);
    setSubiendo(false);
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-[var(--peja-gris)] bg-white p-6 text-center">
      <input
        id="pdf-input"
        type="file"
        accept="application/pdf,image/*"
        onChange={subir}
        className="hidden"
      />
      <label
        htmlFor="pdf-input"
        className="cursor-pointer text-sm font-semibold text-[var(--peja-azul)]"
      >
        {subiendo
          ? "Subiendo..."
          : nombre
          ? `✓ ${nombre} (clic para cambiar)`
          : "Clic para subir el PDF de la factura/remision"}
      </label>
      <p className="mt-1 text-xs text-[var(--peja-pizarra)]">
        PDF o imagen del comprobante del proveedor
      </p>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}