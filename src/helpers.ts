import { VNode } from '@cycle/dom';

export function addKeys(node: VNode): VNode {
    return {
        ...node,
        children: node.children.map((n: VNode, i) => ({
            ...n,
            key: n.key ? n.key : '_sortable' + i
        }))
    };
}

export function addDataEntry(node: VNode, key: string, values: any): any {
    return {
        ...node,
        data: {
            ...node.data,
            [key]: {
                ...(node.data ? node.data[key] : {}),
                ...values
            }
        }
    };
}
