import { ChangeDetectorRef, Component, inject, output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { FieldComponent, MultiselectFieldComponent, SelectFieldComponent, TextareaFieldComponent, TextFieldComponent, ToggleSwitchFieldComponent } from "@shared/components";
import { MembersService, OrganizationsService, UserService } from "@core/services";

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
    private cdr = inject(ChangeDetectorRef);
    private organizationsService = inject(OrganizationsService);
    private membersService = inject(MembersService);
    private userService = inject(UserService);

    visible = signal(false);
    submitted = output<CreateOrganizationData>();

    name = '';
    description = '';
    holding: string | null = null;
    distributor: string | null = null;
    selectedMembers: string[] = [];
    allParentMembers = false;

    holdingOptions: { label: string; value: string }[] = [];
    distributorOptions: { label: string; value: string }[] = [];
    memberOptions: { label: string; value: string }[] = [];

    open(): void {
        this.reset();
        this.loadOptions();
        this.visible.set(true);
    }

    private loadOptions(): void {
        this.organizationsService.list().subscribe(orgs => {
            const options = orgs.map(o => ({ label: o.name, value: o.id }));
            this.holdingOptions = options;
            this.distributorOptions = options;
            this.cdr.markForCheck();
        });

        const orgId = this.userService.getCurrentOrgId();
        if (orgId) {
            this.membersService.list(orgId).subscribe(members => {
                this.memberOptions = members.map(m => ({
                    label: `${m.first_name} ${m.last_name}`,
                    value: m.user_id
                }));
                this.cdr.markForCheck();
            });
        }
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
