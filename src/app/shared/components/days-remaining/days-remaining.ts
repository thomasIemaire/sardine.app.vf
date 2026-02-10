import { CommonModule } from "@angular/common";
import { Component, input, computed } from "@angular/core";

@Component({
    selector: "app-days-remaining",
    imports: [CommonModule],
    template: `
        <div class="days-remaining" [class.days-remaining--warning]="isWarning()">
            <span class="days-remaining__count">{{ days() }}</span>
            <span class="days-remaining__label">jours</span>
        </div>
    `,
    styleUrls: ["./days-remaining.scss"]
})
export class DaysRemainingComponent {
    days = input.required<number>();
    warningThreshold = input<number>(7);

    isWarning = computed(() => this.days() <= this.warningThreshold());
}
