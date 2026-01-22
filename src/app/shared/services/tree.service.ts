// tree.service.ts
import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/api';

export interface TreeStructureItem {
    key: string;
    label: string;
    children?: TreeStructureItem[];
    permissions?: string[];
    data?: any; // Additional data for flexibility
}

export interface TreeDataMap {
    [key: string]: boolean | any;
}

@Injectable({
    providedIn: 'root'
})
export class TreeService {
    /**
     * Build tree nodes from a hierarchical structure
     */
    buildTreeNodes(structure: TreeStructureItem[]): TreeNode[] {
        return structure.map((item) => {
            const node: TreeNode = {
                key: item.key,
                label: item.label,
                data: item.data || {},
                partialSelected: false
            };

            if (item.children) {
                node.children = this.buildTreeNodes(item.children);
            } else if (item.permissions) {
                node.children = item.permissions.map((permission: string) => ({
                    key: `${item.key}.${permission}`,
                    label: this.capitalizeFirst(permission),
                    data: { permission, parentKey: item.key },
                    partialSelected: false
                }));
            }

            return node;
        });
    }

    /**
     * Get selected nodes based on data map (e.g., permissions)
     */
    getSelectedNodes(dataMap: TreeDataMap, treeNodes: TreeNode[]): TreeNode[] {
        const selected: TreeNode[] = [];
        this.findSelectedLeafNodes(treeNodes, dataMap, selected);
        return selected;
    }

    /**
     * Convert selected nodes back to data map
     */
    getDataMapFromNodes(selectedNodes: TreeNode[]): TreeDataMap {
        const dataMap: TreeDataMap = {};
        selectedNodes.forEach((node) => {
            if (node.key && !node.children?.length) {
                dataMap[node.key] = true;
            }
        });
        return dataMap;
    }

    /**
     * Find all leaf nodes in the tree
     */
    getAllLeafNodes(nodes: TreeNode[]): TreeNode[] {
        const leafNodes: TreeNode[] = [];
        this.collectLeafNodes(nodes, leafNodes);
        return leafNodes;
    }

    /**
     * Find nodes by key
     */
    findNodeByKey(nodes: TreeNode[], key: string): TreeNode | null {
        for (const node of nodes) {
            if (node.key === key) {
                return node;
            }
            if (node.children) {
                const found = this.findNodeByKey(node.children, key);
                if (found) return found;
            }
        }
        return null;
    }

    /**
     * Get all parent keys of a node
     */
    getParentKeys(nodes: TreeNode[], targetKey: string, currentPath: string[] = []): string[] {
        for (const node of nodes) {
            const newPath = [...currentPath];
            if (node.key) newPath.push(node.key);

            if (node.key === targetKey) {
                return newPath.slice(0, -1); // Return path without the target node itself
            }

            if (node.children) {
                const result = this.getParentKeys(node.children, targetKey, newPath);
                if (result.length > 0) return result;
            }
        }
        return [];
    }

    /**
     * Flatten tree structure to a simple array
     */
    flattenTree(nodes: TreeNode[]): TreeNode[] {
        const result: TreeNode[] = [];
        this.flattenNodes(nodes, result);
        return result;
    }

    /**
     * Filter tree nodes based on search criteria
     */
    filterTree(nodes: TreeNode[], searchFn: (node: TreeNode) => boolean): TreeNode[] {
        return nodes.reduce((filtered: TreeNode[], node) => {
            const nodeMatches = searchFn(node);
            const filteredChildren = node.children ? this.filterTree(node.children, searchFn) : [];

            if (nodeMatches || filteredChildren.length > 0) {
                const filteredNode: TreeNode = {
                    ...node,
                    children: filteredChildren.length > 0 ? filteredChildren : node.children
                };
                filtered.push(filteredNode);
            }

            return filtered;
        }, []);
    }

    /**
     * Validate tree structure
     */
    validateTreeStructure(structure: TreeStructureItem[]): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        const keys = new Set<string>();

        this.validateStructureItems(structure, keys, errors);

        return {
            valid: errors.length === 0,
            errors
        };
    }

    // Private helper methods
    private findSelectedLeafNodes(nodes: TreeNode[], dataMap: TreeDataMap, selected: TreeNode[]) {
        nodes.forEach((node) => {
            if (node.key && dataMap[node.key] && !node.children?.length) {
                selected.push(node);
            }
            if (node.children) {
                this.findSelectedLeafNodes(node.children, dataMap, selected);
            }
        });
    }

    private collectLeafNodes(nodes: TreeNode[], leafNodes: TreeNode[]) {
        nodes.forEach((node) => {
            if (!node.children?.length) {
                leafNodes.push(node);
            } else {
                this.collectLeafNodes(node.children, leafNodes);
            }
        });
    }

    private flattenNodes(nodes: TreeNode[], result: TreeNode[]) {
        nodes.forEach((node) => {
            result.push(node);
            if (node.children) {
                this.flattenNodes(node.children, result);
            }
        });
    }

    private validateStructureItems(items: TreeStructureItem[], keys: Set<string>, errors: string[]) {
        items.forEach((item) => {
            if (!item.key) {
                errors.push('Item missing key property');
            } else if (keys.has(item.key)) {
                errors.push(`Duplicate key found: ${item.key}`);
            } else {
                keys.add(item.key);
            }

            if (!item.label) {
                errors.push(`Item with key '${item.key}' missing label`);
            }

            if (item.children && item.permissions) {
                errors.push(`Item with key '${item.key}' cannot have both children and permissions`);
            }

            if (item.children) {
                this.validateStructureItems(item.children, keys, errors);

                // Add permission keys for validation
                if (item.permissions) {
                    item.permissions.forEach((permission) => {
                        const permissionKey = `${item.key}.${permission}`;
                        if (keys.has(permissionKey)) {
                            errors.push(`Duplicate permission key: ${permissionKey}`);
                        } else {
                            keys.add(permissionKey);
                        }
                    });
                }
            }
        });
    }

    private capitalizeFirst(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
