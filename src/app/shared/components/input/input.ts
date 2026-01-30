import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="input-wrapper">
      @if (label()) {
        <label [for]="id()" class="input-label">{{ label() }}</label>
      }
      <input
        [id]="id()"
        [type]="type()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [(ngModel)]="value"
        class="input-field"
        [class.input-field--error]="error()" />
      @if (error()) {
        <span class="input-error">{{ error() }}</span>
      }
    </div>
  `,
  styleUrl: './input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputComponent {
  readonly id = input.required<string>();
  readonly type = input<'text' | 'email' | 'password' | 'number'>('text');
  readonly label = input<string>('');
  readonly placeholder = input('');
  readonly disabled = input(false);
  readonly error = input<string>('');

  readonly value = model<string>('');
}
