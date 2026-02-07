import { Component, input } from "@angular/core";

@Component({
    selector: "app-no-results",
    templateUrl: "./no-results.html",
    styleUrls: ["./no-results.scss"],
})
export class NoResultsComponent {
    icon = input<string>('fa-regular fa-file');
    title = input.required<string>();
    description = input<string>('');
}
