import { Component, forwardRef, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectModule } from 'primeng/select';

export interface SelectOption {
    label: string;
    value: string;
}

@Component({
    selector: 'app-select-field',
    imports: [CommonModule, FormsModule, SelectModule],
    templateUrl: './select-field.html',
    styleUrls: ['./select-field.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SelectFieldComponent),
            multi: true
        }
    ]
})
export class SelectFieldComponent implements ControlValueAccessor {
    label = input<string>('');
    placeholder = input<string>('Sélectionner');
    hint = input<string>('');
    options = input<SelectOption[]>([]);
    optionLabel = input<string>('label');
    optionValue = input<string>('value');
    disabled = input<boolean>(false);

    selectionChange = output<string>();

    value: string = '';

    private onChange: (value: string) => void = () => {};
    private onTouched: () => void = () => {};

    writeValue(value: string): void {
        this.value = value || '';
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    onSelectionChange(event: { value: string }): void {
        this.value = event.value;
        this.onChange(this.value);
        this.selectionChange.emit(this.value);
    }

    onBlur(): void {
        this.onTouched();
    }

    getOptionLabel(option: SelectOption | Record<string, unknown>): string {
        const labelKey = this.optionLabel();
        return (option as Record<string, unknown>)[labelKey] as string || '';
    }

    isSelected(option: SelectOption | Record<string, unknown>): boolean {
        const valueKey = this.optionValue();
        return (option as Record<string, unknown>)[valueKey] === this.value;
    }
}
