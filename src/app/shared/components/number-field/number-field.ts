import { Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
    selector: 'app-number-field',
    imports: [FormsModule, InputNumberModule],
    templateUrl: './number-field.html',
    styleUrls: ['./number-field.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => NumberFieldComponent),
            multi: true
        }
    ]
})
export class NumberFieldComponent implements ControlValueAccessor {
    label = input<string>('');
    placeholder = input<string>('');
    hint = input<string>('');
    min = input<number | undefined>(undefined);
    max = input<number | undefined>(undefined);
    step = input<number>(1);
    disabled = input<boolean>(false);
    showButtons = input<boolean>(false);
    suffix = input<string>('');
    prefix = input<string>('');

    value: number | null = null;

    private onChange: (value: number | null) => void = () => {};
    private onTouched: () => void = () => {};

    writeValue(value: number | null): void {
        this.value = value;
    }

    registerOnChange(fn: (value: number | null) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    onValueChange(value: number | null): void {
        this.value = value;
        this.onChange(this.value);
    }

    onBlur(): void {
        this.onTouched();
    }
}
