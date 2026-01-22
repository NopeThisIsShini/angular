import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FaviconService {
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  setFavicon(iconPath: string) {
    let link: HTMLLinkElement | null =
      document.querySelector("link[rel*='icon']");

    if (!link) {
      link = this.renderer.createElement('link');
      this.renderer.setAttribute(link, 'rel', 'icon');
      this.renderer.appendChild(document.head, link);
    }

    this.renderer.setAttribute(link, 'href', iconPath);
  }
}
