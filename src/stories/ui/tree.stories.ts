import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { TreeComponent } from '@/app/shared/components/UI/tree/tree.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TreeModule } from 'primeng/tree';

const meta: Meta<TreeComponent> = {
  title: 'UI/Tree',
  component: TreeComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, FormsModule, TreeModule],
    }),
  ],
};

export default meta;
type Story = StoryObj<TreeComponent>;

export const Default: Story = {
  args: {
    treeData: [
      {
        label: 'Folder 1',
        children: [{ label: 'File 1.1' }]
      }
    ],
    selectionMode: 'checkbox',
  },
};
