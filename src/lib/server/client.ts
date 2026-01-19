import { env } from '$env/dynamic/private';
import type { FetchFn, ApiResponse } from '$lib/api/types';

export class ServerClient {
	constructor(private fetch: FetchFn) {}

	async get<T>(path: string, query?: URLSearchParams): Promise<ApiResponse<T>> {
		const url = query ? `${env.BACKEND_URL}${path}?${query}` : `${env.BACKEND_URL}${path}`;

		try {
			const res = await this.fetch(url);
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				return { ok: false, status: res.status, message: body.message ?? 'Request failed' };
			}
			return { ok: true, data: await res.json() };
		} catch {
			return { ok: false, status: 502, message: 'Backend unavailable' };
		}
	}

	async post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
		try {
			const res = await this.fetch(`${env.BACKEND_URL}${path}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				return { ok: false, status: res.status, message: data.message ?? 'Request failed' };
			}
			return { ok: true, data: await res.json() };
		} catch {
			return { ok: false, status: 502, message: 'Backend unavailable' };
		}
	}

	async patch<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
		try {
			const res = await this.fetch(`${env.BACKEND_URL}${path}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				return { ok: false, status: res.status, message: data.message ?? 'Request failed' };
			}
			return { ok: true, data: await res.json() };
		} catch {
			return { ok: false, status: 502, message: 'Backend unavailable' };
		}
	}

	async delete<T>(path: string): Promise<ApiResponse<T>> {
		try {
			const res = await this.fetch(`${env.BACKEND_URL}${path}`, {
				method: 'DELETE',
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				return { ok: false, status: res.status, message: data.message ?? 'Request failed' };
			}
			return { ok: true, data: await res.json() };
		} catch {
			return { ok: false, status: 502, message: 'Backend unavailable' };
		}
	}
}

export function createServerClient(fetch: FetchFn) {
	return new ServerClient(fetch);
}
