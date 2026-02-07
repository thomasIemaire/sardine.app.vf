import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { PageHeaderComponent } from "@shared/components";
import { PageComponent } from "../page";

@Component({
    selector: "app-organization",
    imports: [PageComponent, PageHeaderComponent, RouterOutlet],
    templateUrl: "./organization.html",
    styleUrls: ["./organization.scss"],
})
export class OrganizationComponent {}
