import { Component, input, output } from "@angular/core";
import { ButtonModule } from "primeng/button";

@Component({
    selector: "app-form",
    imports: [ButtonModule],
    templateUrl: "./form.html",
    styleUrls: ["./form.scss"],
})
export class FormComponent {
    title = input<string>('');
    submitLabel = input<string>('Valider');

    formSubmit = output<void>();

    onSubmit(event: Event): void {
        event.preventDefault();
        this.formSubmit.emit();
    }
}
