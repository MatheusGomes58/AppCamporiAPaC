import React, { useEffect } from 'react';

export default function FotopIframeRedirect() {
  useEffect(() => {
    const newWindow = window.open(
      "https://txeira.fotop.com/fotos/eventos?evento=174905",
      "_blank",
      "noopener,noreferrer"
    );

    // Se o navegador bloqueou o pop-up, redireciona na mesma aba como fallback
    if (!newWindow) {
      window.location.href = "https://txeira.fotop.com/fotos/eventos?evento=174905";
    }
  }, []);

  return (
    <div className="p-6 text-center">
      <p>Abrindo galeria de fotos em nova aba...</p>
      <a
        className="underline text-blue-600"
        href="https://txeira.fotop.com/fotos/eventos?evento=174905"
        target="_blank"
        rel="noopener noreferrer"
      >
        Clique aqui se não abrir automaticamente
      </a>
    </div>
  );
}
