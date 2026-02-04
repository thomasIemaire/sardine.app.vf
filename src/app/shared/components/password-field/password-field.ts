import { Component, forwardRef, input } from "@angular/core";
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from "@angular/forms";
import { PasswordModule } from 'primeng/password';

@Component({
    selector: "app-password-field",
    imports: [FormsModule, PasswordModule],
    templateUrl: "./password-field.html",
    styleUrls: ["./password-field.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PasswordFieldComponent),
            multi: true
        }
    ]
})
export class PasswordFieldComponent implements ControlValueAccessor {
    placeholder = input<string>('');
    disabled = input<boolean>(false);
    feedback = input<boolean>(false);
    toggleMask = input<boolean>(true);

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

    onModelChange(value: string): void {
        this.value = value;
        this.onChange(this.value);
    }

    onBlur(): void {
        this.onTouched();
    }
}
