import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { TableComponent } from '@/app/shared/components/UI/table/table.component';
import { PermissionService } from '@/app/shared/services';

const meta: Meta<TableComponent> = {
  title: 'UI/Table',
  component: TableComponent,
  decorators: [
    moduleMetadata({
      providers: [{ provide: PermissionService, useValue: { hasPermission: () => true } }],
    }),
  ],
};

export default meta;
type Story = StoryObj<TableComponent>;

export const Default: Story = {
  args: {
    value: [{ id: 1, name: 'John Doe' }],
    columns: [{ header: 'Name', field: 'name' }],
    totalCount: 1,
    lazy: false,
  },
};
