import { CommonModule } from "@angular/common";
import { Component, input, output, viewChild } from "@angular/core";
import { SelectableComponent } from "@shared/components";
import { MenuItem } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { Menu, MenuModule } from "primeng/menu";

export interface FolderItem {
    id: string;
    name: string;
    filesCount: number;
    foldersCount: number;
    updatedAt: Date;
}

@Component({
    selector: "app-folder-item",
    imports: [CommonModule, SelectableComponent, ButtonModule, MenuModule],
    templateUrl: "./folder-item.html",
    styleUrls: ["./folder-item.scss"],
})
export class FolderItemComponent {
    folder = input.required<FolderItem>();
    menuItems = input.required<MenuItem[]>();
    folderClick = output<FolderItem>();

    menu = viewChild.required<Menu>('menu');

    onFolderClick(): void {
        this.folderClick.emit(this.folder());
    }

    toggleMenu(event: Event): void {
        this.menu().toggle(event);
    }
}
