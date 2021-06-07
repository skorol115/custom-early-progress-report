import { SortableColumnLookup } from '../constants';

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export class UserServiceDemo {

	static users = [
		{
			UserId: 1,
			LastName: 'Sauce',
			FirstName: 'Apple',
			OrgDefinedId: '2.Apple.Sauce',
			SectionName: 'Snack',
			LastCourseHomepageAccess: '2021-06-01T19:57:39.290Z',
			Grades: {
				50: 0.1,
				51: 0.6,
				52: 0.9
			}
		},
		{
			UserId: 2,
			LastName: 'Foster',
			FirstName: 'Bananas',
			OrgDefinedId: '1.Bananas.Foster',
			SectionName: 'Dessert',
			LastCourseHomepageAccess: null,
			Grades: {
				50: 0.0,
				51: 1.0,
				52: 0.5
			}
		},
		{
			UserId: 3,
			LastName: 'Pie',
			FirstName: 'Cherry',
			OrgDefinedId: null,
			SectionName: 'Dessert',
			LastCourseHomepageAccess: '2021-06-01T19:57:39.290Z',
			Grades: {
				50: 0.8,
				51: 0.2,
				52: null
			}
		}
	];

	static async getNumUsers() {
		return this.users.length;
	}

	static async getUsers(orgUnitId, pageNumber, pageSize, sortField = 0, sortDesc = false) {
		await sleep(2000);
		return this.users.sort((a, b) => {

			const aVal = a[SortableColumnLookup[sortField]];
			const bVal = b[SortableColumnLookup[sortField]];

			if (aVal > bVal || bVal === null) {
				return sortDesc ? -1 : 1;
			} else if (aVal < bVal || aVal === null) {
				return sortDesc ? 1 : -1;
			} else {
				return 0;
			}
		});
	}
}
