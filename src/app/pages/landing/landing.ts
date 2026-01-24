import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [RouterModule, RippleModule, StyleClassModule, ButtonModule, DividerModule, CommonModule],
    template: `
        <div class="">
            <div id="home" class="landing-wrapper">landing works!</div>
        </div>
    `,
    styles: [``]
})
export class Landing {}
