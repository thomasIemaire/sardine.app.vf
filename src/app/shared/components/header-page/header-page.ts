import { Component, input } from "@angular/core";

@Component({
    selector: "app-header-page",
    template: `
    <div class="header-page">
        <span class="page-title">{{ title() }}</span>
        <span class="page-subtitle">{{ subtitle() }}</span>
    </div>
  `,
    styleUrls: ["./header-page.scss"],
})
export class HeaderPageComponent {
    readonly title = input.required<string>();
    readonly subtitle = input<string>("");
}