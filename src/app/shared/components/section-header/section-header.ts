import { CommonModule } from "@angular/common";
import { Component, input } from "@angular/core";

@Component({
    selector: "app-section-header",
    imports: [CommonModule],
    template: `
        <div class="section-header">
            <h3 class="section-header__title">
                <i [class]="icon()"></i>
                {{ title() }}
            </h3>
            <span class="section-header__count">{{ count() }}</span>
        </div>
    `,
    styleUrls: ["./section-header.scss"]
})
export class SectionHeaderComponent {
    title = input.required<string>();
    icon = input.required<string>();
    count = input.required<number>();
}
