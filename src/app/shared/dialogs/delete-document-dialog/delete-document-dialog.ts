import { ChangeDetectionStrategy, Component, computed, EventEmitter, Output, signal } from '@angular/core';
import { BaseDialogComponent } from '../../components';

export interface DeleteDocumentResult {
  documentId: string;
  documentType: 'folder' | 'file';
}

@Component({
  selector: 'app-delete-document-dialog',
  standalone: true,
  imports: [BaseDialogComponent],
  templateUrl: './delete-document-dialog.html',
  styleUrl: './delete-document-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeleteDocumentDialogComponent {
  @Output() readonly documentDeleted = new EventEmitter<DeleteDocumentResult>();

  readonly visible = signal(false);
  readonly documentId = signal<string | null>(null);
  readonly documentType = signal<'folder' | 'file'>('file');
  readonly documentName = signal('');
  readonly isDeleting = signal(false);

  readonly subtitle = computed(() => `Supprimer "${this.documentName()}"`);

  readonly warningMessage = computed(() => {
    if (this.documentType() === 'folder') {
      return 'Cette action supprimera également tous les fichiers et sous-dossiers contenus dans ce dossier.';
    }
    return 'L\'élément sera déplacé vers la corbeille.';
  });

  open(documentId: string, documentType: 'folder' | 'file', documentName: string): void {
    this.documentId.set(documentId);
    this.documentType.set(documentType);
    this.documentName.set(documentName);
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
    this.documentId.set(null);
  }

  onSubmit(): void {
    const docId = this.documentId();
    if (!docId || this.isDeleting()) return;

    this.isDeleting.set(true);

    this.documentDeleted.emit({
      documentId: docId,
      documentType: this.documentType()
    });

    this.isDeleting.set(false);
    this.close();
  }
}
