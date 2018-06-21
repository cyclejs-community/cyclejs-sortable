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

function findParent(el: Element, sel: string): Element {
    let result = el;
    while (!result.matches(sel)) {
        if (result.matches('html')) {
            throw new Error('no parent element found');
        }
        result = result.parentElement;
    }
    return result;
}

export function mousedownHandler(
    node: VNode,
    ev: MouseEvent,
    opts: SortableOptions
): [VNode, undefined] {
    const item: Element = findParent(ev.target as Element, opts.itemSelector);
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
    const style = getComputedStyle(item);
    const padding = {
        top: parseFloat(style.paddingTop) + parseFloat(style.borderTop),
        left: parseFloat(style.paddingLeft) + parseFloat(style.borderLeft),
        bottom:
            parseFloat(style.paddingBottom) + parseFloat(style.borderBottom),
        right: parseFloat(style.paddingRight) + parseFloat(style.borderRight)
    };
    const parentRect = item.parentElement.getBoundingClientRect();
    const offsetX =
        ev.clientX - rect.left + parentRect.left + parseFloat(style.marginLeft);
    const offsetY =
        ev.clientY - rect.top + parentRect.top + parseFloat(style.marginTop);

    const sub = style.boxSizing !== 'border-box';

    return addDataEntry(
        addDataEntry(node, 'dataset', {
            offsetX,
            offsetY,
            item,
            ghost: true
        }),
        'style',
        {
            position: 'absolute',
            left: ev.clientX - offsetX + 'px',
            top: ev.clientY - offsetY + 'px',
            width: rect.width - (sub ? padding.left - padding.right : 0) + 'px',
            height:
                rect.height - (sub ? padding.top - padding.bottom : 0) + 'px',
            'pointer-events': 'none'
        }
    );
}
