export interface IResponseWithPagination {
  data: {
    data: unknown;
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  message: string;
  status: number;
}
