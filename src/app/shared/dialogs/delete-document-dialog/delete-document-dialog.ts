import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

export interface DeleteDocumentResult {
  documentId: number;
  documentType: 'folder' | 'file';
}

@Component({
  selector: 'app-delete-document-dialog',
  standalone: true,
  imports: [
    ButtonModule,
    DialogModule
  ],
  templateUrl: './delete-document-dialog.html',
  styleUrl: './delete-document-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeleteDocumentDialogComponent {
  @Output() readonly documentDeleted = new EventEmitter<DeleteDocumentResult>();

  readonly visible = signal(false);
  readonly documentId = signal<number | null>(null);
  readonly documentType = signal<'folder' | 'file'>('file');
  readonly documentName = signal('');
  readonly isDeleting = signal(false);

  open(documentId: number, documentType: 'folder' | 'file', documentName: string): void {
    this.documentId.set(documentId);
    this.documentType.set(documentType);
    this.documentName.set(documentName);
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
    this.documentId.set(null);
  }

  get typeLabel(): string {
    return this.documentType() === 'folder' ? 'ce dossier' : 'ce fichier';
  }

  get warningMessage(): string {
    if (this.documentType() === 'folder') {
      return 'Cette action supprimera également tous les fichiers et sous-dossiers contenus dans ce dossier.';
    }
    return 'Cette action est irréversible.';
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
