import { Component, output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { FieldComponent, MultiselectFieldComponent, SelectFieldComponent, TextareaFieldComponent, TextFieldComponent, ToggleSwitchFieldComponent } from "@shared/components";

export interface CreateOrganizationData {
    name: string;
    description: string;
    holding: string | null;
    distributor: string | null;
    members: string[];
}

@Component({
    selector: "app-create-organization-dialog",
    imports: [FormsModule, DialogModule, ButtonModule, FieldComponent, SelectFieldComponent, TextareaFieldComponent, TextFieldComponent, MultiselectFieldComponent, ToggleSwitchFieldComponent],
    templateUrl: "./create-organization-dialog.html",
    styleUrls: ["./create-organization-dialog.scss"]
})
export class CreateOrganizationDialogComponent {
    visible = signal(false);
    submitted = output<CreateOrganizationData>();

    name = '';
    description = '';
    holding: string | null = null;
    distributor: string | null = null;
    selectedMembers: string[] = [];
    allParentMembers = false;

    holdingOptions = [
        { label: 'Sardine Group', value: 'sardine-group' },
        { label: 'Sendoc Holding', value: 'sendoc-holding' },
    ];

    distributorOptions = [
        { label: 'Distributeur A', value: 'dist-a' },
        { label: 'Distributeur B', value: 'dist-b' },
    ];

    memberOptions = [
        { label: 'John Doe', value: 'user-1' },
        { label: 'Jane Doe', value: 'user-2' },
        { label: 'Thomas Lemaire', value: 'user-3' },
    ];

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
            description: this.description,
            holding: this.holding,
            distributor: this.distributor,
            members: this.selectedMembers,
        });

        this.close();
    }

    isValid(): boolean {
        return !!this.name.trim();
    }

    onAllParentMembersChange(): void {
        if (this.allParentMembers) {
            this.selectedMembers = [];
        }
    }

    private reset(): void {
        this.name = '';
        this.description = '';
        this.holding = null;
        this.distributor = null;
        this.selectedMembers = [];
        this.allParentMembers = false;
    }
}
