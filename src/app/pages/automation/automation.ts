import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { PageHeaderComponent, PageHeaderTab } from "@shared/components";
import { PageComponent } from "../page";

@Component({
    selector: "app-automation",
    imports: [PageComponent, PageHeaderComponent],
    templateUrl: "./automation.html",
    styleUrls: ["./automation.scss"],
})
export class AutomationComponent {
    constructor(private router: Router) {}

    tabs: PageHeaderTab[] = [
        { id: 'agents', label: 'Agents' },
        { id: 'flows', label: 'Flows' },
    ];

    openDocumentation = (): void => {
        this.router.navigate(['/automation/docs']);
    }
}
