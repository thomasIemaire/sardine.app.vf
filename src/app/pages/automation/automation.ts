import { Component } from "@angular/core";
import { PageHeaderComponent, PageHeaderTab } from "@shared/components";
import { PageComponent } from "../page";

@Component({
    selector: "app-automation",
    imports: [PageComponent, PageHeaderComponent],
    templateUrl: "./automation.html",
    styleUrls: ["./automation.scss"],
})
export class AutomationComponent {
    tabs: PageHeaderTab[] = [
        { id: 'flows', label: 'Flows' },
        { id: 'agents', label: 'Agents' },
    ];
}
