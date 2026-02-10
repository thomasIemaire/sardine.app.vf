import { CommonModule } from "@angular/common";
import { Component, computed, input, viewChild } from "@angular/core";
import { SelectableComponent } from "@shared/components";
import { MenuItem } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { Menu, MenuModule } from "primeng/menu";

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
    imports: [CommonModule, SelectableComponent, ButtonModule, MenuModule],
    templateUrl: "./file-item.html",
    styleUrls: ["./file-item.scss"],
})
export class FileItemComponent {
    file = input.required<FileItem>();
    menuItems = input.required<MenuItem[]>();

    menu = viewChild.required<Menu>('menu');

    toggleMenu(event: Event): void {
        this.menu().toggle(event);
    }

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
            case 'doc': return 'var(--blue-color-500)';
            case 'xls': return 'var(--green-color-500)';
            case 'img': return 'var(--purple-color-500)';
            case 'txt': return 'var(--gray-color-500)';
            default: return 'var(--gray-color-400)';
        }
    });

    fileBgColor = computed(() => {
        switch (this.file().type) {
            case 'pdf': return 'var(--red-color-100)';
            case 'doc': return 'var(--blue-color-100)';
            case 'xls': return 'var(--green-color-100)';
            case 'img': return 'var(--purple-color-100)';
            case 'txt': return 'var(--gray-color-100)';
            default: return 'var(--gray-color-100)';
        }
    });

    formattedSize = computed(() => {
        const size = this.file().size;
        if (size < 1024) return `${size} o`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} Ko`;
        return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
    });
}
