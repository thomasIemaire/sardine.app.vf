import { CommonModule } from "@angular/common";
import { Component, computed, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { GridComponent, NoResultsComponent, PageHeaderComponent, SectionHeaderComponent, TableToolbarComponent, ViewMode } from "@shared/components";
import { PageComponent } from "../page";
import { FolderItem, FolderItemComponent } from "./folder-item/folder-item";
import { FileItem, FileItemComponent } from "./file-item/file-item";
import { MenuItem } from "primeng/api";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { MenuModule } from "primeng/menu";

interface Breadcrumb {
    id: string;
    name: string;
}

@Component({
    selector: "app-documents",
    imports: [
        CommonModule,
        FormsModule,
        PageComponent,
        PageHeaderComponent,
        SectionHeaderComponent,
        TableToolbarComponent,
        GridComponent,
        NoResultsComponent,
        FolderItemComponent,
        FileItemComponent,
        TableModule,
        ButtonModule,
        MenuModule
    ],
    templateUrl: "./documents.html",
    styleUrls: ["./documents.scss"]
})
export class DocumentsComponent {
    currentView: ViewMode = "card";
    private searchQuery = '';

    currentFolderId = signal<string | null>(null);

    breadcrumbs = computed<Breadcrumb[]>(() => {
        const folderId = this.currentFolderId();
        if (!folderId) return [];

        const buildPath = (id: string): Breadcrumb[] => {
            const folder = this.allFolders.find(f => f.id === id);
            if (!folder) return [];

            const parent = this.folderParents[id];
            if (parent) {
                return [...buildPath(parent), { id: folder.id, name: folder.name }];
            }
            return [{ id: folder.id, name: folder.name }];
        };

        return buildPath(folderId);
    });

    pageTitle = computed(() => {
        const crumbs = this.breadcrumbs();
        return crumbs.length > 0 ? crumbs[crumbs.length - 1].name : 'Documents';
    });

    pageDescription = computed(() => {
        const folderId = this.currentFolderId();
        if (!folderId) return 'Gérez vos documents et dossiers';
        return null;
    });

    toolbarActions = computed(() => [
        {
            label: "Nouveau dossier",
            icon: "fa-solid fa-folder-plus",
            outlined: true,
            onClick: () => this.createFolder()
        },
        {
            label: "Importer un fichier",
            icon: "fa-solid fa-upload",
            onClick: () => this.uploadFile()
        }
    ]);

    private folderParents: Record<string, string | null> = {
        'folder-1': null,
        'folder-2': null,
        'folder-3': null,
        'folder-1-1': 'folder-1',
        'folder-1-2': 'folder-1',
        'folder-2-1': 'folder-2',
    };

    private allFolders: FolderItem[] = [
        { id: 'folder-1', name: 'Factures', filesCount: 12, foldersCount: 2, updatedAt: new Date() },
        { id: 'folder-2', name: 'Contrats', filesCount: 8, foldersCount: 1, updatedAt: new Date() },
        { id: 'folder-3', name: 'Documents administratifs', filesCount: 25, foldersCount: 0, updatedAt: new Date() },
        { id: 'folder-1-1', name: 'Factures 2024', filesCount: 5, foldersCount: 0, updatedAt: new Date() },
        { id: 'folder-1-2', name: 'Factures 2023', filesCount: 7, foldersCount: 0, updatedAt: new Date() },
        { id: 'folder-2-1', name: 'Contrats clients', filesCount: 4, foldersCount: 0, updatedAt: new Date() },
    ];

    private allFiles: (FileItem & { folderId: string | null })[] = [
        { id: 'file-1', name: 'Rapport annuel 2024', type: 'pdf', size: 2457600, extension: 'pdf', createdAt: new Date(), updatedAt: new Date(), folderId: null },
        { id: 'file-2', name: 'Budget prévisionnel', type: 'xls', size: 156000, extension: 'xlsx', createdAt: new Date(), updatedAt: new Date(), folderId: null },
        { id: 'file-3', name: 'Présentation produit', type: 'doc', size: 890000, extension: 'docx', createdAt: new Date(), updatedAt: new Date(), folderId: null },
        { id: 'file-4', name: 'Logo entreprise', type: 'img', size: 45000, extension: 'png', createdAt: new Date(), updatedAt: new Date(), folderId: null },
        { id: 'file-5', name: 'Notes de réunion', type: 'txt', size: 12000, extension: 'txt', createdAt: new Date(), updatedAt: new Date(), folderId: null },
        { id: 'file-6', name: 'Facture janvier', type: 'pdf', size: 125000, extension: 'pdf', createdAt: new Date(), updatedAt: new Date(), folderId: 'folder-1-1' },
        { id: 'file-7', name: 'Facture février', type: 'pdf', size: 118000, extension: 'pdf', createdAt: new Date(), updatedAt: new Date(), folderId: 'folder-1-1' },
        { id: 'file-8', name: 'Contrat client ABC', type: 'pdf', size: 340000, extension: 'pdf', createdAt: new Date(), updatedAt: new Date(), folderId: 'folder-2-1' },
    ];

    folders: FolderItem[] = [];
    files: FileItem[] = [];

    constructor() {
        this.applyFilters();
    }

    onSearch(query: string): void {
        this.searchQuery = query.toLowerCase();
        this.applyFilters();
    }

    navigateToFolder(folder: FolderItem): void {
        this.currentFolderId.set(folder.id);
        this.searchQuery = '';
        this.applyFilters();
    }

    navigateToBreadcrumb(breadcrumb: Breadcrumb): void {
        this.currentFolderId.set(breadcrumb.id);
        this.searchQuery = '';
        this.applyFilters();
    }

    navigateBack(): void {
        const currentId = this.currentFolderId();
        if (currentId) {
            const parentId = this.folderParents[currentId];
            this.currentFolderId.set(parentId);
            this.searchQuery = '';
            this.applyFilters();
        }
    }

    navigateToRoot(): void {
        this.currentFolderId.set(null);
        this.searchQuery = '';
        this.applyFilters();
    }

    private applyFilters(): void {
        const currentId = this.currentFolderId();

        let filteredFolders = this.allFolders.filter(f => this.folderParents[f.id] === currentId);
        let filteredFiles = this.allFiles.filter(f => f.folderId === currentId);

        if (this.searchQuery) {
            filteredFolders = filteredFolders.filter(f =>
                f.name.toLowerCase().includes(this.searchQuery)
            );
            filteredFiles = filteredFiles.filter(f =>
                f.name.toLowerCase().includes(this.searchQuery)
            );
        }

        this.folders = filteredFolders;
        this.files = filteredFiles;
    }

    getFileIcon(type: string): string {
        switch (type) {
            case 'pdf': return 'fa-solid fa-file-pdf';
            case 'doc': return 'fa-solid fa-file-word';
            case 'xls': return 'fa-solid fa-file-excel';
            case 'img': return 'fa-solid fa-file-image';
            case 'txt': return 'fa-solid fa-file-lines';
            default: return 'fa-solid fa-file';
        }
    }

    formatFileSize(size: number): string {
        if (size < 1024) return `${size} o`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} Ko`;
        return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
    }

    private createFolder(): void {
        console.log('Create folder');
    }

    private uploadFile(): void {
        console.log('Upload file');
    }

    getFolderMenuItems(folder: FolderItem): MenuItem[] {
        return [
            {
                label: 'Ouvrir',
                icon: 'fa-jelly-fill fa-solid fa-folder',
                command: () => this.navigateToFolder(folder)
            },
            { separator: true },
            {
                label: 'Renommer',
                icon: 'fa-solid fa-pen',
                command: () => console.log('Rename folder', folder)
            },
            {
                label: 'Déplacer',
                icon: 'fa-solid fa-arrows-up-down-left-right',
                command: () => console.log('Move folder', folder)
            },
            {
                label: 'Partager',
                icon: 'fa-jelly-fill fa-solid fa-share-nodes',
                command: () => console.log('Share folder', folder)
            },
            { separator: true },
            {
                label: 'Supprimer',
                icon: 'fa-jelly-fill fa-solid fa-trash',
                styleClass: 'menu-item-danger',
                command: () => console.log('Delete folder', folder)
            }
        ];
    }

    getFileMenuItems(file: FileItem): MenuItem[] {
        return [
            {
                label: 'Ouvrir',
                icon: 'fa-jelly-fill fa-solid fa-arrow-up-right-from-square',
                command: () => console.log('Open file', file)
            },
            {
                label: 'Télécharger',
                icon: 'fa-solid fa-download',
                command: () => console.log('Download file', file)
            },
            { separator: true },
            {
                label: 'Renommer',
                icon: 'fa-solid fa-pen',
                command: () => console.log('Rename file', file)
            },
            {
                label: 'Déplacer',
                icon: 'fa-solid fa-arrows-up-down-left-right',
                command: () => console.log('Move file', file)
            },
            {
                label: 'Partager',
                icon: 'fa-jelly-fill fa-solid fa-share-nodes',
                command: () => console.log('Share file', file)
            },
            { separator: true },
            {
                label: 'Supprimer',
                icon: 'fa-jelly-fill fa-solid fa-trash',
                styleClass: 'menu-item-danger',
                command: () => console.log('Delete file', file)
            }
        ];
    }
}
