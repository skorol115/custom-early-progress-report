const API_VERSION = '1.0';
export class Routes {
	static AllUsers(orgUnitId) { return `/d2l/api/customization/${API_VERSION}/${orgUnitId}/epr/users`; }
	static GradeItems(orgUnitId) { return `/d2l/api/customization/${API_VERSION}/${orgUnitId}/epr/gradeitems`; }
	static NumUsers(orgUnitId) { return `/d2l/api/customization/${API_VERSION}/${orgUnitId}/epr/users/count`; }
	static Users(orgUnitId, pageNumber, pageSize, sortField, sortDesc) { return `/d2l/api/customization/${API_VERSION}/${orgUnitId}/epr/users?sort=${sortField}&desc=${sortDesc}&pageNumber=${pageNumber}&pageSize=${pageSize}`; }
}
