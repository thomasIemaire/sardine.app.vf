import { ChangeDetectionStrategy, Component, computed, EventEmitter, Output, signal } from '@angular/core';
import { BaseDialogComponent } from '../../components';

export interface PermanentDeleteResult {
  documentIds: string[];
  deleteAll: boolean;
}

@Component({
  selector: 'app-permanent-delete-dialog',
  standalone: true,
  imports: [BaseDialogComponent],
  templateUrl: './permanent-delete-dialog.html',
  styleUrl: './permanent-delete-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermanentDeleteDialogComponent {
  @Output() readonly permanentlyDeleted = new EventEmitter<PermanentDeleteResult>();

  readonly visible = signal(false);
  readonly mode = signal<'single' | 'multiple' | 'all'>('single');
  readonly documentIds = signal<string[]>([]);
  readonly documentName = signal('');
  readonly itemCount = signal(0);
  readonly isDeleting = signal(false);

  readonly title = computed(() => {
    switch (this.mode()) {
      case 'all': return 'Vider la corbeille';
      case 'multiple': return `Supprimer ${this.itemCount()} éléments`;
      default: return 'Supprimer définitivement';
    }
  });

  readonly subtitle = computed(() => {
    if (this.mode() === 'single') {
      return `Supprimer "${this.documentName()}"`;
    }
    return '';
  });

  readonly confirmationText = computed(() => {
    switch (this.mode()) {
      case 'all':
        return `Êtes-vous sûr de vouloir vider la corbeille ? ${this.itemCount()} élément${this.itemCount() > 1 ? 's seront supprimés' : ' sera supprimé'} définitivement.`;
      case 'multiple':
        return `Êtes-vous sûr de vouloir supprimer définitivement ${this.itemCount()} éléments ?`;
      default:
        return `Êtes-vous sûr de vouloir supprimer définitivement cet élément ?`;
    }
  });

  openSingle(id: string, name: string): void {
    this.mode.set('single');
    this.documentIds.set([id]);
    this.documentName.set(name);
    this.itemCount.set(1);
    this.visible.set(true);
  }

  openMultiple(ids: string[]): void {
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

    this.permanentlyDeleted.emit({
      documentIds: this.documentIds(),
      deleteAll: this.mode() === 'all'
    });

    this.isDeleting.set(false);
    this.close();
  }
}
