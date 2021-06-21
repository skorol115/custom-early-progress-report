import { RecordService } from './record-service';
import { RecordServiceDemo } from './record-service-demo';

export class RecordServiceFactory {
	static getRecordService() {
		if (window.demo) {
			return RecordServiceDemo;
		}
		return RecordService;
	}
}
