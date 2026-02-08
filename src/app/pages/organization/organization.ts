import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { PageHeaderComponent, PageHeaderTab } from "@shared/components";
import { PageComponent } from "../page";

@Component({
    selector: "app-organization",
    imports: [PageComponent, PageHeaderComponent, RouterOutlet],
    templateUrl: "./organization.html",
    styleUrls: ["./organization.scss"],
})
export class OrganizationComponent {
    tabs: PageHeaderTab[] = [
        { id: 'members', label: 'Membres', subtabs: [
            { id: 'users', label: 'Utilisateurs' },
            { id: 'teams', label: 'Équipes' },
        ]},
        { id: 'clients', label: 'Clients' },
    ];
}
