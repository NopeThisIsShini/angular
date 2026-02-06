import { Component, input, model, output, OnInit, effect, computed, untracked } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface TreeSelectionEvent {
    node: TreeNode;
    selected: boolean;
}

@Component({
    selector: 'NG-Tree',
    standalone: true,
    imports: [CommonModule, FormsModule, TreeModule],
    templateUrl: './tree.component.html',
    styleUrl: './tree.component.scss'
})
export class TreeComponent implements OnInit {
    treeData = input<TreeNode[]>([]);
    selection = model<TreeNode[]>([]);
    selectionMode = input<'single' | 'multiple' | 'checkbox'>('checkbox');
    treeStyleClass = input<string>('w-full');
    enableParentChildSelection = input<boolean>(true);

    nodeSelectionChange = output<TreeSelectionEvent>();

    private isUpdatingStates = false;

    constructor() {
        // Sync parent/child states whenever data or selection changes from outside
        effect(() => {
            const data = this.treeData();
            const sel = this.selection();
            
            if (this.isUpdatingStates) return;

            untracked(() => {
                if (this.enableParentChildSelection() && this.selectionMode() === 'checkbox' && data.length > 0) {
                    this.updateParentStates();
                }
            });
        });
    }

    ngOnInit() {}

    onSelectionUpdate(event: any) {
        let nodes = Array.isArray(event) ? [...event] : (event ? [event] : []);
        this.selection.set(nodes);
    }

    onNodeSelect(event: any) {
        this.handleNodeChange(event, true);
    }

    onNodeUnselect(event: any) {
        this.handleNodeChange(event, false);
    }

    private handleNodeChange(event: any, selected: boolean) {
        const selectionEvent: TreeSelectionEvent = {
            node: event.node,
            selected
        };

        if (this.enableParentChildSelection() && this.selectionMode() === 'checkbox') {
            this.isUpdatingStates = true;
            try {
                const currentSelection = [...this.selection()];
                if (event.node.children?.length) {
                    this.selectChildrenRecursive(event.node, selected, currentSelection);
                }
                this.selection.set(currentSelection);
                this.updateParentStatesInternal(currentSelection);
            } finally {
                this.isUpdatingStates = false;
            }
        }

        this.nodeSelectionChange.emit(selectionEvent);
    }

    private selectChildrenRecursive(node: TreeNode, selected: boolean, currentSelection: TreeNode[]) {
        node.children?.forEach((child) => {
            const index = currentSelection.findIndex(n => n.key === child.key);
            if (selected && index === -1) {
                currentSelection.push(child);
            } else if (!selected && index > -1) {
                currentSelection.splice(index, 1);
            }
            if (child.children) {
                this.selectChildrenRecursive(child, selected, currentSelection);
            }
        });
    }

    private updateParentStates() {
        if (this.isUpdatingStates) return;
        this.isUpdatingStates = true;
        
        try {
            const currentSelection = [...this.selection()];
            this.updateParentStatesInternal(currentSelection);
        } finally {
            this.isUpdatingStates = false;
        }
    }

    private updateParentStatesInternal(currentSelection: TreeNode[]) {
        const modified = this.updateNodesRecursive(this.treeData(), currentSelection);
        if (modified) {
            this.selection.set(currentSelection);
        }
    }

    private updateNodesRecursive(nodes: TreeNode[], currentSelection: TreeNode[]): boolean {
        let changed = false;

        nodes.forEach((node) => {
            if (node.children?.length) {
                const childChanged = this.updateNodesRecursive(node.children, currentSelection);
                if (childChanged) changed = true;
                
                const selectedChildren = node.children.filter((c) => 
                    currentSelection.some(n => n.key === c.key) && !c.partialSelected
                ).length;
                const partialChildren = node.children.filter((c) => c.partialSelected).length;

                const nodeIndex = currentSelection.findIndex(n => n.key === node.key);
                const wasPartial = node.partialSelected;
                node.partialSelected = false;

                if (selectedChildren === node.children.length && node.children.length > 0) {
                    if (nodeIndex === -1) {
                        currentSelection.push(node);
                        changed = true;
                    }
                    if (wasPartial) changed = true;
                } else if (selectedChildren + partialChildren > 0) {
                    node.partialSelected = true;
                    if (nodeIndex > -1) {
                        currentSelection.splice(nodeIndex, 1);
                        changed = true;
                    }
                    if (!wasPartial) changed = true;
                } else {
                    if (nodeIndex > -1) {
                        currentSelection.splice(nodeIndex, 1);
                        changed = true;
                    }
                    if (wasPartial) changed = true;
                }
            }
        });

        return changed;
    }

    clearSelection() {
        this.selection.set([]);
        this.clearStates(this.treeData());
    }

    selectAll() {
        const allNodes: TreeNode[] = [];
        this.collectAllNodes(this.treeData(), allNodes);
        this.selection.set(allNodes);
        if (this.enableParentChildSelection() && this.selectionMode() === 'checkbox') {
            this.updateParentStates();
        }
    }

    private collectAllNodes(nodes: TreeNode[], result: TreeNode[]) {
        nodes.forEach((node) => {
            if (!node.children?.length) {
                result.push(node);
            }
            if (node.children) {
                this.collectAllNodes(node.children, result);
            }
        });
    }

    private clearStates(nodes: TreeNode[]) {
        nodes.forEach((node) => {
            node.partialSelected = false;
            if (node.children) this.clearStates(node.children);
        });
    }
}
