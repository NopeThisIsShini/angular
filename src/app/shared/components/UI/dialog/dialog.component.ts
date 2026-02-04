import { CommonModule } from '@angular/common';
import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { PrimengImports } from '@/app/shared/primeng.import';

@Component({
  selector: 'NG-Dialog',
  standalone: true,
  imports: [CommonModule, ...PrimengImports],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
export class DialogComponent {
  @Input() visible: boolean = false;
  @Input() header: string = '';
  @Input() modal: boolean = true;
  @Input() width: string = '25rem';
  @Input() style: any = {};
  @Input() position: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright' = 'center';
  @Input() breakpoints: { [key: string]: string } = { '1199px': '75vw', '575px': '90vw' };
  @Input() styleClass: string = '';
  @Input() closable: boolean = true;
  @Input() draggable: boolean = false;
  @Input() resizable: boolean = false;
  @Input() dismissableMask: boolean = true;
  
  @Input() showFooter: boolean = true;
  @Input() footerConfirmLabel: string = 'Save';
  @Input() footerCancelLabel: string = 'Cancel';
  @Input() loading: boolean = false;
  @Input() confirmDisabled: boolean = false;
  @Input() severity: 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null = 'secondary';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onHide = new EventEmitter<void>();

  @ContentChild('headerTemplate') headerTemplate?: TemplateRef<any>;
  @ContentChild('footerTemplate') footerTemplate?: TemplateRef<any>;

  get dialogStyle() {
    return { ...this.style, width: this.width };
  }

  handleHide() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.onHide.emit();
  }

  handleConfirm() {
    this.onConfirm.emit();
  }

  handleCancel() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.onCancel.emit();
  }
}
