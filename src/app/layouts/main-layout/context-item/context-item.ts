import { Component, input } from "@angular/core";
import { SelectableComponent } from "@shared/components";

export interface ContextItem {
    organization: boolean;
    label: string;
}

@Component({
    selector: "app-context-item",
    imports: [SelectableComponent],
    templateUrl: "./context-item.html",
    styleUrls: ["./context-item.scss"],
})
export class ContextItemComponent {
    context = input.required<ContextItem>();
}