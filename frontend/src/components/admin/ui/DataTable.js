"use client";

import { useMemo, useState } from "react";
import { FiChevronDown, FiChevronUp, FiSearch } from "react-icons/fi";
import { fillTemplate } from "@/lib/template";
import { useTranslations } from "@/store/languageStore";

const DEFAULT_PAGE_SIZE = 10;

const cellValue = (column, row) => (column.sortValue ? column.sortValue(row) : row[column.key]);

function compare(a, b) {
  if (a == null) return b == null ? 0 : -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

const defaultSearchText = (columns) => (row) => columns.map((column) => row[column.key] ?? "").join(" ");

/**
 * Table with optional search, sortable columns and pagination.
 *
 * columns: [{ key, header, render?(row), sortable?, sortValue?(row), align?: "left"|"right"|"center", className? }]
 *
 * Client-side by default. Pass `pagination={{ page, pageSize, total, onPageChange }}`
 * when the server pages the data: `rows` is then the current page as given
 * (search and sort happen on the server too).
 */
export default function DataTable({
  columns,
  rows = [],
  rowKey = "id",
  searchable = false,
  searchText,
  pageSize = DEFAULT_PAGE_SIZE,
  loading = false,
  emptyText,
  toolbar,
  pagination,
}) {
  const t = useTranslations("admin.shell");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(null); // { key, direction: "ascending" | "descending" }
  const [page, setPage] = useState(1);

  const visibleRows = useMemo(() => {
    const textOf = searchText ?? defaultSearchText(columns);
    const needle = query.trim().toLowerCase();
    const matching = needle ? rows.filter((row) => textOf(row).toLowerCase().includes(needle)) : rows;
    if (!sort) return matching;
    const column = columns.find((c) => c.key === sort.key);
    const sign = sort.direction === "ascending" ? 1 : -1;
    return [...matching].sort((a, b) => sign * compare(cellValue(column, a), cellValue(column, b)));
  }, [rows, columns, query, sort, searchText]);

  const server = Boolean(pagination);
  const size = server ? pagination.pageSize : pageSize;
  const totalRows = server ? pagination.total : visibleRows.length;
  const pageCount = Math.max(1, Math.ceil(totalRows / size));
  const currentPage = server ? pagination.page : Math.min(page, pageCount);
  const start = (currentPage - 1) * size;
  const pageRows = server ? rows : visibleRows.slice(start, start + size);
  const goTo = server ? pagination.onPageChange : setPage;

  const toggleSort = (key) => {
    setSort((current) =>
      current?.key === key && current.direction === "ascending"
        ? { key, direction: "descending" }
        : { key, direction: "ascending" },
    );
  };

  const alignClass = (column) =>
    column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left";

  return (
    <div>
      {(searchable || toolbar) && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200">
          {searchable && (
            <label className="relative w-full sm:w-64">
              <span className="sr-only">{t("search")}</span>
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={t("search")}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 focus:border-[var(--admin-primary)]"
              />
            </label>
          )}
          {toolbar && <div className="flex flex-wrap items-center gap-2">{toolbar}</div>}
        </div>
      )}

      {loading ? (
        <div role="status" className="py-12 text-center text-sm text-slate-500">
          {t("loading")}
        </div>
      ) : pageRows.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-500">{emptyText ?? t("noData")}</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm admin-table">
              <thead>
                <tr>
                  {columns.map((column) => {
                    const sorted = sort?.key === column.key ? sort.direction : undefined;
                    return (
                      <th key={column.key} scope="col" aria-sort={sorted} className={alignClass(column)}>
                        {column.sortable ? (
                          <button
                            type="button"
                            onClick={() => toggleSort(column.key)}
                            className="inline-flex items-center gap-1 font-semibold uppercase tracking-wide bg-transparent border-none p-0 cursor-pointer text-inherit"
                          >
                            {column.header}
                            {sorted === "ascending" && <FiChevronUp aria-hidden="true" />}
                            {sorted === "descending" && <FiChevronDown aria-hidden="true" />}
                          </button>
                        ) : (
                          column.header
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, index) => (
                  <tr key={row[rowKey] ?? start + index}>
                    {columns.map((column) => (
                      <td key={column.key} className={`${alignClass(column)} ${column.className ?? ""}`}>
                        {column.render ? column.render(row) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 text-sm text-slate-600">
            <span>
              {fillTemplate(t("showing"), { from: start + 1, to: start + pageRows.length, total: totalRows })}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                className="admin-btn admin-btn-default admin-btn-sm"
                onClick={() => goTo(currentPage - 1)}
                disabled={currentPage === 1}
              >
                {t("previous")}
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-default admin-btn-sm"
                onClick={() => goTo(currentPage + 1)}
                disabled={currentPage === pageCount}
              >
                {t("next")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
