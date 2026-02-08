import { Component, output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { FieldComponent, SelectFieldComponent, TextFieldComponent } from "@shared/components";

export interface AddMemberEntry {
    email: string;
    role: 'admin' | 'member' | 'reader';
}

export type AddMemberData = AddMemberEntry[];

@Component({
    selector: "app-add-member-dialog",
    imports: [FormsModule, DialogModule, ButtonModule, FieldComponent, SelectFieldComponent, TextFieldComponent],
    templateUrl: "./add-member-dialog.html",
    styleUrls: ["./add-member-dialog.scss"]
})
export class AddMemberDialogComponent {
    visible = signal(false);
    submitted = output<AddMemberData>();

    entries: AddMemberEntry[] = [];

    roleOptions = [
        { label: 'Admin', value: 'admin' as const },
        { label: 'Membre', value: 'member' as const },
        { label: 'Lecteur', value: 'reader' as const },
    ];

    open(): void {
        this.entries = [{ email: '', role: 'member' }];
        this.visible.set(true);
    }

    close(): void {
        this.visible.set(false);
    }

    addEntry(): void {
        this.entries.push({ email: '', role: 'member' });
    }

    removeEntry(index: number): void {
        this.entries.splice(index, 1);
    }

    submit(): void {
        if (!this.isValid()) return;
        this.submitted.emit([...this.entries]);
        this.close();
    }

    isValid(): boolean {
        return this.entries.length > 0 && this.entries.every(e => !!e.email.trim() && !!e.role);
    }
}
