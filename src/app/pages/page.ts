import { Component } from "@angular/core";

@Component({
    selector: "app-page",
    template: `
    <div class="page__container">
        <div class="page__wrapper">
            <div class="page__header">
                <ng-content select="[pageHeader]" />
            </div>
            <div class="page__body">
                <ng-content />
            </div>
        </div>
    </div>`,
    styles: [`
    .page {
        &__container {
            height: 100%;
            overflow-y: hidden;
        }

        &__wrapper {
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        &__header {
            border-bottom: 1px solid var(--surface-border);
        }

        &__body {
            flex: 1 1 auto;
            overflow-y: auto;
            padding: 1.5rem 0;
        }
    }
    `],
}) export class PageComponent {}