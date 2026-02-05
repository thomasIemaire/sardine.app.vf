import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { TableToolbarComponent, GridComponent, SelectableComponent } from "@shared/components";

@Component({
    selector: "app-flows",
    imports: [CommonModule, TableToolbarComponent, GridComponent, SelectableComponent],
    templateUrl: "./flows.html",
    styleUrls: ["./flows.scss", "../../_page-table.scss"]
})
export class FlowsComponent {
    toolbarActions = [
        {
            label: "Ajouter un flow",
            icon: "fa-solid fa-plus",
            onClick: () => {
                console.log("Ajouter un flow");
            }
        }
    ]
}
