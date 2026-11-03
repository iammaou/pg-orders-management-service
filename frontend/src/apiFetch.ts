import Cookies from 'js-cookie';

export const apiUrl = "http://localhost:8080/api/Order";

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    return fetch(`${apiUrl}/${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': Cookies.get('x-api-key') ?? '',
            ...options.headers,
        }
    });
}