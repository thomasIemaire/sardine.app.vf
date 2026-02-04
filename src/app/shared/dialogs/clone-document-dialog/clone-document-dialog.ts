import { ChangeDetectionStrategy, Component, computed, EventEmitter, Output, signal, viewChild } from '@angular/core';
import { BaseDialogComponent } from '../../components';
import { FolderTreeSelectComponent, FolderTreeItem } from '../../components/folder-tree-select/folder-tree-select';

export type { FolderTreeItem };

export interface CloneDocumentResult {
  documentId: string;
  documentType: 'folder' | 'file';
  destinationFolderIds: string[];
}

@Component({
  selector: 'app-clone-document-dialog',
  standalone: true,
  imports: [BaseDialogComponent, FolderTreeSelectComponent],
  templateUrl: './clone-document-dialog.html',
  styleUrl: './clone-document-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CloneDocumentDialogComponent {
  @Output() readonly documentCloned = new EventEmitter<CloneDocumentResult>();

  readonly treeSelect = viewChild<FolderTreeSelectComponent>('treeSelect');

  readonly visible = signal(false);
  readonly documentId = signal<string | null>(null);
  readonly documentType = signal<'folder' | 'file'>('file');
  readonly documentName = signal('');
  readonly folders = signal<FolderTreeItem[]>([]);
  readonly isCloning = signal(false);

  readonly submitLabel = computed(() => {
    const count = this.treeSelect()?.selectedCount() ?? 0;
    if (count === 0) return 'Cloner';
    if (count === 1) return 'Cloner vers 1 dossier';
    return `Cloner vers ${count} dossiers`;
  });

  open(documentId: string, documentType: 'folder' | 'file', documentName: string, allFolders: FolderTreeItem[]): void {
    this.documentId.set(documentId);
    this.documentType.set(documentType);
    this.documentName.set(documentName);
    this.folders.set(allFolders);
    this.treeSelect()?.reset();
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
    this.documentId.set(null);
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
    if (!docId || !tree?.hasSelection() || this.isCloning()) return;

    this.isCloning.set(true);

    // Filter out null values (root folder is not a valid clone target for documents)
    const folderIds = tree.getSelectedFolderIds().filter((id): id is string => id !== null);

    this.documentCloned.emit({
      documentId: docId,
      documentType: this.documentType(),
      destinationFolderIds: folderIds
    });

    this.isCloning.set(false);
    this.close();
  }
}
