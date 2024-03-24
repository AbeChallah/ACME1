import {
  mdiAccountCircle,
  mdiMonitor,
  mdiGithub,
  mdiLock,
  mdiAlertCircle,
  mdiSquareEditOutline,
  mdiTable,
  mdiViewList,
  mdiPalette,
  mdiVuejs,
} from '@mdi/js';
import { MenuAsideItem } from './interfaces';

const menuAside: MenuAsideItem[] = [
  {
    href: '/dashboard',
    icon: mdiMonitor,
    label: 'Dashboard',
  },

  {
    href: '/users/users-list',
    label: 'Users',
    icon: mdiTable,
    permissions: 'READ_USERS',
  },
  {
    href: '/products/products-list',
    label: 'Products',
    icon: mdiTable,
    permissions: 'READ_PRODUCTS',
  },
  {
    href: '/purchase_orders/purchase_orders-list',
    label: 'Purchase orders',
    icon: mdiTable,
    permissions: 'READ_PURCHASE_ORDERS',
  },
  {
    href: '/suppliers/suppliers-list',
    label: 'Suppliers',
    icon: mdiTable,
    permissions: 'READ_SUPPLIERS',
  },
  {
    href: '/roles/roles-list',
    label: 'Roles',
    icon: mdiTable,
    permissions: 'READ_ROLES',
  },
  {
    href: '/permissions/permissions-list',
    label: 'Permissions',
    icon: mdiTable,
    permissions: 'READ_PERMISSIONS',
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: mdiAccountCircle,
  },
  {
    href: '/api-docs',
    label: 'Swagger API',
    icon: mdiAccountCircle,
    permissions: 'READ_API_DOCS',
  },
];

export default menuAside;
