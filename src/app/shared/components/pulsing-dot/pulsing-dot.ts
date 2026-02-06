import { Component, input } from "@angular/core";

@Component({
    selector: "app-pulsing-dot",
    imports: [],
    templateUrl: "./pulsing-dot.html",
    styleUrls: ["./pulsing-dot.scss"]
})
export class PulsingDotComponent {
    active = input<boolean>(false);
    color = input<string>('var(--p-green-500)');
}