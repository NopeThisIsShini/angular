import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
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
export class TreeComponent {
    @Input() treeData: TreeNode[] = [];
    @Input() initialSelection: TreeNode[] = [];
    @Input() selectionMode: 'single' | 'multiple' | 'checkbox' = 'checkbox';
    @Input() treeStyleClass: string = 'w-full';
    @Input() enableParentChildSelection: boolean = true;

    @Output() selectionChange = new EventEmitter<TreeNode[]>();
    @Output() nodeSelectionChange = new EventEmitter<TreeSelectionEvent>();

    selectedNodes: TreeNode[] = [];

    ngOnInit() {
        this.selectedNodes = [...this.initialSelection];
        if (this.enableParentChildSelection && this.selectionMode === 'checkbox') {
            this.updateParentStates();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['initialSelection'] && !changes['initialSelection'].firstChange) {
            this.selectedNodes = [...this.initialSelection];
            if (this.enableParentChildSelection && this.selectionMode === 'checkbox') {
                this.updateParentStates();
            }
        }
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

        if (this.enableParentChildSelection && this.selectionMode === 'checkbox') {
            if (event.node.children?.length) {
                this.selectChildren(event.node, selected);
            }
            this.updateParentStates();
        }

        this.nodeSelectionChange.emit(selectionEvent);
        this.selectionChange.emit([...this.selectedNodes]);
    }

    private selectChildren(node: TreeNode, selected: boolean) {
        node.children?.forEach((child) => {
            const index = this.selectedNodes.indexOf(child);
            if (selected && index === -1) {
                this.selectedNodes.push(child);
            } else if (!selected && index > -1) {
                this.selectedNodes.splice(index, 1);
            }
            if (child.children) {
                this.selectChildren(child, selected);
            }
        });
    }

    private updateParentStates(): boolean {
        return this.updateNodes(this.treeData);
    }

    private updateNodes(nodes: TreeNode[]): boolean {
        let hasSelection = false;

        nodes.forEach((node) => {
            if (node.children?.length) {
                const childrenHaveSelection = this.updateNodes(node.children);
                const selectedChildren = node.children.filter((c) => this.selectedNodes.includes(c) && !c.partialSelected).length;
                const partialChildren = node.children.filter((c) => c.partialSelected).length;

                node.partialSelected = false;
                const nodeIndex = this.selectedNodes.indexOf(node);

                if (selectedChildren === node.children.length) {
                    if (nodeIndex === -1) this.selectedNodes.push(node);
                    hasSelection = true;
                } else if (selectedChildren + partialChildren > 0) {
                    node.partialSelected = true;
                    if (nodeIndex > -1) this.selectedNodes.splice(nodeIndex, 1);
                    hasSelection = true;
                } else {
                    if (nodeIndex > -1) this.selectedNodes.splice(nodeIndex, 1);
                }
            } else {
                hasSelection = hasSelection || this.selectedNodes.includes(node);
            }
        });

        return hasSelection;
    }

    // Public methods for external control
    clearSelection() {
        this.selectedNodes = [];
        this.clearStates(this.treeData);
        this.selectionChange.emit([...this.selectedNodes]);
    }

    selectAll() {
        this.selectedNodes = [];
        this.selectAllNodes(this.treeData);
        if (this.enableParentChildSelection && this.selectionMode === 'checkbox') {
            this.updateParentStates();
        }
        this.selectionChange.emit([...this.selectedNodes]);
    }

    private selectAllNodes(nodes: TreeNode[]) {
        nodes.forEach((node) => {
            if (!node.children?.length) {
                this.selectedNodes.push(node);
            }
            if (node.children) {
                this.selectAllNodes(node.children);
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
