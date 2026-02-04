import { Component } from "@angular/core";
import { ContextItem, ContextItemComponent } from "../context-item/context-item";
import { CommonModule } from "@angular/common";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { FormsModule } from "@angular/forms";

@Component({
    selector: "app-context-switcher",
    imports: [CommonModule, FormsModule, ContextItemComponent, ToggleSwitchModule],
    templateUrl: "./context-switcher.html",
    styleUrls: ["./context-switcher.scss"]
})
export class ContextSwitcherComponent {
    contexts: ContextItem[] = [
        {
            organization: false,
            label: "Personnel"
        },
        {
            organization: true,
            label: "Société A"
        },
    ]

    stopAsking: boolean = false;
}