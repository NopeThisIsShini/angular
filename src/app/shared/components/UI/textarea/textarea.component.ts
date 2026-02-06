import { Component, computed, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TextareaModule } from 'primeng/textarea';

@Component({
    selector: 'NG-Textarea',
    imports: [TextareaModule, FloatLabelModule],
    templateUrl: './textarea.component.html',
    styleUrl: './textarea.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TextareaComponent),
            multi: true // Allows multiple form controls
        }
    ]
})
export class TextareaComponent implements ControlValueAccessor {
    id = input<string>('');
    rows = input<string>('10');
    cols = input<string>('30');
    label = input<string>('');
    customClass = input<string>('');
    mark = input<boolean>(false);

    isRequired = computed(() => this.mark());

    value: any = ''; // Bound to the form control's value
    private onChange: (_: any) => void = () => {};

    // Called when the input value changes
    onInputChange(event: any): void {
        this.value = event.target.value; // Update the internal value
        this.onChange(event.target.value); // Notify Angular form about the value change
    }

    // Required methods for ControlValueAccessor
    writeValue(value: any): void {
        this.value = value; // Update the internal value
    }

    registerOnChange(fn: (_: any) => void): void {
        this.onChange = fn; // Assign the function to notify Angular forms of value changes
    }
    registerOnTouched(fn: () => void): void {}
}
