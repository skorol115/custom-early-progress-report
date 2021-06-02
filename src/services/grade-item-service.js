import { EprRequests } from '../api/epr-requests';

export class GradeItemService {
	static async getGradeItems(orgUnitId) {
		const gradeItems = await EprRequests.getGradeItems(orgUnitId);
		return gradeItems;
	}
}
