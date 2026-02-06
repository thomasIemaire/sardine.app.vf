import { Component, computed, input } from "@angular/core";

export type FieldHint = 'required' | 'recommended' | 'optional' | null;

@Component({
    selector: "app-field",
    templateUrl: "./field.html",
    styleUrls: ["./field.scss"],
})
export class FieldComponent {
    label = input<string>('');
    required = input<boolean>(false);
    recommended = input<boolean>(false);
    optional = input<boolean>(false);
    error = input<string>('');

    hint = computed<FieldHint>(() => {
        if (this.required()) return 'required';
        if (this.recommended()) return 'recommended';
        if (this.optional()) return 'optional';
        return null;
    });

    hintLabel = computed(() => {
        const hint = this.hint();
        if (hint === 'recommended') return '(Recommandé)';
        if (hint === 'optional') return '(Optionnel)';
        return null;
    });
}
