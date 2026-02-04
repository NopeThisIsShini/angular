import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { SelectComponent } from '@/app/shared/components/UI/select/select.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';

const meta: Meta<SelectComponent> = {
  title: 'UI/Select',
  component: SelectComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, FormsModule, SelectModule, FloatLabelModule],
    }),
  ],
};

export default meta;
type Story = StoryObj<SelectComponent>;

export const Default: Story = {
  args: {
    id: 'city',
    label: 'Select City',
    options: [
      { label: 'New York', value: 'NY' },
      { label: 'London', value: 'LDN' }
    ],
    optionLabel: 'label',
    optionValue: 'value',
  },
};
