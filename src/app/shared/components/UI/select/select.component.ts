import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';

@Component({
    selector: 'NG-Select',
    standalone: true,
    imports: [CommonModule, SelectModule, FloatLabelModule, FormsModule],
    templateUrl: './select.component.html',
    styleUrl: './select.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SelectComponent),
            multi: true
        }
    ]
})
export class SelectComponent implements ControlValueAccessor {
    @Input() id: string = '';
    @Input() placeholder: string = '';
    @Input() label: string = '';
    @Input() containerClass: string = '';
    @Input() selectClass: string = '';
    @Input() disabled: boolean = false;
    @Input() mark: boolean = false;
    @Input() options: any[] = [];
    @Input() optionLabel: string = 'label';
    @Input() optionValue: string = 'value';
    @Output() userSelectionChanged = new EventEmitter<any>();

    get isRequired(): boolean {
        return this.mark;
    }

    value: any = null;
    private onChange: (_: any) => void = () => {};
    private onTouched: () => void = () => {};

    constructor(private cdr: ChangeDetectorRef) {}

    // Called when the select value changes
    onSelectionChange(event: any): void {
        this.value = event.value;
        this.onChange(event.value);
        this.onTouched(); // Add this to mark as touched
        this.userSelectionChanged.emit(event.value);
    }

    onSelectBlur(event: any): void {
        this.onTouched();
    }

    // Required methods for ControlValueAccessor
    writeValue(value: any): void {
        this.value = value;
        // Trigger change detection to update the view
        this.cdr.detectChanges();
    }

    registerOnChange(fn: (_: any) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        this.cdr.detectChanges();
    }
}
