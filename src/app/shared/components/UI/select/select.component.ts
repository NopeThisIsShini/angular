import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, forwardRef, inject, input, output, computed } from '@angular/core';
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
    private cdr = inject(ChangeDetectorRef);

    id = input<string>('');
    placeholder = input<string>('');
    label = input<string>('');
    containerClass = input<string>('');
    selectClass = input<string>('');
    disabledInput = input<boolean>(false, { alias: 'disabled' });
    mark = input<boolean>(false);
    options = input<any[]>([]);
    optionLabel = input<string>('label');
    optionValue = input<string>('value');
    
    userSelectionChanged = output<any>();

    isRequired = computed(() => this.mark());

    value: any = null;
    isDisabled = false;
    private onChange: (_: any) => void = () => {};
    private onTouched: () => void = () => {};

    onSelectionChange(event: any): void {
        this.value = event.value;
        this.onChange(event.value);
        this.onTouched();
        this.userSelectionChanged.emit(event.value);
    }

    onSelectBlur(event: any): void {
        this.onTouched();
    }

    writeValue(value: any): void {
        this.value = value;
        this.cdr.detectChanges();
    }

    registerOnChange(fn: (_: any) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
        this.cdr.detectChanges();
    }
}
