import { EprRequests } from '../api/epr-requests';

export class RecordService {
	static async createRecord(orgUnitId, userIds = []) {
		const redirectUrl = await EprRequests.createRecord(orgUnitId, userIds);
		return redirectUrl;
	}
}
