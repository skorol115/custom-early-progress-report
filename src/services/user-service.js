import { EprRequests } from '../api/epr-requests';

export class UserService {
	static async getUsers(pageNumber, pageSize, sortField = 0, sortDesc = false) {
		const users = await EprRequests.getUsers(pageNumber, pageSize, sortField, sortDesc);
		return users;
	}

	static async getNumUsers() {
		const numUsers = await EprRequests.getNumUsers();
		return numUsers;
	}
}
