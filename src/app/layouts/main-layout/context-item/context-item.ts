import { Component, input, output } from "@angular/core";
import { Organization } from "@core/services";
import { SelectableComponent } from "@shared/components";

@Component({
    selector: "app-context-item",
    imports: [SelectableComponent],
    templateUrl: "./context-item.html",
    styleUrls: ["./context-item.scss"],
})
export class ContextItemComponent {
    organization = input.required<Organization>();

    select = output<Organization>();

    onSelect(): void {
        this.select.emit(this.organization());
    }
}