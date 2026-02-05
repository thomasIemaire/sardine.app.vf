import { Component } from "@angular/core";
import { PageComponent } from "@pages/page";
import { PageHeaderComponent } from "@shared/components/page-header/page-header";

@Component({
    selector: "app-home",
    imports: [PageComponent, PageHeaderComponent],
    templateUrl: "./home.html",
    styleUrls: ["./home.scss"],
})
export class HomeComponent {}
