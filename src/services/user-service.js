import { EprRequests } from '../api/epr-requests';

export class UserService {

	static async getAllUsers(orgUnitId, gradeItemQueries = [], searchOption = 0) {
		const allUsers = await EprRequests.getAllUsers(orgUnitId, gradeItemQueries, searchOption);
		return allUsers;
	}

	static async getNumUsers(orgUnitId, gradeItemQueries = [], searchTerm = '', searchOption = 0) {
		const numUsers = await EprRequests.getNumUsers(orgUnitId, gradeItemQueries, searchTerm, searchOption);
		return numUsers;
	}

	static async getUserPreferences() {
		const preferences = await EprRequests.getPreferences();
		return preferences;
	}

	static async getUsers(orgUnitId, pageNumber, pageSize, sortField = 0, sortDesc = false, gradeItemQueries = [], searchTerm = '', searchOption = 0) {
		const users = await EprRequests.getUsers(orgUnitId, pageNumber, pageSize, sortField, sortDesc, gradeItemQueries, searchTerm, searchOption);
		return users;
	}

	static async setUserPreferences(searchOption) {
		const response = await EprRequests.setPreferences(searchOption);
		return response;
	}
}
