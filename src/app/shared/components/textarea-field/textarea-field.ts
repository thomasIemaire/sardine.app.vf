import { Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';

@Component({
    selector: 'app-textarea-field',
    imports: [TextareaModule],
    templateUrl: './textarea-field.html',
    styleUrls: ['./textarea-field.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TextareaFieldComponent),
            multi: true
        }
    ]
})
export class TextareaFieldComponent implements ControlValueAccessor {
    label = input<string>('');
    placeholder = input<string>('');
    hint = input<string>('');
    rows = input<number>(3);
    disabled = input<boolean>(false);
    resize = input<'none' | 'both' | 'horizontal' | 'vertical'>('none');

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
        const target = event.target as HTMLTextAreaElement;
        this.value = target.value;
        this.onChange(this.value);
    }

    onBlur(): void {
        this.onTouched();
    }
}
