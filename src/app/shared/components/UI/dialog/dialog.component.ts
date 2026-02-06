import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Component, ContentChild, TemplateRef, input, model, output, computed } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'NG-Dialog',
  standalone: true,
  imports: [CommonModule, ButtonModule, Dialog, NgTemplateOutlet],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
export class DialogComponent {
  visible = model<boolean>(false);
  header = input<string>('');
  modal = input<boolean>(true);
  width = input<string>('25rem');
  style = input<any>({});
  position = input<'left' | 'right' | 'top' | 'bottom' | 'center' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright'>('center');
  breakpoints = input<{ [key: string]: string }>({ '1199px': '75vw', '575px': '90vw' });
  styleClass = input<string>('');
  closable = input<boolean>(true);
  draggable = input<boolean>(false);
  resizable = input<boolean>(false);
  dismissableMask = input<boolean>(true);
  
  showFooter = input<boolean>(true);
  footerConfirmLabel = input<string>('Save');
  footerCancelLabel = input<string>('Cancel');
  loading = input<boolean>(false);
  confirmDisabled = input<boolean>(false);
  severity = input<'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null>('secondary');

  onConfirm = output<void>();
  onCancel = output<void>();
  onHide = output<void>();

  @ContentChild('headerTemplate') headerTemplate?: TemplateRef<any>;
  @ContentChild('footerTemplate') footerTemplate?: TemplateRef<any>;

  dialogStyle = computed(() => ({ ...this.style(), width: this.width() }));

  handleHide() {
    this.visible.set(false);
    this.onHide.emit();
  }

  handleConfirm() {
    this.onConfirm.emit();
  }

  handleCancel() {
    this.visible.set(false);
    this.onCancel.emit();
  }
}
