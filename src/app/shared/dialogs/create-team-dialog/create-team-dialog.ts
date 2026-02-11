import { ChangeDetectorRef, Component, inject, output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { FieldComponent, MultiselectFieldComponent, TextareaFieldComponent, TextFieldComponent } from "@shared/components";
import { MembersService, UserService } from "@core/services";

export interface CreateTeamData {
    name: string;
    description: string;
    members: string[];
}

@Component({
    selector: "app-create-team-dialog",
    imports: [FormsModule, DialogModule, ButtonModule, FieldComponent, TextFieldComponent, TextareaFieldComponent, MultiselectFieldComponent],
    templateUrl: "./create-team-dialog.html",
    styleUrls: ["./create-team-dialog.scss"]
})
export class CreateTeamDialogComponent {
    private cdr = inject(ChangeDetectorRef);
    private membersService = inject(MembersService);
    private userService = inject(UserService);

    visible = signal(false);
    submitted = output<CreateTeamData>();

    name = '';
    description = '';
    selectedMembers: string[] = [];

    memberOptions: { label: string; value: string }[] = [];

    open(): void {
        this.reset();
        this.loadMembers();
        this.visible.set(true);
    }

    private loadMembers(): void {
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;

        this.membersService.list(orgId).subscribe(members => {
            this.memberOptions = members.map(m => ({
                label: `${m.first_name} ${m.last_name}`,
                value: m.user_id
            }));
            this.cdr.markForCheck();
        });
    }

    close(): void {
        this.visible.set(false);
    }

    submit(): void {
        if (!this.isValid()) return;

        this.submitted.emit({
            name: this.name,
            description: this.description,
            members: this.selectedMembers,
        });

        this.close();
    }

    isValid(): boolean {
        return !!this.name.trim();
    }

    private reset(): void {
        this.name = '';
        this.description = '';
        this.selectedMembers = [];
    }
}
