import { CommonModule } from "@angular/common";
import { Component, input } from "@angular/core";

@Component({
    selector: "app-icon-badge",
    imports: [CommonModule],
    template: `
        <div class="icon-badge"
             [style.--bg-color]="bgColor()"
             [style.--icon-color]="iconColor()"
             [class.icon-badge--status]="showStatus()">
            <i [class]="icon()"></i>
        </div>
    `,
    styleUrls: ["./icon-badge.scss"]
})
export class IconBadgeComponent {
    icon = input.required<string>();
    bgColor = input<string>('var(--background-color-200)');
    iconColor = input<string>('var(--background-color-500)');
    showStatus = input<boolean>(false);
}
