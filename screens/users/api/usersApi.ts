import { getRequest, postRequest } from '@/api/apiService';
import type {
  ManagedUser,
  UserBranch,
  UserFormData,
  UserPermission,
  UserRole,
} from '@/screens/users/types';

export async function getUsers(): Promise<ManagedUser[]> {
  const response = await getRequest('api/user/getUsers');
  return response.data?.data?.data ?? [];
}

export async function getBranches(): Promise<UserBranch[]> {
  const response = await getRequest('api/branch');
  return response.data?.data?.data ?? [];
}

export async function saveUser(form: UserFormData) {
  const response = await postRequest('api/user/saveUser', {
    ...form,
    branches: form.id_branch,
  });
  return response.data;
}

export async function getUserRoles(userId: number): Promise<UserRole[]> {
  const response = await getRequest(`api/user/getUserRoles/${userId}`);
  return response.data?.data ?? [];
}

export async function getUserPermissions(userId: number): Promise<UserPermission[]> {
  const response = await getRequest(`api/user/getPermisosByUser/${userId}`);
  return response.data?.data ?? [];
}

export async function saveUserRoles(userId: number, roleIds: number[]) {
  const response = await postRequest(`api/user/saveRole/${userId}`, { id: roleIds });
  return response.data;
}

export async function saveUserPermissions(userId: number, permissionIds: number[]) {
  const response = await postRequest(`api/user/savePermissions/${userId}`, { id: permissionIds });
  return response.data;
}
