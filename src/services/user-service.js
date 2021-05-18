import { EprRequests } from '../api/epr-requests';

export class UserService {
	static async getUsers(pageNumber, pageSize) {
		const users = await EprRequests.getUsers(pageNumber, pageSize);
		return users;
	}

	static async getNumUsers() {
		const numUsers = await EprRequests.getNumUsers();
		return numUsers;
	}
}
