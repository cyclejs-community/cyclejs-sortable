import { VNode } from '@cycle/dom';

import { SortableOptions } from '../makeSortable';
import { addDataEntry } from '../helpers';
import { selectNames } from './mousedown';

export function mouseupHandler(
    node: VNode,
    ev: MouseEvent,
    opts: SortableOptions
): VNode {
    const children = node.children.slice(0, -1).map(cleanup);

    return {
        ...deleteData(node, 'style', ['position'].concat(selectNames), true),
        children
    };
}

function cleanup(node: VNode): VNode {
    let n = deleteData(node, 'dataset', [
        'offsetX',
        'offsetY',
        'originalIndex',
        'item'
    ]);
    return deleteData(n, 'style', ['opacity'], true);
}

function deleteData(
    node: VNode,
    mod: string,
    keys: string[],
    b?: boolean
): VNode {
    let obj: any = {
        ...node.data[mod]
    };
    for (let i = 0; i < keys.length; i++) {
        if (b) {
            obj[keys[i]] = '';
        } else {
            delete obj[keys[i]];
        }
    }

    if (Object.keys(obj).length === 0) {
        obj = '';
    }

    return {
        ...node,
        data: {
            ...node.data,
            [mod]: obj
        }
    };
}
