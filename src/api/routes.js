const API_VERSION = '1.0';

export class Routes {
	static NumUsers() { return `/d2l/api/customization/${API_VERSION}/epr/users`; }
	static Users(pageNumber, pageSize, sortField, sortDesc) { return `/d2l/api/customization/${API_VERSION}/epr/users?sort=${sortField}&desc=${sortDesc}&pageNumber=${pageNumber}&pageSize=${pageSize}`; }
}
