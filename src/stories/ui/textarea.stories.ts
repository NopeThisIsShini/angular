import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { TextareaComponent } from '@/app/shared/components/UI/textarea/textarea.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabelModule } from 'primeng/floatlabel';

const meta: Meta<TextareaComponent> = {
  title: 'UI/Textarea',
  component: TextareaComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, FormsModule, TextareaModule, FloatLabelModule],
    }),
  ],
};

export default meta;
type Story = StoryObj<TextareaComponent>;

export const Default: Story = {
  args: {
    id: 'desc',
    label: 'Description',
    rows: '3',
  },
};
