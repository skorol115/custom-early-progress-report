import { EprRequests } from '../api/epr-requests';

export class UserService {
	static searchAllCriteria = false;

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

	static async getUsers(orgUnitId, pageNumber, pageSize, sortField = 0, sortDesc = false, gradeItemQueries = [], searchTerm = '') {
		const users = await EprRequests.getUsers(orgUnitId, pageNumber, pageSize, sortField, sortDesc, gradeItemQueries, searchTerm, +this.searchAllCriteria);
		return users;
	}

	static setSelectionCriteria(isAll) {
		this.searchAllCriteria = isAll;
		this.setUserPreferences();
	}

	static async setUserPreferences() {
		const response = await EprRequests.setPreferences(+this.searchAllCriteria);
		return response;
	}
}
