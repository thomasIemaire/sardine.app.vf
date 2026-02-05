import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { GridComponent, TableToolbarComponent, SelectableComponent } from "@shared/components";

@Component({
    selector: "app-agents",
    imports: [CommonModule, TableToolbarComponent, GridComponent, SelectableComponent],
    templateUrl: "./agents.html",
    styleUrls: ["./agents.scss", "../../_page-table.scss"]
})
export class AgentsComponent {
    toolbarActions = [
        {
            label: "Ajouter un agent",
            icon: "fa-solid fa-plus",
            onClick: () => {
                console.log("Ajouter un agent");
            }
        }
    ]
}
