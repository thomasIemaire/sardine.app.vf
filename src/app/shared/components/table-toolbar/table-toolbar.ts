import { CommonModule } from "@angular/common";
import { Component, input } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { FormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";

export interface TableToolbarAction {
    label: string;
    icon: string;
    severity?: string;
    text?: boolean;
    outlined?: boolean;
    onClick: () => void;
}

@Component({
    selector: "app-table-toolbar",
    imports: [CommonModule, FormsModule, InputTextModule, ButtonModule],
    templateUrl: "./table-toolbar.html",
    styleUrls: ["./table-toolbar.scss"]
})
export class TableToolbarComponent {
    searchField = input<boolean>(true);
    searchFieldPlaceholder = input<string>("Rechercher...");
    actions = input<TableToolbarAction[]>([]);

    value: string = "";
}