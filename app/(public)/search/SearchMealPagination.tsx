"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/shared/Pagination";

interface SearchMealPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function SearchMealPagination({
  currentPage,
  totalPages,
}: SearchMealPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    return `/search${params.toString() ? `?${params.toString()}` : ""}`;
  };

  const handlePageChange = (page: number) => {
    router.push(buildUrl(page), { scroll: false });
  };

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  );
}
