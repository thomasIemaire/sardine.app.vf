import { AfterViewInit, Component, ElementRef, inject, input, OnDestroy, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { BadgeModule } from "primeng/badge";

export interface DocContent {
    title: string;
    badge?: string;
    description?: string;
    sections: DocSection[];
}

export interface DocSection {
    id: string;
    title: string;
    contents: DocSectionContent[];
}

export interface DocSectionContent {
    type: 'text' | 'list' | 'image';
    value: string | string[];
}

@Component({
    selector: "app-doc",
    imports: [CommonModule, BadgeModule],
    templateUrl: "./doc.html",
    styleUrls: ["./doc.scss"],
})
export class DocComponent implements AfterViewInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private el = inject(ElementRef);
    private scrollContainer: HTMLElement | null = null;
    private clickedSection: string | null = null;
    private clickTimeout: ReturnType<typeof setTimeout> | null = null;

    content = input.required<DocContent>();
    displayTableOfContents = input<boolean>(true);
    activeSection = signal<string>('');

    ngAfterViewInit(): void {
        this.route.fragment.subscribe(fragment => {
            if (fragment) {
                this.lockSection(fragment);
                setTimeout(() => {
                    const element = document.getElementById(fragment);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            }
        });

        this.scrollContainer = this.el.nativeElement.closest('.page__body');
        if (this.scrollContainer) {
            this.scrollContainer.addEventListener('scroll', this.onScroll, { passive: true });
            this.onScroll();
        }
    }

    ngOnDestroy(): void {
        this.scrollContainer?.removeEventListener('scroll', this.onScroll);
        if (this.clickTimeout) clearTimeout(this.clickTimeout);
    }

    scrollToSection(sectionId: string): void {
        this.lockSection(sectionId);
        this.router.navigate([], {
            relativeTo: this.route,
            fragment: sectionId,
            queryParamsHandling: 'merge',
        });
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    private lockSection(sectionId: string): void {
        this.clickedSection = sectionId;
        this.activeSection.set(sectionId);
        if (this.clickTimeout) clearTimeout(this.clickTimeout);
        this.clickTimeout = setTimeout(() => {
            this.clickedSection = null;
        }, 800);
    }

    private onScroll = (): void => {
        if (this.clickedSection || !this.scrollContainer) return;
        const containerTop = this.scrollContainer.getBoundingClientRect().top;
        const sections = this.content().sections;
        let activeId = sections[0]?.id ?? '';

        for (const section of sections) {
            const element = document.getElementById(section.id);
            if (element) {
                const offset = element.getBoundingClientRect().top - containerTop;
                if (offset <= 40) {
                    activeId = section.id;
                }
            }
        }

        this.activeSection.set(activeId);
    };
}
