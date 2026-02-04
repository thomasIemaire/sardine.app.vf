import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal, viewChild } from '@angular/core';
import { BaseDialogComponent } from '../../components';
import { FolderTreeSelectComponent, FolderTreeItem } from '../../components/folder-tree-select/folder-tree-select';

export type { FolderTreeItem };

export interface MoveDocumentResult {
  documentId: string;
  documentType: 'folder' | 'file';
  sourceFolderId: string | null;
  targetFolderId: string | null;
}

@Component({
  selector: 'app-move-document-dialog',
  standalone: true,
  imports: [BaseDialogComponent, FolderTreeSelectComponent],
  templateUrl: './move-document-dialog.html',
  styleUrl: './move-document-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoveDocumentDialogComponent {
  @Output() readonly documentMoved = new EventEmitter<MoveDocumentResult>();

  readonly treeSelect = viewChild<FolderTreeSelectComponent>('treeSelect');

  readonly visible = signal(false);
  readonly documentId = signal<string | null>(null);
  readonly documentType = signal<'folder' | 'file'>('file');
  readonly documentName = signal('');
  readonly sourceFolderId = signal<string | null>(null);
  readonly folders = signal<FolderTreeItem[]>([]);
  readonly isMoving = signal(false);

  open(documentId: string, documentType: 'folder' | 'file', documentName: string, sourceFolderId: string | null, allFolders: FolderTreeItem[]): void {
    this.documentId.set(documentId);
    this.documentType.set(documentType);
    this.documentName.set(documentName);
    this.sourceFolderId.set(sourceFolderId);
    this.folders.set(allFolders);
    this.treeSelect()?.reset();
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
    this.documentId.set(null);
    this.sourceFolderId.set(null);
    this.treeSelect()?.reset();
  }

  get excludeId(): string | null {
    return this.documentType() === 'folder' ? this.documentId() : null;
  }

  get excludeDescendants(): string | null {
    return this.documentType() === 'folder' ? this.documentId() : null;
  }

  onSubmit(): void {
    const docId = this.documentId();
    const tree = this.treeSelect();
    if (!docId || !tree?.hasSelection() || this.isMoving()) return;

    this.isMoving.set(true);

    const ids = tree.getSelectedFolderIds();
    this.documentMoved.emit({
      documentId: docId,
      documentType: this.documentType(),
      sourceFolderId: this.sourceFolderId(),
      targetFolderId: ids[0] ?? null
    });

    this.isMoving.set(false);
    this.close();
  }
}
