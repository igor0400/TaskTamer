import { adminsRoles, superAdminsRoles } from '../configs';
import { UserRoles } from '../models/user-roles.model';

export const isUserAdmin = (userRoles: UserRoles[]) => {
  let isAdmin = false;

  for (let userRole of userRoles) {
    if (adminsRoles.includes(userRole?.roleName)) {
      isAdmin = true;
    }
  }

  return isAdmin;
};

export const isUserSuperAdmin = (userRoles: UserRoles[]) => {
  let isSuperAdmin = false;

  for (let userRole of userRoles) {
    if (superAdminsRoles.includes(userRole?.roleName)) {
      isSuperAdmin = true;
    }
  }

  return isSuperAdmin;
};
