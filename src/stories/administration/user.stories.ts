import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { UserComponent } from '@/app/pages/administration/components/user/user.component';
import { UsersService } from '@/app/pages/services/api/users.service';
import { of } from 'rxjs';
import { SharedModule } from '@/app/shared/shared.imports';

const mockUsersService = {
  getRoles: () => of({
    result: {
      items: [
        { id: 1, name: 'Admin' },
        { id: 2, name: 'User' }
      ]
    }
  }),
  getallusers: () => of({
    result: {
      items: [
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '1234567890', isActive: true, roleIds: [1] },
        { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phone: '0987654321', isActive: false, roleIds: [2] }
      ],
      totalCount: 2
    }
  }),
  saveUser: () => of({ success: true })
};

const meta: Meta<UserComponent> = {
  title: 'Administration/User',
  component: UserComponent,
  decorators: [
    moduleMetadata({
      imports: [SharedModule],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<UserComponent>;

export const Default: Story = {
  args: {},
};
