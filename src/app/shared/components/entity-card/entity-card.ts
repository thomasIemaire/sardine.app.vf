import { CommonModule } from "@angular/common";
import { Component, input, output, viewChild } from "@angular/core";
import { SelectableComponent } from "../selectable/selectable";
import { MenuItem } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { Menu, MenuModule } from "primeng/menu";

@Component({
    selector: "app-entity-card",
    imports: [CommonModule, SelectableComponent, ButtonModule, MenuModule],
    templateUrl: "./entity-card.html",
    styleUrls: ["./entity-card.scss"],
    host: {
        '[class.entity-card--dashed]': 'dashed()'
    }
})
export class EntityCardComponent {
    menuItems = input.required<MenuItem[]>();
    dashed = input<boolean>(false);
    clickable = input<boolean>(false);
    cardClick = output<void>();

    menu = viewChild.required<Menu>('menu');

    onClick(): void {
        if (this.clickable()) {
            this.cardClick.emit();
        }
    }

    toggleMenu(event: Event): void {
        this.menu().toggle(event);
    }
}
