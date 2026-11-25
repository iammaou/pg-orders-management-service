import Cookies from 'js-cookie';

export const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/Order';
export const historyUrl = import.meta.env.VITE_API_HISTORY_URL || 'http://localhost:8080/api/History';

export const apiFetch = async (endpoint: string, options: RequestInit = {}, history: boolean) => {
    return fetch(`${history ? historyUrl : apiUrl}${endpoint ? "/" : ""}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': Cookies.get('x-api-key') ?? '',
            ...options.headers,
        }
    });
}