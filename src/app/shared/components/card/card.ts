import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="card" [class.card--hoverable]="hoverable()">
      @if (title()) {
        <div class="card-header">
          <h3 class="card-title">{{ title() }}</h3>
        </div>
      }
      <div class="card-body">
        <ng-content />
      </div>
      <ng-content select="[card-footer]" />
    </div>
  `,
  styleUrl: './card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  readonly title = input<string>('');
  readonly hoverable = input(false);
}
