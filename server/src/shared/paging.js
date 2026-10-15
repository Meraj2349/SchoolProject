// Page and page size from query strings, with safe defaults and a cap.
const positiveInteger = (value) => {
  const number = Number.parseInt(value, 10);
  return Number.isInteger(number) && number > 0 ? number : null;
};

export function toPage({ page, pageSize } = {}, { defaultPageSize = 25, maxPageSize = 100 } = {}) {
  const size = Math.min(positiveInteger(pageSize) ?? defaultPageSize, maxPageSize);
  const number = positiveInteger(page) ?? 1;
  return { page: number, pageSize: size, offset: (number - 1) * size };
}
