import { CommonModule } from "@angular/common";
import { Component, forwardRef, input } from "@angular/core";
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Select } from "primeng/select";

@Component({
    selector: "app-select-field",
    imports: [CommonModule, FormsModule, Select],
    templateUrl: "./select-field.html",
    styleUrls: ["./select-field.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SelectFieldComponent),
            multi: true
        }
    ]
})
export class SelectFieldComponent implements ControlValueAccessor {
    options = input<unknown[]>([]);
    optionLabel = input<string>('label');
    optionValue = input<string | undefined>(undefined);
    placeholder = input<string>('');
    disabled = input<boolean>(false);

    value: unknown = null;

    private onChange: (value: unknown) => void = () => {};
    private onTouched: () => void = () => {};

    writeValue(value: unknown): void {
        this.value = value;
    }

    registerOnChange(fn: (value: unknown) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    onSelectionChange(event: { value: unknown }): void {
        this.value = event.value;
        this.onChange(this.value);
    }

    onBlur(): void {
        this.onTouched();
    }

    isSelected(option: unknown): boolean {
        if (this.value === null || this.value === undefined) return false;
        const optionVal = this.optionValue();
        if (optionVal) {
            const val = (option as Record<string, unknown>)[optionVal];
            return this.value === val;
        }
        return this.value === option;
    }

    getOptionLabel(option: unknown): string {
        const label = this.optionLabel();
        return (option as Record<string, unknown>)[label] as string || '';
    }
}
