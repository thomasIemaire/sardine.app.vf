import { Component } from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { PageHeaderComponent, PageHeaderTab } from "@shared/components";
import { PageComponent } from "../page";

@Component({
    selector: "app-automation",
    imports: [PageComponent, PageHeaderComponent, RouterOutlet],
    templateUrl: "./automation.html",
    styleUrls: ["./automation.scss"],
})
export class AutomationComponent {
    constructor(private router: Router) {}

    tabs: PageHeaderTab[] = [
        { id: 'agents', label: 'Agents' },
        { id: 'flows', label: 'Flows', subtabs: [
            { id: 'all', label: 'Tous' },
            { id: 'templates', label: 'Modèles' },
        ] },
    ];

    openDocumentation = (): void => {
        this.router.navigate(['/automation/docs']);
    }
}
