import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TreeModule } from 'primeng/tree';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { TreeNode } from 'primeng/api';

export interface CloneDocumentResult {
  documentId: number;
  documentType: 'folder' | 'file';
  destinationFolderIds: (number | null)[];
}

export interface FolderTreeItem {
  id: number;
  name: string;
  parentId: number | null;
  color?: string;
}

@Component({
  selector: 'app-clone-document-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    TreeModule,
    CheckboxModule
  ],
  templateUrl: './clone-document-dialog.html',
  styleUrl: './clone-document-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CloneDocumentDialogComponent {
  @Output() readonly documentCloned = new EventEmitter<CloneDocumentResult>();

  readonly visible = signal(false);
  readonly documentId = signal<number | null>(null);
  readonly documentType = signal<'folder' | 'file'>('file');
  readonly documentName = signal('');
  readonly selectedNodes = signal<TreeNode[]>([]);
  readonly includeRoot = signal(false);
  readonly isCloning = signal(false);

  private folders = signal<FolderTreeItem[]>([]);

  readonly folderTree = computed(() => {
    return this.buildTree(this.folders(), null);
  });

  readonly selectedCount = computed(() => {
    let count = this.selectedNodes().length;
    if (this.includeRoot()) count++;
    return count;
  });

  private buildTree(folders: FolderTreeItem[], parentId: number | null): TreeNode[] {
    const currentDocId = this.documentId();
    const isFolder = this.documentType() === 'folder';

    return folders
      .filter(f => f.parentId === parentId)
      .filter(f => !isFolder || f.id !== currentDocId)
      .map(folder => ({
        key: String(folder.id),
        label: folder.name,
        data: folder,
        icon: 'fa-duotone fa-solid fa-folder',
        children: this.buildTree(folders, folder.id),
        selectable: !isFolder || !this.isDescendant(folder.id, currentDocId)
      }));
  }

  private isDescendant(folderId: number, targetId: number | null): boolean {
    if (!targetId) return false;
    const folder = this.folders().find(f => f.id === folderId);
    if (!folder) return false;
    if (folder.parentId === targetId) return true;
    if (folder.parentId === null) return false;
    return this.isDescendant(folder.parentId, targetId);
  }

  open(documentId: number, documentType: 'folder' | 'file', documentName: string, allFolders: FolderTreeItem[]): void {
    this.documentId.set(documentId);
    this.documentType.set(documentType);
    this.documentName.set(documentName);
    this.folders.set(allFolders);
    this.selectedNodes.set([]);
    this.includeRoot.set(false);
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
    this.documentId.set(null);
    this.selectedNodes.set([]);
    this.includeRoot.set(false);
  }

  onSelectionChange(nodes: TreeNode | TreeNode[] | null | undefined): void {
    if (Array.isArray(nodes)) {
      this.selectedNodes.set(nodes);
    } else if (nodes) {
      this.selectedNodes.set([nodes]);
    } else {
      this.selectedNodes.set([]);
    }
  }

  toggleRoot(): void {
    this.includeRoot.update(v => !v);
  }

  get hasSelection(): boolean {
    return this.selectedCount() > 0;
  }

  onSubmit(): void {
    const docId = this.documentId();
    if (!docId || !this.hasSelection || this.isCloning()) return;

    this.isCloning.set(true);

    const destinationIds: (number | null)[] = [];

    if (this.includeRoot()) {
      destinationIds.push(null);
    }

    this.selectedNodes().forEach(node => {
      destinationIds.push(Number(node.key));
    });

    this.documentCloned.emit({
      documentId: docId,
      documentType: this.documentType(),
      destinationFolderIds: destinationIds
    });

    this.isCloning.set(false);
    this.close();
  }
}
