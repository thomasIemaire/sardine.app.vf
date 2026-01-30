import { ChangeDetectionStrategy, Component, computed, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';

export interface RestoreDocumentResult {
  documentId: number;
  documentType: 'folder' | 'file';
  destinationFolderId: number | null;
}

export interface FolderTreeItem {
  id: number;
  name: string;
  parentId: number | null;
  color?: string;
}

@Component({
  selector: 'app-restore-document-dialog',
  standalone: true,
  imports: [FormsModule, ButtonModule, DialogModule, TreeModule],
  templateUrl: './restore-document-dialog.html',
  styleUrl: './restore-document-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RestoreDocumentDialogComponent {
  @Output() readonly documentRestored = new EventEmitter<RestoreDocumentResult>();

  readonly visible = signal(false);
  readonly documentId = signal<number | null>(null);
  readonly documentType = signal<'folder' | 'file'>('file');
  readonly documentName = signal('');
  readonly originalPath = signal('');
  readonly isRestoring = signal(false);

  readonly folderTree = signal<TreeNode[]>([]);
  readonly selectedNode = signal<TreeNode | null>(null);

  readonly selectedFolderId = computed(() => {
    const node = this.selectedNode();
    if (!node) return null;
    return node.data?.id ?? null;
  });

  readonly selectedPath = computed(() => {
    const node = this.selectedNode();
    if (!node) return 'Racine';
    return this.buildPath(node);
  });

  private buildPath(node: TreeNode): string {
    const parts: string[] = [];
    let current: TreeNode | undefined = node;
    while (current) {
      if (current.label) {
        parts.unshift(current.label);
      }
      current = current.parent;
    }
    return parts.length > 0 ? parts.join(' / ') : 'Racine';
  }

  open(id: number, type: 'folder' | 'file', name: string, originalPath: string, folders: FolderTreeItem[]): void {
    this.documentId.set(id);
    this.documentType.set(type);
    this.documentName.set(name);
    this.originalPath.set(originalPath);
    this.selectedNode.set(null);
    this.folderTree.set(this.buildFolderTree(folders, type === 'folder' ? id : undefined));
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
    this.documentId.set(null);
    this.selectedNode.set(null);
  }

  private buildFolderTree(folders: FolderTreeItem[], excludeFolderId?: number): TreeNode[] {
    const nodeMap = new Map<number, TreeNode>();
    const rootNodes: TreeNode[] = [];

    // First pass: create all nodes
    for (const folder of folders) {
      if (folder.id === excludeFolderId) continue;

      nodeMap.set(folder.id, {
        key: String(folder.id),
        label: folder.name,
        data: { id: folder.id, color: folder.color },
        icon: 'fa-duotone fa-solid fa-folder',
        children: [],
        expanded: true
      });
    }

    // Second pass: build hierarchy
    for (const folder of folders) {
      if (folder.id === excludeFolderId) continue;

      const node = nodeMap.get(folder.id);
      if (!node) continue;

      if (folder.parentId === null) {
        rootNodes.push(node);
      } else {
        const parentNode = nodeMap.get(folder.parentId);
        if (parentNode) {
          parentNode.children = parentNode.children || [];
          parentNode.children.push(node);
          node.parent = parentNode;
        } else {
          // Parent was excluded or doesn't exist, add to root
          rootNodes.push(node);
        }
      }
    }

    return rootNodes;
  }

  onNodeSelect(event: { node: TreeNode }): void {
    this.selectedNode.set(event.node);
  }

  restoreToOriginal(): void {
    this.selectedNode.set(null);
    this.onSubmit();
  }

  onSubmit(): void {
    const id = this.documentId();
    if (id === null) return;

    this.isRestoring.set(true);

    // Simulate API call
    setTimeout(() => {
      this.documentRestored.emit({
        documentId: id,
        documentType: this.documentType(),
        destinationFolderId: this.selectedFolderId()
      });
      this.isRestoring.set(false);
      this.close();
    }, 500);
  }
}
