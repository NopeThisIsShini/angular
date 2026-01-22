import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InputComponent, SelectComponent, TableComponent } from './components';
import { NgModule } from '@angular/core';
import { PrimengImports } from './primeng.import';

const SharedImports = [CommonModule, FormsModule, ReactiveFormsModule, ...PrimengImports, InputComponent, TableComponent, SelectComponent, RouterLink];
@NgModule({
    imports: [...SharedImports],
    exports: [...SharedImports]
})
export class SharedModule {}
