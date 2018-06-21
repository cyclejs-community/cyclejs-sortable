import { VNode } from '@cycle/dom';

import { SortableOptions } from '../makeSortable';
import { addDataEntry } from '../helpers';

export const selectNames = [
    '-webkit-touch-callout',
    '-webkit-user-select',
    '-khtml-user-select',
    '-moz-user-select',
    '-ms-user-select',
    'user-select'
];

export function mousedownHandler(
    node: VNode,
    ev: MouseEvent,
    opts: SortableOptions
): [VNode, undefined] {
    const item: Element = ev.currentTarget as Element;
    const indexClicked = Array.prototype.slice
        .call(item.parentElement.children)
        .indexOf(item);

    const children = node.children
        .map(addData)
        .map(hideSelected(indexClicked))
        .concat(
            createGhost(indexClicked, ev, item, node.children[
                indexClicked
            ] as VNode)
        );

    return [
        {
            ...addDataEntry(node, 'style', {
                ...selectNames
                    .map(n => ({ [n]: 'none' }))
                    .reduce((a, c) => ({ ...a, ...c }), {}),
                position: 'relative'
            }),
            children
        },
        undefined
    ];
}

function addData(node: VNode, index: number): VNode {
    return addDataEntry(node, 'dataset', {
        originalIndex: index
    });
}

function hideSelected(index: number): (node: VNode, i: number) => VNode {
    return function(node, i) {
        return i !== index
            ? node
            : addDataEntry(node, 'style', {
                  opacity: 0
              });
    };
}

function createGhost(
    clicked: number,
    ev: any,
    item: Element,
    node: VNode
): VNode {
    const rect = item.getBoundingClientRect();
    const parentRect = item.parentElement.getBoundingClientRect();
    const offsetX = ev.clientX - rect.left + parentRect.left;
    const offsetY = ev.clientY - rect.top + parentRect.top;

    return addDataEntry(
        addDataEntry(node, 'dataset', {
            offsetX,
            offsetY,
            item
        }),
        'style',
        {
            position: 'absolute',
            left: ev.clientX - offsetX + 'px',
            top: ev.clientY - offsetY + 'px',
            width: rect.width + 'px',
            height: rect.height + 'px',
            'pointer-events': 'none'
        }
    );
}
