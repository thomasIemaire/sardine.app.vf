import { CommonModule } from "@angular/common";
import { Component, input, output } from "@angular/core";
import { SelectableComponent } from "@shared/components";
import { ButtonModule } from "primeng/button";

export interface FolderItem {
    id: string;
    name: string;
    filesCount: number;
    foldersCount: number;
    updatedAt: Date;
}

@Component({
    selector: "app-folder-item",
    imports: [CommonModule, SelectableComponent, ButtonModule],
    templateUrl: "./folder-item.html",
    styleUrls: ["./folder-item.scss"],
})
export class FolderItemComponent {
    folder = input.required<FolderItem>();
    folderClick = output<FolderItem>();

    onFolderClick(): void {
        this.folderClick.emit(this.folder());
    }
}
