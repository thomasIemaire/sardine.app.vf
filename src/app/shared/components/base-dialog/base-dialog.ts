import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

export type IconColor = 'blue' | 'green' | 'red' | 'purple' | 'cyan' | 'orange';

const ICON_COLORS: Record<IconColor, { bg: string; fg: string }> = {
  blue: { bg: 'rgba(59, 130, 246, 0.15)', fg: '#3b82f6' },
  green: { bg: 'rgba(16, 185, 129, 0.15)', fg: '#10b981' },
  red: { bg: 'rgba(239, 68, 68, 0.15)', fg: '#ef4444' },
  purple: { bg: 'rgba(139, 92, 246, 0.15)', fg: '#8b5cf6' },
  cyan: { bg: 'rgba(34, 211, 238, 0.15)', fg: '#22d3ee' },
  orange: { bg: 'rgba(249, 115, 22, 0.15)', fg: '#f97316' }
};

@Component({
  selector: 'app-base-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule],
  templateUrl: './base-dialog.html',
  styleUrl: './base-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseDialogComponent {
  readonly visible = model(false);

  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly icon = input<string>('fa-duotone fa-solid fa-circle-info');
  readonly iconColor = input<IconColor>('blue');
  readonly width = input<string>('500px');
  readonly submitLabel = input<string>('Valider');
  readonly cancelLabel = input<string>('Annuler');
  readonly canSubmit = input<boolean>(true);
  readonly loading = input<boolean>(false);
  readonly showFooter = input<boolean>(true);
  readonly styleClass = input<string>('');

  readonly submitted = output<void>();
  readonly closed = output<void>();

  get iconBgColor(): string {
    return ICON_COLORS[this.iconColor()].bg;
  }

  get iconFgColor(): string {
    return ICON_COLORS[this.iconColor()].fg;
  }

  close(): void {
    this.visible.set(false);
    this.closed.emit();
  }

  onSubmit(): void {
    if (this.canSubmit() && !this.loading()) {
      this.submitted.emit();
    }
  }
}
