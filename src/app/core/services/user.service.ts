import { Injectable, inject, signal } from "@angular/core";
import { Observable, tap, of, catchError, map } from "rxjs";
import { ApiService } from "./api.service";
import { AuthService } from "./auth.service";
import { UserResponse, OrganizationResponse } from "@models/api.model";

// Re-export types for backwards compatibility
export interface Organization {
    id: string;
    name: string;
    isPersonal: boolean;
    holdingName?: string;
    distributionName?: string;
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    organizations: Organization[];
}

export interface Context {
    organization: Organization | null;
}

const STORAGE_KEY = 'sardine_default_context';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private api = inject(ApiService);
    private authService = inject(AuthService);

    private currentUser = signal<User | null>(null);
    private currentContext = signal<Context>({ organization: null });
    private previousContext = signal<Organization | null>(null);
    private loadingUser = signal<boolean>(false);

    readonly user = this.currentUser.asReadonly();
    readonly context = this.currentContext.asReadonly();
    readonly loading = this.loadingUser.asReadonly();
    readonly isBrowsingOrganizations = () => this.previousContext() !== null;

    // ========================================================================
    // Auth Status
    // ========================================================================

    isAuthenticated(): boolean {
        return this.authService.isAuthenticated();
    }

    hasOrganizations(): boolean {
        const user = this.currentUser();
        return user !== null && user.organizations.length > 0;
    }

    hasContext(): boolean {
        return this.currentContext().organization !== null;
    }

    // ========================================================================
    // User Data
    // ========================================================================

    loadCurrentUser(): Observable<User | null> {
        if (!this.isAuthenticated()) {
            return of(null);
        }

        this.loadingUser.set(true);

        return this.api.get<UserResponse>('/users/me').pipe(
            map(response => this.mapUserResponse(response)),
            tap(user => {
                if (user) {
                    this.loadUserOrganizations(user);
                }
            }),
            catchError(() => {
                this.loadingUser.set(false);
                return of(null);
            })
        );
    }

    private loadUserOrganizations(user: User): void {
        this.api.get<OrganizationResponse[]>('/users/me/organizations').pipe(
            map(orgs => orgs.map(org => this.mapOrganizationResponse(org))),
            tap(organizations => {
                const fullUser: User = { ...user, organizations };
                this.currentUser.set(fullUser);
                this.restoreDefaultContext(fullUser);
                this.loadingUser.set(false);
            }),
            catchError(() => {
                this.currentUser.set(user);
                this.loadingUser.set(false);
                return of([]);
            })
        ).subscribe();
    }

    // ========================================================================
    // Context Management
    // ========================================================================

    selectContext(organization: Organization, remember = false): void {
        this.currentContext.set({ organization });
        this.previousContext.set(null);
        if (remember) {
            this.saveDefaultContext(organization.id);
        }
    }

    clearContext(): void {
        const current = this.currentContext().organization;
        this.previousContext.set(current);
        this.currentContext.set({ organization: null });
    }

    closeBrowser(): void {
        const previous = this.previousContext();
        if (previous) {
            this.currentContext.set({ organization: previous });
            this.previousContext.set(null);
        }
    }

    clearDefaultContext(): void {
        localStorage.removeItem(STORAGE_KEY);
    }

    // ========================================================================
    // Auth Actions
    // ========================================================================

    logout(): void {
        this.authService.logout().subscribe(() => {
            this.currentUser.set(null);
            this.currentContext.set({ organization: null });
            this.previousContext.set(null);
        });
    }

    // ========================================================================
    // Helper: Get current organization ID
    // ========================================================================

    getCurrentOrgId(): string | null {
        return this.currentContext().organization?.id ?? null;
    }

    // ========================================================================
    // Private Methods
    // ========================================================================

    private saveDefaultContext(organizationId: string): void {
        localStorage.setItem(STORAGE_KEY, organizationId);
    }

    private restoreDefaultContext(user: User): void {
        const savedOrgId = localStorage.getItem(STORAGE_KEY);
        if (savedOrgId) {
            const organization = user.organizations.find(org => org.id === savedOrgId);
            if (organization) {
                this.currentContext.set({ organization });
                return;
            }
        }
        // If no saved context or not found, select the personal org or first one
        const personalOrg = user.organizations.find(org => org.isPersonal);
        if (personalOrg) {
            this.currentContext.set({ organization: personalOrg });
        } else if (user.organizations.length > 0) {
            this.currentContext.set({ organization: user.organizations[0] });
        }
    }

    private mapUserResponse(response: UserResponse): User {
        return {
            id: response.id,
            email: response.email,
            firstName: response.first_name,
            lastName: response.last_name,
            avatarUrl: response.avatar_url ?? undefined,
            organizations: []
        };
    }

    private mapOrganizationResponse(response: OrganizationResponse): Organization {
        return {
            id: response.id,
            name: response.name,
            isPersonal: response.is_personal,
            holdingName: response.holding_name ?? undefined,
            distributionName: response.distributor_name ?? undefined
        };
    }
}
