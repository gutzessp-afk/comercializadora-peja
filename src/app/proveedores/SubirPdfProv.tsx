"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SubirPdfProv({
  onSubido,
}: {
  onSubido: (url: string) => void;
}) {
  const [subiendo, setSubiendo] = useState(false);
  const [nombre, setNombre] = useState("");

  async function subir(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    const ruta = `prov-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const { error } = await supabase.storage.from("comprobantes").upload(ruta, file);
    if (!error) {
      const { data } = supabase.storage.from("comprobantes").getPublicUrl(ruta);
      setNombre(file.name);
      onSubido(data.publicUrl);
    }
    setSubiendo(false);
  }

  return (
    <div className="rounded-lg border-2 border-dashed border-[var(--peja-gris)] p-3 text-center">
      <input id="pdf-prov" type="file" accept="application/pdf,image/*" onChange={subir} className="hidden" />
      <label htmlFor="pdf-prov" className="cursor-pointer text-xs font-semibold text-[var(--peja-azul)]">
        {subiendo ? "Subiendo..." : nombre ? `✓ ${nombre}` : "Subir PDF de la factura (opcional)"}
      </label>
    </div>
  );
}