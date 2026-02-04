import { ChangeDetectionStrategy, Component, HostBinding, input } from '@angular/core';

@Component({
  selector: 'app-card-container',
  standalone: true,
  templateUrl: './card-container.html',
  styleUrl: './card-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardContainerComponent {
  /** Layout direction: 'row' for horizontal, 'column' for vertical */
  readonly layout = input<'row' | 'column'>('row');

  /** Whether the card is currently being dragged */
  readonly dragging = input<boolean>(false);

  /** Whether the card is a drop target */
  readonly dropTarget = input<boolean>(false);

  @HostBinding('class.dragging')
  get isDragging(): boolean {
    return this.dragging();
  }

  @HostBinding('class.drop-target')
  get isDropTarget(): boolean {
    return this.dropTarget();
  }
}
