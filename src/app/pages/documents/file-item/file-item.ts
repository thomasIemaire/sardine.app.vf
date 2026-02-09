import { CommonModule } from "@angular/common";
import { Component, computed, input } from "@angular/core";
import { SelectableComponent } from "@shared/components";
import { ButtonModule } from "primeng/button";

export type FileType = 'pdf' | 'doc' | 'xls' | 'img' | 'txt' | 'other';

export interface FileItem {
    id: string;
    name: string;
    type: FileType;
    size: number;
    extension: string;
    createdAt: Date;
    updatedAt: Date;
}

@Component({
    selector: "app-file-item",
    imports: [CommonModule, SelectableComponent, ButtonModule],
    templateUrl: "./file-item.html",
    styleUrls: ["./file-item.scss"],
})
export class FileItemComponent {
    file = input.required<FileItem>();

    fileIcon = computed(() => {
        switch (this.file().type) {
            case 'pdf': return 'fa-solid fa-file-pdf';
            case 'doc': return 'fa-solid fa-file-word';
            case 'xls': return 'fa-solid fa-file-excel';
            case 'img': return 'fa-solid fa-file-image';
            case 'txt': return 'fa-solid fa-file-lines';
            default: return 'fa-solid fa-file';
        }
    });

    fileColor = computed(() => {
        switch (this.file().type) {
            case 'pdf': return 'var(--p-red-500)';
            case 'doc': return 'var(--p-blue-500)';
            case 'xls': return 'var(--p-green-500)';
            case 'img': return 'var(--p-purple-500)';
            case 'txt': return 'var(--p-gray-500)';
            default: return 'var(--p-gray-400)';
        }
    });

    fileBgColor = computed(() => {
        switch (this.file().type) {
            case 'pdf': return 'var(--p-red-100)';
            case 'doc': return 'var(--p-blue-100)';
            case 'xls': return 'var(--p-green-100)';
            case 'img': return 'var(--p-purple-100)';
            case 'txt': return 'var(--p-gray-100)';
            default: return 'var(--p-gray-100)';
        }
    });

    formattedSize = computed(() => {
        const size = this.file().size;
        if (size < 1024) return `${size} o`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} Ko`;
        return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
    });
}
