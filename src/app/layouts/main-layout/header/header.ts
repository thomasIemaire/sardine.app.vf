import { Component, computed, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { SidebarService, UserService } from "@core/services";
import { MenuItem } from "primeng/api";
import { BreadcrumbModule } from "primeng/breadcrumb";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { filter, map, startWith } from "rxjs";

@Component({
    selector: "app-header",
    imports: [ButtonModule, DividerModule, BreadcrumbModule],
    templateUrl: "./header.html",
    styleUrls: ["./header.scss"],
})
export class HeaderComponent {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private userService = inject(UserService);
    protected sidebarService = inject(SidebarService);

    userName = computed(() => {
        const user = this.userService.user();
        return user ? `${user.firstName} ${user.lastName}` : '';
    });

    private navigationEnd = toSignal(
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            startWith(null),
            map(() => this.buildBreadcrumbs(this.route.root))
        ),
        { initialValue: [] as MenuItem[] }
    );

    breadcrumbs = computed(() => this.navigationEnd());

    logout(): void {
        this.userService.logout();
        this.router.navigate(['/auth/login']);
    }

    private buildBreadcrumbs(route: ActivatedRoute, url = ''): MenuItem[] {
        const items: MenuItem[] = [];

        for (const child of route.children) {
            const path = child.snapshot.url.map(s => s.path).join('/');
            const currentUrl = path ? `${url}/${path}` : url;
            const label = child.snapshot.routeConfig?.data?.['breadcrumb'];

            if (label) {
                items.push({ label, routerLink: currentUrl || '/' });
            }

            items.push(...this.buildBreadcrumbs(child, currentUrl));
        }

        return items;
    }
}