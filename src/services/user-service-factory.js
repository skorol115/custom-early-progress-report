import { UserService } from './user-service';
import { UserServiceDemo } from './user-service-demo';

export class UserServiceFactory {
	static getUserService() {
		if (window.demo) {
			return UserServiceDemo;
		}
		return UserService;
	}
}
