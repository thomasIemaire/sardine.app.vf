import { Injectable, signal } from "@angular/core";

export interface Organization {
    id: string;
    name: string;
    isPersonal: boolean;
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

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private currentUser = signal<User | null>(null);
    private currentContext = signal<Context>({ organization: null });

    readonly user = this.currentUser.asReadonly();
    readonly context = this.currentContext.asReadonly();

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
            this.currentUser.set({
                id: '1',
                email: 'thomas.lemaire+admin@sendoc.fr',
                firstName: 'Thomas',
                lastName: 'Lemaire',
                organizations: [
                    { id: 'personal', name: 'Thomas Lemaire', isPersonal: true },
                    { id: 'sendoc', name: 'Sendoc', isPersonal: false }
                ]
            });
            return true;
        }
        return false;
    }

    selectContext(organization: Organization): void {
        this.currentContext.set({ organization });
    }

    clearContext(): void {
        this.currentContext.set({ organization: null });
    }

    logout(): void {
        this.currentUser.set(null);
        this.currentContext.set({ organization: null });
    }
}
