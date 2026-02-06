import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output, input, output, computed } from '@angular/core';
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
            multi: true
        }
    ]
})
export class InputComponent implements ControlValueAccessor {
    id = input<string>('');
    type = input<string>('text');
    placeholder = input<string>('');
    label = input<string>('');
    containerClass = input<string>('');
    inputClass = input<string>('');
    disabled = input<boolean>(false);
    mark = input<boolean>(false);
    
    userStoppedTyping = output<void>();

    isRequired = computed(() => this.mark());

    value: any = ''; 
    private onChange: (_: any) => void = () => {};
    private onTouched: () => void = () => {};

    onInputChange(event: any): void {
        this.value = event.target.value;
        this.onChange(event.target.value);
    }

    onInputBlur(event: any): void {
        this.onTouched();
        this.userStoppedTyping.emit();
    }

    writeValue(value: any): void {
        this.value = value || '';
    }

    registerOnChange(fn: (_: any) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        // Handle disabled state if needed, though 'disabled' input is also present
    }
}
