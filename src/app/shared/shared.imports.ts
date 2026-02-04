import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DialogComponent, InputComponent, SelectComponent, TableComponent } from './components';
import { NgModule } from '@angular/core';
import { PrimengImports } from './primeng.import';
import { CustomIconDirective, HasPermissionDirective } from './directives';

const SharedImports = [CommonModule, FormsModule, ReactiveFormsModule, ...PrimengImports, DialogComponent, InputComponent, TableComponent, SelectComponent, RouterLink, CustomIconDirective, HasPermissionDirective];
@NgModule({
    imports: [...SharedImports],
    exports: [...SharedImports]
})
export class SharedModule {}
