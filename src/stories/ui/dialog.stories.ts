import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { DialogComponent } from '@/app/shared/components/UI/dialog/dialog.component';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

const meta: Meta<DialogComponent> = {
  title: 'UI/Dialog',
  component: DialogComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, ButtonModule],
    }),
  ],
  argTypes: {
    position: {
      control: 'select',
      options: ['center', 'top', 'bottom', 'left', 'right'],
    },
    severity: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'info', 'warn', 'danger'],
    },
  },
};

export default meta;
type Story = StoryObj<DialogComponent>;

export const Default: Story = {
  args: {
    visible: true,
    header: 'Minimal Dialog',
    width: '25rem',
  },
  render: (args) => ({
    props: args,
    template: `
      <NG-Dialog [(visible)]="visible" [header]="header" [width]="width" [severity]="severity">
        <p>This is a minimal dialog content.</p>
      </NG-Dialog>
    `,
  }),
};
