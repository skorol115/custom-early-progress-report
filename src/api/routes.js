const API_VERSION = '1.0';
export class Routes {
	static AllUsers(orgUnitId, isSearchAllCriteria) { return `/d2l/api/customization/${API_VERSION}/${orgUnitId}/epr/users?searchOption=${isSearchAllCriteria}`; }
	static GradeItems(orgUnitId) { return `/d2l/api/customization/${API_VERSION}/${orgUnitId}/epr/gradeitems`; }
	static NumUsers(orgUnitId, searchTerm, isSearchAllCriteria) { return `/d2l/api/customization/${API_VERSION}/${orgUnitId}/epr/users/count?${searchTerm ? `searchTerm=${searchTerm}` : ''}&searchOption=${isSearchAllCriteria}`; }
	static Preferences() { return `/d2l/api/customization/${API_VERSION}/epr/userpreferences`; }
	static Records(orgUnitId) { return `/d2l/api/customization/${API_VERSION}/${orgUnitId}/epr/records`; }
	static Users(orgUnitId, pageNumber, pageSize, sortField, sortDesc, searchTerm, isSearchAllCriteria) { return `/d2l/api/customization/${API_VERSION}/${orgUnitId}/epr/users?sort=${sortField}&desc=${sortDesc}&pageNumber=${pageNumber}&pageSize=${pageSize}${searchTerm ? `&searchTerm=${searchTerm}` : ''}&searchOption=${isSearchAllCriteria}`; }
}
