function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export class GradeItemServiceDemo {

	static gradeItems = [
		{
			GradeItemId: 1,
			Name: 'First Grade Item',
			IsHidden: false
		},
		{
			GradeItemId: 2,
			Name: 'Second Grade Item',
			IsHidden: false
		},
		{
			GradeItemId: 3,
			Name: 'Third Grade Item',
			IsHidden: true
		}
	];

	static async getGradeItems() {
		await sleep(100);
		return this.gradeItems;
	}
}
