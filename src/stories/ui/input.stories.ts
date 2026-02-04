import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { InputComponent } from '@/app/shared/components/UI/input/input.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';

const meta: Meta<InputComponent> = {
  title: 'UI/Input',
  component: InputComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, FormsModule, InputTextModule, FloatLabelModule],
    }),
  ],
};

export default meta;
type Story = StoryObj<InputComponent>;

export const Default: Story = {
  args: {
    id: 'username',
    label: 'Username',
    mark: true,
  },
};
