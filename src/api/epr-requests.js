import { Routes } from './routes';

export class EprRequests {

	// API Routes
	static async getAllUsers(orgUnitId, gradeItemQueries) {
		return await this._post(Routes.AllUsers(orgUnitId), JSON.stringify(gradeItemQueries)).then(r => r.json());
	}

	static async getGradeItems(orgUnitId) {
		return await this._get(Routes.GradeItems(orgUnitId));
	}

	static async getNumUsers(orgUnitId, gradeItemQueries) {
		return await this._post(Routes.NumUsers(orgUnitId), JSON.stringify(gradeItemQueries)).then(r => r.json());
	}

	static async getUsers(orgUnitId, pageNumber, pageSize, sortField, sortDesc, gradeItemQueries) {
		return await this._post(Routes.Users(orgUnitId, pageNumber, pageSize, sortField, sortDesc), JSON.stringify(gradeItemQueries)).then(r => r.json());
	}

	// Helper Methods

	static get _xsrfToken() {
		return  D2L && D2L.LP && D2L.LP.Web && D2L.LP.Web.Authentication &&
		D2L.LP.Web.Authentication.Xsrf &&
		D2L.LP.Web.Authentication.Xsrf.GetXsrfToken &&
		D2L.LP.Web.Authentication.Xsrf.GetXsrfToken() || '';
	}

	static async _fetch(url, options) {
		return await fetch(url, options)
			.then(response => {
				if (!response.ok) {
					throw Error(response.statusText);
				}
				return response;
			});
	}

	static _get(url) {
		const options = this._options('GET');
		return this._fetch(url, options).then(r => r.json());
	}

	static _options(method) {
		return {
			credentials: 'include',
			headers: new Headers({
				'Access-Control-Allow-Origin': '*',
				'X-Csrf-Token': this._xsrfToken
			}),
			method: method,
			mode: 'cors',
		};
	}

	static _post(url, body) {
		const options = this._options('POST');
		options.body = body;
		return this._fetch(url, options);
	}

	static _put(url, body) {
		const options = this._options('PUT');
		options.body = body;
		return this._fetch(url, options);
	}

}
