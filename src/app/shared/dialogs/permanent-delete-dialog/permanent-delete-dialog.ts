import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

export interface PermanentDeleteResult {
  documentIds: number[];
  deleteAll: boolean;
}

@Component({
  selector: 'app-permanent-delete-dialog',
  standalone: true,
  imports: [ButtonModule, DialogModule],
  templateUrl: './permanent-delete-dialog.html',
  styleUrl: './permanent-delete-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermanentDeleteDialogComponent {
  @Output() readonly permanentlyDeleted = new EventEmitter<PermanentDeleteResult>();

  readonly visible = signal(false);
  readonly mode = signal<'single' | 'multiple' | 'all'>('single');
  readonly documentIds = signal<number[]>([]);
  readonly documentName = signal('');
  readonly itemCount = signal(0);
  readonly isDeleting = signal(false);

  get title(): string {
    switch (this.mode()) {
      case 'all': return 'Vider la corbeille';
      case 'multiple': return `Supprimer ${this.itemCount()} éléments`;
      default: return 'Supprimer définitivement';
    }
  }

  get confirmationText(): string {
    switch (this.mode()) {
      case 'all':
        return `Êtes-vous sûr de vouloir vider la corbeille ? ${this.itemCount()} élément${this.itemCount() > 1 ? 's' : ''} seront supprimés définitivement.`;
      case 'multiple':
        return `Êtes-vous sûr de vouloir supprimer définitivement ${this.itemCount()} éléments ?`;
      default:
        return `Êtes-vous sûr de vouloir supprimer définitivement "${this.documentName()}" ?`;
    }
  }

  openSingle(id: number, name: string): void {
    this.mode.set('single');
    this.documentIds.set([id]);
    this.documentName.set(name);
    this.itemCount.set(1);
    this.visible.set(true);
  }

  openMultiple(ids: number[]): void {
    this.mode.set('multiple');
    this.documentIds.set(ids);
    this.documentName.set('');
    this.itemCount.set(ids.length);
    this.visible.set(true);
  }

  openAll(count: number): void {
    this.mode.set('all');
    this.documentIds.set([]);
    this.documentName.set('');
    this.itemCount.set(count);
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
    this.documentIds.set([]);
    this.documentName.set('');
  }

  onSubmit(): void {
    this.isDeleting.set(true);

    // Simulate API call
    setTimeout(() => {
      this.permanentlyDeleted.emit({
        documentIds: this.documentIds(),
        deleteAll: this.mode() === 'all'
      });
      this.isDeleting.set(false);
      this.close();
    }, 500);
  }
}
