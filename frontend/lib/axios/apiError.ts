import { AxiosError } from 'axios'
import { ApiErrorResponse } from '@/types/api.types'

export class ApiError extends Error {
    public statusCode?: number
    public errors?: Record<string, string[]> | null

    constructor(message: string, statusCode?: number, errors?: Record<string, string[]> | null) {
        super(message)
        this.name = 'ApiError'
        this.statusCode = statusCode
        this.errors = errors
    }
}

export function normalizeAxiosError(error: unknown): ApiError {
    if (error instanceof AxiosError) {
        const responseData = error.response?.data as ApiErrorResponse | undefined

        const message =
            responseData?.message ||
            error.message ||
            'Something went wrong. Please try again.'

        return new ApiError(message, error.response?.status, responseData?.errors)
    }

    if (error instanceof Error) {
        return new ApiError(error.message)
    }

    return new ApiError('An unknown error occurred')
}