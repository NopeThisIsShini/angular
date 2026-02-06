import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, forwardRef, input, output, computed } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
    selector: 'NG-MultiSelect',
    standalone: true,
    imports: [CommonModule, MultiSelectModule, FloatLabelModule, FormsModule],
    templateUrl: './multi-select.component.html',
    styleUrl: './multi-select.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MultiselectComponent),
            multi: true
        }
    ]
})
export class MultiselectComponent implements ControlValueAccessor {
    id = input<string>('');
    placeholder = input<string>('');
    label = input<string>('');
    containerClass = input<string>('');
    selectClass = input<string>('');
    disabled = input<boolean>(false);
    mark = input<boolean>(false);
    options = input<any[]>([]);
    optionLabel = input<string>('label');
    optionValue = input<string>('value');

    // Multi-select specific properties
    filter = input<boolean>(true);
    maxSelectedLabels = input<number>(3);
    selectedItemsLabel = input<string>('{0} items selected');
    showToggleAll = input<boolean>(true);
    filterPlaceHolder = input<string>('Search...');
    showHeader = input<boolean>(true);
    showClear = input<boolean>(false);

    // Output events
    userSelectionChanged = output<any>();
    onShowEvent = output<any>();
    onHideEvent = output<any>();
    onFilterEvent = output<any>();

    isRequired = computed(() => this.mark());

    value: any[] = [];
    isInternalDisabled = false;

    private onChange: (value: any) => void = () => {};
    private onTouched: () => void = () => {};

    constructor(private cdr: ChangeDetectorRef) {}

    // Called when the multi-select value changes
    onSelectionChange(event: any): void {
        this.value = event.value || [];
        this.onChange(this.value);
        this.onTouched();
        this.userSelectionChanged.emit(this.value);
    }

    onSelectBlur(event: any): void {
        this.onTouched();
    }

    onShow(event: any): void {
        this.onShowEvent.emit(event);
    }

    onHide(event: any): void {
        this.onHideEvent.emit(event);
    }

    onFilter(event: any): void {
        this.onFilterEvent.emit(event);
    }

    // Required methods for ControlValueAccessor
    writeValue(value: any): void {
        this.value = Array.isArray(value) ? value : [];
        this.cdr.detectChanges();
    }

    registerOnChange(fn: (value: any) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.isInternalDisabled = isDisabled;
        this.cdr.detectChanges();
    }
}
