import { CommonModule } from "@angular/common";
import { Component, forwardRef, input } from "@angular/core";
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from "@angular/forms";
import { MultiSelect } from "primeng/multiselect";

@Component({
    selector: "app-multiselect-field",
    imports: [CommonModule, FormsModule, MultiSelect],
    templateUrl: "./multiselect-field.html",
    styleUrls: ["./multiselect-field.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MultiselectFieldComponent),
            multi: true
        }
    ]
})
export class MultiselectFieldComponent implements ControlValueAccessor {
    options = input<unknown[]>([]);
    optionLabel = input<string>('label');
    optionValue = input<string | undefined>(undefined);
    placeholder = input<string>('');
    disabled = input<boolean>(false);
    showClear = input<boolean>(false);
    filter = input<boolean>(false);
    filterPlaceholder = input<string>('');
    maxSelectedLabels = input<number>(3);
    selectedItemsLabel = input<string>('{0} éléments sélectionnés');

    value: unknown[] = [];

    private onChange: (value: unknown[]) => void = () => {};
    private onTouched: () => void = () => {};

    writeValue(value: unknown[]): void {
        this.value = value || [];
    }

    registerOnChange(fn: (value: unknown[]) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    onSelectionChange(event: { value: unknown[] }): void {
        this.value = event.value;
        this.onChange(this.value);
    }

    onBlur(): void {
        this.onTouched();
    }

    isSelected(option: unknown): boolean {
        if (!this.value || !Array.isArray(this.value)) return false;
        const optionVal = this.optionValue();
        if (optionVal) {
            const val = (option as Record<string, unknown>)[optionVal];
            return this.value.includes(val);
        }
        return this.value.includes(option);
    }

    getOptionLabel(option: unknown): string {
        const label = this.optionLabel();
        return (option as Record<string, unknown>)[label] as string || '';
    }
}
