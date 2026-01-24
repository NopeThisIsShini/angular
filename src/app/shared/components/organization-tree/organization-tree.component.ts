import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { OrganizationUnitTree } from '@app/pages/models';

@Component({
    selector: 'app-organization-tree',
    standalone: true,
    imports: [CommonModule, TreeModule, ContextMenuModule, BadgeModule],
    templateUrl: './organization-tree.component.html',
    styleUrl: './organization-tree.component.scss'
})
export class OrganizationTreeComponent implements OnChanges {
    @Input() tree: OrganizationUnitTree[] = [];
    @Input() selectedNode: TreeNode | null = null;
    @Input() selectable: boolean = true;
    @Input() checkbox: boolean = false;
    @Input() draggable: boolean = false;

    @Output() onNodeSelect = new EventEmitter<OrganizationUnitTree>();
    @Output() onNodeDrop = new EventEmitter<{ dragNode: TreeNode; dropNode: TreeNode }>();
    @Output() onAddChild = new EventEmitter<OrganizationUnitTree>();
    @Output() onEdit = new EventEmitter<OrganizationUnitTree>();
    @Output() onDelete = new EventEmitter<OrganizationUnitTree>();

    treeNodes: TreeNode[] = [];
    selectedTreeNode: TreeNode | null = null;
    contextMenuItems: MenuItem[] = [];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['tree']) {
            this.treeNodes = this.convertToTreeNodes(this.tree);
        }
    }

    convertToTreeNodes(units: OrganizationUnitTree[]): TreeNode[] {
        return units.map((unit) => ({
            key: unit.id.toString(),
            label: unit.displayName,
            data: unit,
            icon: 'pi pi-fw pi-folder',
            expandedIcon: 'pi pi-fw pi-folder-open',
            children: unit.children ? this.convertToTreeNodes(unit.children) : [],
            expanded: true,
            leaf: !unit.children || unit.children.length === 0
        }));
    }

    onNodeSelectHandler(event: { node: TreeNode }): void {
        this.selectedTreeNode = event.node;
        if (event.node.data) {
            this.onNodeSelect.emit(event.node.data);
        }
    }

    onNodeDropHandler(event: { dragNode: TreeNode; dropNode: TreeNode }): void {
        this.onNodeDrop.emit(event);
    }

    getContextMenuItems(node: TreeNode): MenuItem[] {
        return [
            {
                label: 'Add Child',
                icon: 'pi pi-plus',
                command: () => this.onAddChild.emit(node.data)
            },
            {
                label: 'Edit',
                icon: 'pi pi-pencil',
                command: () => this.onEdit.emit(node.data)
            },
            {
                separator: true
            },
            {
                label: 'Delete',
                icon: 'pi pi-trash',
                command: () => this.onDelete.emit(node.data)
            }
        ];
    }

    onContextMenuSelect(event: { node: TreeNode }): void {
        this.contextMenuItems = this.getContextMenuItems(event.node);
    }
}
