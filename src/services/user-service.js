import { EprRequests } from '../api/epr-requests';

export class UserService {
	static async getAllUsers(orgUnitId, gradeItemQueries = []) {
		const allUsers = await EprRequests.getAllUsers(orgUnitId, gradeItemQueries);
		return allUsers;
	}

	static async getNumUsers(orgUnitId, gradeItemQueries = []) {
		const numUsers = await EprRequests.getNumUsers(orgUnitId, gradeItemQueries);
		return numUsers;
	}

	static async getUsers(orgUnitId, pageNumber, pageSize, sortField = 0, sortDesc = false, gradeItemQueries = []) {
		const users = await EprRequests.getUsers(orgUnitId, pageNumber, pageSize, sortField, sortDesc, gradeItemQueries);
		return users;
	}
}
