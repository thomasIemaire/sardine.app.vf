import { CommonModule } from "@angular/common";
import { Component, computed, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DaysRemainingComponent, GridComponent, NoResultsComponent, PageHeaderComponent, SectionHeaderComponent, TableToolbarComponent, TrashItemComponent, TrashItemData, ViewMode } from "@shared/components";
import { PageComponent } from "../page";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmationService } from "primeng/api";

@Component({
    selector: "app-trash",
    imports: [
        CommonModule,
        FormsModule,
        PageComponent,
        PageHeaderComponent,
        SectionHeaderComponent,
        TableToolbarComponent,
        GridComponent,
        NoResultsComponent,
        TrashItemComponent,
        DaysRemainingComponent,
        TableModule,
        ButtonModule,
        ConfirmDialogModule
    ],
    providers: [ConfirmationService],
    templateUrl: "./trash.html",
    styleUrls: ["./trash.scss"]
})
export class TrashComponent {
    currentView: ViewMode = "card";
    private searchQuery = '';

    private confirmationService: ConfirmationService;

    constructor(confirmationService: ConfirmationService) {
        this.confirmationService = confirmationService;
        this.applyFilters();
    }

    totalItems = computed(() => this.folders.length + this.files.length);

    toolbarActions = computed(() => [
        {
            label: "Vider la corbeille",
            icon: "fa-jelly-fill fa-solid fa-trash",
            severity: "danger",
            text: true,
            onClick: () => this.emptyTrash()
        }
    ]);

    private allFolders: TrashItemData[] = [
        {
            id: 'trash-folder-1',
            name: 'Archives 2022',
            type: 'folder',
            deletedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            originalPath: '/Documents/Archives'
        },
        {
            id: 'trash-folder-2',
            name: 'Projet abandonné',
            type: 'folder',
            deletedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
            originalPath: '/Documents/Projets'
        },
    ];

    private allFiles: TrashItemData[] = [
        {
            id: 'trash-file-1',
            name: 'Ancien rapport',
            type: 'file',
            fileType: 'pdf',
            size: 1250000,
            extension: 'pdf',
            deletedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            originalPath: '/Documents/Rapports'
        },
        {
            id: 'trash-file-2',
            name: 'Budget 2023',
            type: 'file',
            fileType: 'xls',
            size: 89000,
            extension: 'xlsx',
            deletedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            originalPath: '/Documents/Finance'
        },
        {
            id: 'trash-file-3',
            name: 'Photo événement',
            type: 'file',
            fileType: 'img',
            size: 3500000,
            extension: 'jpg',
            deletedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
            originalPath: '/Documents/Images'
        },
        {
            id: 'trash-file-4',
            name: 'Notes réunion',
            type: 'file',
            fileType: 'txt',
            size: 5000,
            extension: 'txt',
            deletedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            originalPath: '/Documents'
        },
    ];

    folders: TrashItemData[] = [];
    files: TrashItemData[] = [];

    onSearch(query: string): void {
        this.searchQuery = query.toLowerCase();
        this.applyFilters();
    }

    onRestoreFolder(folder: TrashItemData): void {
        this.allFolders = this.allFolders.filter(f => f.id !== folder.id);
        this.applyFilters();
    }

    onDeleteFolder(folder: TrashItemData): void {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer définitivement le dossier "${folder.name}" et tout son contenu ?`,
            header: 'Suppression définitive',
            icon: 'fa-solid fa-triangle-exclamation',

            acceptLabel: 'Supprimer',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: () => {
                this.allFolders = this.allFolders.filter(f => f.id !== folder.id);
                this.applyFilters();
            }
        });
    }

    onRestoreFile(file: TrashItemData): void {
        this.allFiles = this.allFiles.filter(f => f.id !== file.id);
        this.applyFilters();
    }

    onDeleteFile(file: TrashItemData): void {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer définitivement le fichier "${file.name}" ?`,
            header: 'Suppression définitive',
            icon: 'fa-solid fa-triangle-exclamation',
            acceptLabel: 'Supprimer',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: () => {
                this.allFiles = this.allFiles.filter(f => f.id !== file.id);
                this.applyFilters();
            }
        });
    }

    private emptyTrash(): void {
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir vider la corbeille ? Cette action est irréversible.',
            header: 'Vider la corbeille',
            icon: 'fa-solid fa-triangle-exclamation',
            acceptLabel: 'Vider',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: () => {
                this.allFolders = [];
                this.allFiles = [];
                this.applyFilters();
            }
        });
    }

    private applyFilters(): void {
        let filteredFolders = [...this.allFolders];
        let filteredFiles = [...this.allFiles];

        if (this.searchQuery) {
            filteredFolders = filteredFolders.filter(f =>
                f.name.toLowerCase().includes(this.searchQuery)
            );
            filteredFiles = filteredFiles.filter(f =>
                f.name.toLowerCase().includes(this.searchQuery)
            );
        }

        // Sort by deletion date (most recent first)
        filteredFolders.sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());
        filteredFiles.sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());

        this.folders = filteredFolders;
        this.files = filteredFiles;
    }

    getDaysRemaining(deletedAt: Date): number {
        const now = new Date();
        const diffTime = 30 * 24 * 60 * 60 * 1000 - (now.getTime() - deletedAt.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
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
}
