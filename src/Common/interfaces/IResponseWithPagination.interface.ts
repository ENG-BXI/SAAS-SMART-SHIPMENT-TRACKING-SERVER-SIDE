export interface IResponseWithPagination<T> {
  data: {
    data: T[];
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
