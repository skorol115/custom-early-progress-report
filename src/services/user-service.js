import { EprRequests } from '../api/epr-requests';

export class UserService {
	static async getNumUsers(orgUnitId) {
		const numUsers = await EprRequests.getNumUsers(orgUnitId);
		return numUsers;
	}

	static async getUsers(orgUnitId, pageNumber, pageSize, sortField = 0, sortDesc = false) {
		const users = await EprRequests.getUsers(orgUnitId, pageNumber, pageSize, sortField, sortDesc);
		return users;
	}
}
