"use client";

import { useEffect, useRef } from "react";
import { drawCertificate, ensureFontsLoaded, CERT_WIDTH, CERT_HEIGHT } from "@/lib/drawCertificate";

// بيرسم الشهادة من جديد كل ما تتغير البيانات
export default function CertificatePreview({ data }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    ensureFontsLoaded(data.font).then(() => {
      if (cancelled || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, CERT_WIDTH, CERT_HEIGHT);
      drawCertificate(ctx, data);
    });
    return () => {
      cancelled = true;
    };
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      width={CERT_WIDTH}
      height={CERT_HEIGHT}
      className="w-full rounded-lg shadow-lg ring-1 ring-stone-200 dark:shadow-black/40 dark:ring-stone-700"
    />
  );
}
