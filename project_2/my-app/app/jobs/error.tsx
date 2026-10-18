
"use client";

import { useEffect } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({
  error,
  reset,
}: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main>
      <h2>حدث خطأ!</h2>

      <p>
        تعذّر تحميل الفواتير. حاول مرة أخرى.
      </p>

      <button onClick={() => reset()}>
        حاول مرة أخرى
      </button>
    </main>
  );
}
