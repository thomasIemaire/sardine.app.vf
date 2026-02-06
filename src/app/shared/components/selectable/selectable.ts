import { Component, input, output } from "@angular/core";

@Component({
    selector: "app-selectable",
    templateUrl: "./selectable.html",
    styleUrls: ["./selectable.scss"],
    host: {
        '[class.selected]': 'selected()',
        '[style.--selectable-radius]': 'borderRadius()',
        '[style.--selectable-selected-color]': 'selectedColor()',
        '(click)': 'onClick()'
    }
})
export class SelectableComponent {
    selected = input<boolean>(false);
    disabled = input<boolean>(false);
    borderRadius = input<string>('0');
    selectedColor = input<string>('var(--background-color-300)');

    selectChange = output<void>();

    onClick(): void {
        if (!this.disabled()) {
            this.selectChange.emit();
        }
    }
}
