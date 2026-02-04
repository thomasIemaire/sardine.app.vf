import { Component, input } from "@angular/core";

export interface ContextItem {
    organization: boolean;
    label: string;
}

@Component({
    selector: "app-context-item",
    templateUrl: "./context-item.html",
    styleUrls: ["./context-item.scss"],
})
export class ContextItemComponent {
    context = input.required<ContextItem>();
}