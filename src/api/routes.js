const API_VERSION = '1.0';
const ORG_UNIT = '6606';
// TODO - get org unit id from back end
export class Routes {
	static NumUsers() { return `/d2l/api/customization/${API_VERSION}/${ORG_UNIT}/epr/users/count`; }
	static Users(pageNumber, pageSize, sortField, sortDesc) { return `/d2l/api/customization/${API_VERSION}/${ORG_UNIT}/epr/users?sort=${sortField}&desc=${sortDesc}&pageNumber=${pageNumber}&pageSize=${pageSize}`; }
}
