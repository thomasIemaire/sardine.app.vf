import { Component, output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { FieldComponent, MultiselectFieldComponent, TextareaFieldComponent, TextFieldComponent } from "@shared/components";

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
    visible = signal(false);
    submitted = output<CreateTeamData>();

    name = '';
    description = '';
    selectedMembers: string[] = [];

    memberOptions = [
        { label: 'Thomas Lemaire', value: 'user-1' },
        { label: 'John Doe', value: 'user-2' },
        { label: 'Jane Doe', value: 'user-3' },
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
