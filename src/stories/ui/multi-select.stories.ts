import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { MultiselectComponent } from '@/app/shared/components/UI/multi-select/multi-select.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { FloatLabelModule } from 'primeng/floatlabel';

const meta: Meta<MultiselectComponent> = {
  title: 'UI/MultiSelect',
  component: MultiselectComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, FormsModule, MultiSelectModule, FloatLabelModule],
    }),
  ],
};

export default meta;
type Story = StoryObj<MultiselectComponent>;

export const Default: Story = {
  args: {
    id: 'countries',
    label: 'Select Countries',
    options: [
      { name: 'Australia', code: 'AU' },
      { name: 'Brazil', code: 'BR' }
    ],
    optionLabel: 'name',
    optionValue: 'code',
  },
};
