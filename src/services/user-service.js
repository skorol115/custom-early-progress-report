import { EprRequests } from '../api/epr-requests';

export class UserService {

	static async getAllUsers(orgUnitId, gradeItemQueries = []) {
		const allUsers = await EprRequests.getAllUsers(orgUnitId, gradeItemQueries);
		return allUsers;
	}

	static async getNumUsers(orgUnitId, gradeItemQueries = [], searchTerm = '') {
		const numUsers = await EprRequests.getNumUsers(orgUnitId, gradeItemQueries, searchTerm);
		return numUsers;
	}

	static async getUserPreferences() {
		const preferences = await EprRequests.getPreferences();
		return preferences;
	}

	static async getUsers(orgUnitId, pageNumber, pageSize, sortField = 0, sortDesc = false, gradeItemQueries = [], searchTerm = '', isSearchAllCriteria) {
		const users = await EprRequests.getUsers(orgUnitId, pageNumber, pageSize, sortField, sortDesc, gradeItemQueries, searchTerm, +isSearchAllCriteria);
		return users;
	}

	static async setUserPreferences(isSearchAllCriteria) {
		const response = await EprRequests.setPreferences(+isSearchAllCriteria);
		return response;
	}
}
