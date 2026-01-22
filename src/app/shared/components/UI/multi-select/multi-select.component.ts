import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
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

    // Multi-select specific properties
    @Input() filter: boolean = true;
    @Input() maxSelectedLabels: number = 3;
    @Input() selectedItemsLabel: string = '{0} items selected';
    @Input() showToggleAll: boolean = true;
    @Input() filterPlaceHolder: string = 'Search...';
    @Input() showHeader: boolean = true;
    @Input() showClear: boolean = false;

    // Output events
    @Output() userSelectionChanged = new EventEmitter<any>();
    @Output() onShowEvent = new EventEmitter<any>();
    @Output() onHideEvent = new EventEmitter<any>();
    @Output() onFilterEvent = new EventEmitter<any>();

    get isRequired(): boolean {
        return this.mark;
    }

    value: any[] = [];

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
        this.disabled = isDisabled;
        this.cdr.detectChanges();
    }
}
