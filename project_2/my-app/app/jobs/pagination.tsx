
"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

export default function Pagination() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const currentPage = Number(searchParams.get("page")) || 1;
  const totalPages = 3;

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) {
      return;
    }
    const params = new URLSearchParams(
      searchParams.toString()
    );
    params.set("page", String(page));
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div>
      <p>الصفحة الحالية: {currentPage}</p>

      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        السابق
      </button>

      {[1, 2, 3].map((page) => (
        <button
          key={page}
          onClick={() => goToPage(page)}
          disabled={currentPage === page}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        التالي
      </button>
    </div>
  );
}
