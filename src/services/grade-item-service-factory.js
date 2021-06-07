import { GradeItemService } from './grade-item-service';
import { GradeItemServiceDemo } from './grade-item-service-demo';

export class GradeItemServiceFactory {
	static getGradeItemService() {
		if (window.demo) {
			return GradeItemServiceDemo;
		}
		return GradeItemService;
	}
}
