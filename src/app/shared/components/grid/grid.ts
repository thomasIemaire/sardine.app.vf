import { Component, computed, input } from "@angular/core";

@Component({
    selector: "app-grid",
    imports: [],
    templateUrl: "./grid.html",
    styleUrls: ["./grid.scss"]
})
export class GridComponent {
    cols = input<number>();
    minItemWidth = input<string>();

    gridColumns = computed(() => {
        const min = this.minItemWidth();
        if (min) {
            return `repeat(auto-fill, minmax(${min}, 1fr))`;
        }
        return `repeat(${this.cols() ?? 5}, 1fr)`;
    });
}