import { Injectable, signal } from "@angular/core";

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
    private currentUser = signal<User | null>(null);
    private currentContext = signal<Context>({ organization: null });
    private previousContext = signal<Organization | null>(null);

    readonly user = this.currentUser.asReadonly();
    readonly context = this.currentContext.asReadonly();
    readonly isBrowsingOrganizations = () => this.previousContext() !== null;

    constructor() {
        // Auto-login pour le développement (tant que l'API n'est pas branchée)
        this.autoLogin();
    }

    private autoLogin(): void {
        const user: User = {
            id: '1',
            email: 'thomas.lemaire+admin@sendoc.fr',
            firstName: 'Thomas',
            lastName: 'Lemaire',
            organizations: [
                { id: 'personal', name: 'Thomas Lemaire', isPersonal: true },
                { id: 'sendoc', name: 'Sendoc', isPersonal: false },
                { id: 'terre_du_sud', name: 'Terre du Sud', isPersonal: false, distributionName: 'Sendoc' },
                { id: 'trhea', name: 'TRhéa', isPersonal: false, distributionName: 'Sendoc' },
                { id: 'otre', name: 'OTRE', isPersonal: false, distributionName: 'Sendoc' },
                { id: 'edylink', name: 'Edylink', isPersonal: false, holdingName: 'Sendoc', distributionName: 'Sendoc' },
            ]
        };
        this.currentUser.set(user);
        this.restoreDefaultContext(user);
    }

    isAuthenticated(): boolean {
        return this.currentUser() !== null;
    }

    hasOrganizations(): boolean {
        const user = this.currentUser();
        return user !== null && user.organizations.length > 0;
    }

    hasContext(): boolean {
        return this.currentContext().organization !== null;
    }

    login(email: string, password: string): boolean {
        if (email === 'thomas.lemaire+admin@sendoc.fr' && password === 'Sendoc25!') {
            const user: User = {
                id: '1',
                email: 'thomas.lemaire+admin@sendoc.fr',
                firstName: 'Thomas',
                lastName: 'Lemaire',
                organizations: [
                    { id: 'personal', name: 'Thomas Lemaire', isPersonal: true },
                    { id: 'sendoc', name: 'Sendoc', isPersonal: false },
                    { id: 'terre_du_sud', name: 'Terre du Sud', isPersonal: false, distributionName: 'Sendoc' },
                    { id: 'trhea', name: 'TRhéa', isPersonal: false, distributionName: 'Sendoc' },
                    { id: 'otre', name: 'OTRE', isPersonal: false, distributionName: 'Sendoc' },
                    { id: 'edylink', name: 'Edylink', isPersonal: false, holdingName: 'Sendoc', distributionName: 'Sendoc' },
                ]
            };
            this.currentUser.set(user);
            this.restoreDefaultContext(user);
            return true;
        }
        return false;
    }

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

    logout(): void {
        this.currentUser.set(null);
        this.currentContext.set({ organization: null });
    }

    private saveDefaultContext(organizationId: string): void {
        localStorage.setItem(STORAGE_KEY, organizationId);
    }

    private restoreDefaultContext(user: User): void {
        const savedOrgId = localStorage.getItem(STORAGE_KEY);
        if (savedOrgId) {
            const organization = user.organizations.find(org => org.id === savedOrgId);
            if (organization) {
                this.currentContext.set({ organization });
            }
        }
    }
}
