export interface ApiResponse<T = unknown> {
    success: boolean
    message: string
    data: T
    errors?: Record<string, string[]> | null
}

export interface ApiErrorResponse {
    success: false
    detail: string
    errors?: Record<string, string[]> | null
    statusCode?: number
    error: {
    code: string
    message: string
  }
}

export interface PaginatedResponse<T> {
    items: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}