import { staffRoles } from '../configs';
import { UserRoles } from '../models/user-roles.model';

export const isStaffUser = (userRoles: UserRoles[]) => {
  let isStaff = false;

  for (let userRole of userRoles) {
    if (staffRoles.includes(userRole?.roleName)) {
      isStaff = true;
    }
  }

  return isStaff;
};
