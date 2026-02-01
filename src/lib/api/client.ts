import type { ApiResponse } from './types';

export class Client {
	constructor(private baseUrl = '/api') {}

	async get<T>(path: string): Promise<ApiResponse<T>> {
		try {
			const res = await fetch(`${this.baseUrl}${path}`);
			if (!res.ok) {
				if (res.status === 401) {
					return { ok: false, status: 401, message: 'Session expired' };
				}
				const body = await res.json().catch(() => ({}));
				return { ok: false, status: res.status, message: body.message ?? 'Request failed' };
			}
			return { ok: true, data: await res.json() };
		} catch {
			return { ok: false, status: 0, message: 'Network error' };
		}
	}

	async post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
		try {
			const res = await fetch(`${this.baseUrl}${path}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			if (!res.ok) {
				if (res.status === 401) {
					return { ok: false, status: 401, message: 'Session expired' };
				}
				const body = await res.json().catch(() => ({}));
				return { ok: false, status: res.status, message: body.message ?? 'Request failed' };
			}
			return { ok: true, data: await res.json() };
		} catch {
			return { ok: false, status: 0, message: 'Network error' };
		}
	}

	async patch<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
		try {
			const res = await fetch(`${this.baseUrl}${path}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			if (!res.ok) {
				if (res.status === 401) {
					return { ok: false, status: 401, message: 'Session expired' };
				}
				const body = await res.json().catch(() => ({}));
				return { ok: false, status: res.status, message: body.message ?? 'Request failed' };
			}
			return { ok: true, data: await res.json() };
		} catch {
			return { ok: false, status: 0, message: 'Network error' };
		}
	}

	async put<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
		try {
			const res = await fetch(`${this.baseUrl}${path}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			if (!res.ok) {
				if (res.status === 401) {
					return { ok: false, status: 401, message: 'Session expired' };
				}
				const body = await res.json().catch(() => ({}));
				return { ok: false, status: res.status, message: body.message ?? 'Request failed' };
			}
			return { ok: true, data: await res.json() };
		} catch {
			return { ok: false, status: 0, message: 'Network error' };
		}
	}

	async delete<T>(path: string): Promise<ApiResponse<T>> {
		try {
			const res = await fetch(`${this.baseUrl}${path}`, {
				method: 'DELETE',
			});
			if (!res.ok) {
				if (res.status === 401) {
					return { ok: false, status: 401, message: 'Session expired' };
				}
				const body = await res.json().catch(() => ({}));
				return { ok: false, status: res.status, message: body.message ?? 'Request failed' };
			}
			return { ok: true, data: await res.json() };
		} catch {
			return { ok: false, status: 0, message: 'Network error' };
		}
	}
}

export const client = new Client();
