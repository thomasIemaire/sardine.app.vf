import { Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    selector: 'app-text-field',
    imports: [InputTextModule],
    templateUrl: './text-field.html',
    styleUrls: ['./text-field.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TextFieldComponent),
            multi: true
        }
    ]
})
export class TextFieldComponent implements ControlValueAccessor {
    label = input<string>('');
    placeholder = input<string>('');
    hint = input<string>('');
    type = input<string>('text');
    disabled = input<boolean>(false);

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

    onInput(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.value = target.value;
        this.onChange(this.value);
    }

    onBlur(): void {
        this.onTouched();
    }
}
