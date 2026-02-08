import { Component, computed, inject, output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { FieldComponent, MultiselectFieldComponent, SelectFieldComponent, TextareaFieldComponent, TextFieldComponent, ToggleSwitchFieldComponent } from "@shared/components";
import { DividerModule } from "primeng/divider";
import { UserService } from "@core/services";

export interface CreateFlowData {
    name: string;
    reference: string;
    description: string;
    status: 'active' | 'inactive';
}

@Component({
    selector: "app-create-flow-dialog",
    imports: [FormsModule, DialogModule, ButtonModule, FieldComponent, SelectFieldComponent, TextareaFieldComponent, TextFieldComponent, DividerModule, MultiselectFieldComponent, ToggleSwitchFieldComponent],
    templateUrl: "./create-flow-dialog.html",
    styleUrls: ["./create-flow-dialog.scss"]
})
export class CreateFlowDialogComponent {
    private userService = inject(UserService);

    visible = signal(false);
    submitted = output<CreateFlowData>();

    name = '';
    reference = '';
    description = '';
    status: 'active' | 'inactive' | null = null;

    statusOptions = [
        { label: 'Actif', value: 'active' as const },
        { label: 'Inactif', value: 'inactive' as const }
    ];

    organizationOptions = computed(() => {
        const currentOrgId = this.userService.context().organization?.id;
        return this.userService.user()?.organizations
            ?.filter(org => org.id !== currentOrgId)
            .map(org => ({ label: org.name, value: org.id })) ?? [];
    });

    selectedOrganizations: string[] = [];

    shareAllChildren = false;

    open(): void {
        this.reset();
        this.visible.set(true);
    }

    close(): void {
        this.visible.set(false);
    }

    submit(): void {
        if (!this.isValid()) return;

        this.submitted.emit({
            name: this.name,
            reference: this.reference,
            description: this.description,
            status: this.status!
        });

        this.close();
    }

    isValid(): boolean {
        return !!this.name.trim() && !!this.reference.trim() && !!this.status;
    }

    onShareAllChildrenChange(): void {
        if (this.shareAllChildren) {
            this.selectedOrganizations = [];
        }
    }

    private reset(): void {
        this.name = '';
        this.reference = '';
        this.description = '';
        this.status = null;
    }
}
