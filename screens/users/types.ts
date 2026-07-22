export interface ManagedUser {
  id: number;
  id_user?: number;
  first_name: string;
  last_name: string;
  user: string;
  email?: string;
  phone?: string;
  active?: boolean | number;
  admin?: boolean | number;
  show_notification_email?: boolean | number;
  id_branch?: number | string | null;
  home_page?: string;
  [key: string]: any;
}

export interface UserFormData {
  id_user?: number;
  first_name: string;
  last_name: string;
  user: string;
  password: string;
  email: string;
  phone: string;
  active: boolean;
  admin: boolean;
  show_notification_email: boolean;
  id_branch: string;
  home_page: string;
}

export interface UserBranch {
  id: number;
  name: string;
}

export interface UserRole {
  id: number;
  name?: string;
  description?: string;
  has_role: boolean;
}

export interface UserPermission {
  id: number;
  id_opcion: number | string;
  name: string;
  has_permission: boolean;
}

export const EMPTY_USER_FORM: UserFormData = {
  first_name: '',
  last_name: '',
  user: '',
  password: '',
  email: '',
  phone: '',
  active: true,
  admin: false,
  show_notification_email: false,
  id_branch: '',
  home_page: '/',
};

export function userToForm(user: ManagedUser): UserFormData {
  return {
    id_user: user.id,
    first_name: user.first_name ?? '',
    last_name: user.last_name ?? '',
    user: user.user ?? '',
    password: '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    active: Boolean(user.active),
    admin: Boolean(user.admin),
    show_notification_email: Boolean(user.show_notification_email),
    id_branch: user.id_branch == null ? '' : String(user.id_branch),
    home_page: user.home_page || '/',
  };
}
