import { Component, input } from "@angular/core";

@Component({
    selector: "app-field",
    templateUrl: "./field.html",
    styleUrls: ["./field.scss"],
})
export class FieldComponent {
    label = input<string>('');
    required = input<boolean>(false);
    error = input<string>('');
}
