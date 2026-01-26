import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2, NgZone } from '@angular/core';

@Directive({
    selector: '[class*="icon-"],[customIconGlobal]',
    standalone: true
})
export class CustomIconDirective implements OnInit, OnDestroy {
    /** Base directory for icons */
    @Input() iconBaseDir = 'assets/icons';
    
    /** Default fallback icon */
    @Input() fallbackIcon = 'default-icon';

    /** If true, observes the entire element's subtree for icon classes */
    @Input() customIconGlobal = false;

    private observer: MutationObserver | null = null;
    private processedElements = new Set<HTMLElement>();

    constructor(
        private el: ElementRef, 
        private renderer: Renderer2,
        private ngZone: NgZone
    ) {}

    ngOnInit(): void {
        this.ngZone.runOutsideAngular(() => {
            // Check the element itself
            this.processElement(this.el.nativeElement);

            // Setup observer
            this.setupObserver();
        });
    }

    ngOnDestroy(): void {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.processedElements.clear();
    }

    private setupObserver(): void {
        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node instanceof HTMLElement) {
                            this.scanAndProcess(node);
                        }
                    });
                } else if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    this.processElement(mutation.target as HTMLElement);
                }
            }
        });

        // If global, observe entire subtree, otherwise just the element itself
        const config = {
            attributes: true,
            attributeFilter: ['class'],
            childList: this.customIconGlobal,
            subtree: this.customIconGlobal
        };

        this.observer.observe(this.el.nativeElement, config);

        // Initial scan if global
        if (this.customIconGlobal) {
            this.scanAndProcess(this.el.nativeElement);
        }
    }

    private scanAndProcess(root: HTMLElement): void {
        // Find all elements with class containing 'icon-'
        const elements = root.querySelectorAll('[class*="icon-"]');
        elements.forEach(el => this.processElement(el as HTMLElement));
        
        // Also check the root itself
        this.processElement(root);
    }

    private processElement(element: HTMLElement): void {
        const classes = Array.from(element.classList);
        const iconClass = classes.find((cls) => cls.startsWith('icon-'));

        if (!iconClass) {
            // If it had an icon before but doesn't now, clean up
            if (element.dataset['customIconLoaded']) {
                this.renderer.removeStyle(element, 'background-image');
                this.renderer.removeStyle(element, 'mask-image');
                this.renderer.removeStyle(element, '-webkit-mask-image');
                delete element.dataset['customIconLoaded'];
            }
            return;
        }

        const iconName = iconClass.replace('icon-', '');
        const iconPath = `/${this.iconBaseDir}/${iconName}.svg`;

        // Check if already loaded for this icon to avoid flickering
        if (element.dataset['customIconLoaded'] === iconName) return;

        // Apply shared styles (can be also handled via global CSS)
        this.renderer.setStyle(element, 'display', 'inline-block');
        this.renderer.setStyle(element, 'width', '1.25rem');
        this.renderer.setStyle(element, 'height', '1.25rem');
        this.renderer.setStyle(element, 'vertical-align', 'middle');
        
        this.loadIcon(element, iconPath, iconName);
    }

    private loadIcon(element: HTMLElement, path: string, iconName: string, isFallback = false): void {
        const img = new Image();
        img.src = path;
        
        img.onload = () => {
            // We use mask-image so icons can be colored with text-color/currentColor
            // and background-image as fallback for old browsers or specific cases
            this.renderer.setStyle(element, 'background-color', 'currentColor');
            this.renderer.setStyle(element, 'mask-image', `url(${path})`);
            this.renderer.setStyle(element, '-webkit-mask-image', `url(${path})`);
            this.renderer.setStyle(element, 'mask-size', 'contain');
            this.renderer.setStyle(element, '-webkit-mask-size', 'contain');
            this.renderer.setStyle(element, 'mask-repeat', 'no-repeat');
            this.renderer.setStyle(element, '-webkit-mask-repeat', 'no-repeat');
            this.renderer.setStyle(element, 'mask-position', 'center');
            this.renderer.setStyle(element, '-webkit-mask-position', 'center');
            
            element.dataset['customIconLoaded'] = iconName;
        };

        img.onerror = () => {
            if (!isFallback && this.fallbackIcon && this.fallbackIcon !== iconName) {
                const fallbackPath = `/${this.iconBaseDir}/${this.fallbackIcon}.svg`;
                this.loadIcon(element, fallbackPath, this.fallbackIcon, true);
            }
        };
    }
}
