import { CommonModule } from "@angular/common";
import { Component, input } from "@angular/core";

export interface CreatedByData {
    name: string;
    context?: string;
}

@Component({
    selector: "app-created-by",
    imports: [CommonModule],
    template: `
        <div class="created-by">
            <div class="created-by__picture"></div>
            <div class="created-by__infos">
                <span class="created-by__name">{{ data().name }}</span>
                @if (data().context) {
                    <span class="created-by__context">{{ data().context }}</span>
                }
            </div>
        </div>
    `,
    styleUrls: ["./created-by.scss"]
})
export class CreatedByComponent {
    data = input.required<CreatedByData>();
}
