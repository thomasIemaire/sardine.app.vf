import { CommonModule } from "@angular/common";
import { Component, computed, input, output, viewChild } from "@angular/core";
import { SelectableComponent } from "@shared/components";
import { MenuItem } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { Menu, MenuModule } from "primeng/menu";
import { CreatedBy } from "../../agents/agent-item/agent-item";

export interface FlowItem {
    id: string;
    name: string;
    reference?: string;
    version: string;
    description: string;
    status: "active" | "inactive" | "error";
    createdBy: CreatedBy;
    createdAt: Date;
    isTemplate: boolean;
}

@Component({
    selector: "app-flow-item",
    imports: [CommonModule, SelectableComponent, ButtonModule, MenuModule],
    templateUrl: "./flow-item.html",
    styleUrls: ["./flow-item.scss"],
    host: {
        '[class.flow-item--template]': 'flow().isTemplate'
    }
})
export class FlowItemComponent {
    flow = input.required<FlowItem>();
    menuItems = input.required<MenuItem[]>();
    openFlow = output<FlowItem>();

    menu = viewChild.required<Menu>('menu');

    statusColor = computed(() => {
        switch (this.flow().status) {
            case 'active': return 'var(--p-green-500)';
            case 'error': return 'var(--p-red-500)';
            default: return 'var(--p-gray-400)';
        }
    });

    onClick(): void {
        this.openFlow.emit(this.flow());
    }

    toggleMenu(event: Event): void {
        this.menu().toggle(event);
    }
}
