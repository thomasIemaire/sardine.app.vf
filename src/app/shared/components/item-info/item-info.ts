import { CommonModule } from "@angular/common";
import { Component, input } from "@angular/core";

@Component({
    selector: "app-item-info",
    imports: [CommonModule],
    template: `
        <div class="item-info">
            @if (icon()) {
                <i [class]="icon()"></i>
            }
            <span>{{ label() }}</span>
        </div>
    `,
    styleUrls: ["./item-info.scss"]
})
export class ItemInfoComponent {
    icon = input<string>();
    label = input.required<string>();
}
