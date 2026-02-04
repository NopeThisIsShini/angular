import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { RoleComponent } from '@/app/pages/administration/components/role/role.component';
import { RoleService } from '@/app/pages/services/api/role.service';
import { PermissionService } from '@/app/shared/services/permission.service';
import { of } from 'rxjs';
import { SharedModule } from '@/app/shared/shared.imports';
import { PermissionComponent } from '@/app/shared/components/permission/permission.component';

const mockRoleService = {
  getallRoles: () => of({
    result: {
      items: [
        { id: 1, name: 'Admin', slug: 'admin', description: 'Administrator Role' },
        { id: 2, name: 'User', slug: 'user', description: 'Standard User Role' }
      ],
      totalCount: 2
    }
  }),
  saveRole: () => of({ success: true }),
  deleteRoleByid: () => of({ success: true })
};

// This variable acts as a temporary "database" for the Storybook session
let selectedKeys: string[] = [];

const mockPermissionService = {
  getPermissionTree: () => [
    {
      key: 'Administration',
      label: 'Administration',
      children: [
        { 
          key: 'Administration.Roles', 
          label: 'Roles', 
          children: [
            { key: 'Administration.Roles.Edit', label: 'Edit' },
            { key: 'Administration.Roles.Delete', label: 'Delete' }
          ]
        }
      ]
    }
  ],
  getAllAvailablePermissions: () => ['Administration.Roles.Edit', 'Administration.Roles.Delete'],
  loadRolePermissions: (keys: string[]) => selectedKeys = keys || [],
  getSelectedRolePermissionNodes: (tree: any[]) => {
    const found: any[] = [];
    const traverse = (nodes: any[]) => {
      nodes.forEach(n => {
        if (selectedKeys.includes(n.key)) found.push(n);
        if (n.children) traverse(n.children);
      });
    };
    traverse(tree);
    return found;
  },
  getPermissionsFromNodes: (nodes: any[]) => {
    const map: any = {};
    nodes.forEach(n => map[n.key] = true);
    return map;
  },
  saveRolePermissions: (map: any) => selectedKeys = Object.keys(map),
  getRolePermissions: () => {
    const map: any = {};
    selectedKeys.forEach(k => map[k] = true);
    return map;
  },
  getPermissionsByModule: () => ({}),
  hasPermission: (k: string) => selectedKeys.includes(k) || true,
  hasAllPermissions: () => true
};

const meta: Meta<RoleComponent> = {
  title: 'Administration/Role',
  component: RoleComponent,
  decorators: [
    moduleMetadata({
      imports: [SharedModule, PermissionComponent],
      providers: [
        { provide: RoleService, useValue: mockRoleService },
        { provide: PermissionService, useValue: mockPermissionService },
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<RoleComponent>;

export const Default: Story = {
  args: {},
};
