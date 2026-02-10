import { CommonModule } from "@angular/common";
import { Component, input } from "@angular/core";

@Component({
    selector: "app-created-at",
    imports: [CommonModule],
    template: `
        <div class="created-at">
            {{ prefix() }} {{ date() | date:'dd/MM/yyyy' }}
        </div>
    `,
    styleUrls: ["./created-at.scss"]
})
export class CreatedAtComponent {
    date = input.required<Date>();
    prefix = input<string>('Créé le');
}
