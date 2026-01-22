import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { StyleClass } from 'primeng/styleclass';

@Component({
  selector: 'NG-Input',
  standalone: true,
  imports: [CommonModule, InputTextModule, FloatLabelModule, StyleClass],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
   providers: [
          {
              provide: NG_VALUE_ACCESSOR,
              useExisting: forwardRef(() => InputComponent),
              multi: true // Allows multiple form controls
          }
      ]
})
export class InputComponent implements ControlValueAccessor {
@Input() id: string = '';
    @Input() type: string = 'text';
    @Input() placeholder: string = '';
    @Input() label: string = '';
    @Input() containerClass: string = '';
    @Input() inputClass: string = '';
    @Input() disabled: boolean = false;
    @Input() mark: boolean = false;
    @Output() userStoppedTyping = new EventEmitter<void>();

    get isRequired(): boolean {
        return this.mark;
    }

    value: any = ''; // Bound to the form control's value
    private onChange: (_: any) => void = () => {};

    // Called when the input value changes
    onInputChange(event: any): void {
        this.value = event.target.value; // Update the internal value
        this.onChange(event.target.value); // Notify Angular form about the value change
    }

    onInputBlur(event: any): void {
        this.userStoppedTyping.next();
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
