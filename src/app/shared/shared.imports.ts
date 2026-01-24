import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InputComponent, SelectComponent, TableComponent } from './components';
import { NgModule } from '@angular/core';
import { PrimengImports } from './primeng.import';
import { HasPermissionDirective } from './directives/has-permission.directive';
import { IfScopeDirective, ScopeClassDirective, ScopeDisableDirective } from './directives/if-scope.directive';

const SharedImports = [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    ...PrimengImports, 
    InputComponent, 
    TableComponent, 
    SelectComponent, 
    RouterLink
];

@NgModule({
    declarations: [
        HasPermissionDirective,
        IfScopeDirective,
        ScopeClassDirective,
        ScopeDisableDirective
    ],
    imports: [...SharedImports],
    exports: [
        ...SharedImports,
        HasPermissionDirective,
        IfScopeDirective,
        ScopeClassDirective,
        ScopeDisableDirective
    ]
})
export class SharedModule {}


