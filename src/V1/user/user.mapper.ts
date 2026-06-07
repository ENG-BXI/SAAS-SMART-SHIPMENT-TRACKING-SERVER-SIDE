import { USER_ROLE } from 'src/Common/constant/user-role';
import { User } from './interfaces/user.interface';

export class UserMapper {
  private static getRole(user: User) {
    if (user.isManager) return USER_ROLE.MANAGER;
    if (user.isEmployee) return USER_ROLE.EMPLOYEE;
    if (user.isDriver) return USER_ROLE.DRIVER;
    return null;
  }
  static toList(users: User[]) {
    return users.map((user) => {
      return {
        id: user.id,
        userName: user.userName,
        email: user.email,
        role: this.getRole(user),
      };
    });
  }
}
