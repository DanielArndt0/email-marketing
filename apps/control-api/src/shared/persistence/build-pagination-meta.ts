export type PaginationInput = {
  page: number;
  pageSize: number;
  total: number;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function buildPaginationMeta(input: PaginationInput): PaginationMeta {
  const totalPages =
    input.total === 0 ? 0 : Math.ceil(input.total / input.pageSize);

  return {
    page: input.page,
    pageSize: input.pageSize,
    total: input.total,
    totalPages,
  };
}
