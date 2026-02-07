import { Component, forwardRef, input } from "@angular/core";
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from "@angular/forms";
import { ToggleSwitchModule } from "primeng/toggleswitch";

@Component({
    selector: "app-toggle-switch-field",
    imports: [FormsModule, ToggleSwitchModule],
    templateUrl: "./toggle-switch-field.html",
    styleUrls: ["./toggle-switch-field.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ToggleSwitchFieldComponent),
            multi: true
        }
    ]
})
export class ToggleSwitchFieldComponent implements ControlValueAccessor {
    label = input<string>('');
    labelPosition = input<'left' | 'right'>('right');
    disabled = input<boolean>(false);

    value: boolean = false;

    private onChange: (value: boolean) => void = () => {};
    private onTouched: () => void = () => {};

    writeValue(value: boolean): void {
        this.value = value ?? false;
    }

    registerOnChange(fn: (value: boolean) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    onToggle(value: boolean): void {
        this.value = value;
        this.onChange(this.value);
        this.onTouched();
    }
}
