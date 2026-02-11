import { Component, output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { FieldComponent, TextFieldComponent } from "@shared/components";

export interface CreateFolderData {
    name: string;
}

@Component({
    selector: "app-create-folder-dialog",
    imports: [FormsModule, DialogModule, ButtonModule, FieldComponent, TextFieldComponent],
    templateUrl: "./create-folder-dialog.html",
    styleUrls: ["./create-folder-dialog.scss"]
})
export class CreateFolderDialogComponent {
    visible = signal(false);
    submitted = output<CreateFolderData>();

    name = '';

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
            name: this.name.trim()
        });

        this.close();
    }

    isValid(): boolean {
        return !!this.name.trim();
    }

    private reset(): void {
        this.name = '';
    }
}
