function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export class GradeItemServiceDemo {

	static gradeItems = [
		{
			gradeItemId: 1,
			name: 'First Grade Item',
			isHidden: false
		},
		{
			gradeItemId: 2,
			name: 'Second Grade Item',
			isHidden: false
		},
		{
			gradeItemId: 3,
			name: 'Third Grade Item',
			isHidden: true
		}
	];

	static async getGradeItems() {
		await sleep(2000);
		return this.gradeItems;
	}
}
