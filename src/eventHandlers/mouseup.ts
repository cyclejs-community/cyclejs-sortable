import { VNode } from '@cycle/dom';
import { select } from 'snabbdom-selector';

import { EventHandler } from '../definitions';
import { replaceNode, removeAttribute, findParent } from '../helpers';

/**
 * Used to remove the ghost element
 * @type {EventHandler}
 */
export const mouseupHandler: EventHandler = (node, event, options) => {
    const parent: VNode = select(options.parentSelector, node)[0];
    const items: VNode[] = parent.children as VNode[];

    const ghost: VNode = items[items.length - 1];

    if (!parent || !ghost) {
        return node;
    }

    const itemIndex: number = parseInt(ghost.data.attrs[
        'data-itemindex'
    ] as string);

    const body: Element = findParent(event.target as Element, 'body');
    body.removeAttribute('style');

    const newItems: VNode[] = [
        ...items.slice(0, itemIndex),
        removeAttribute(items[itemIndex], 'style'),
        ...items.slice(itemIndex + 1, -1)
    ];

    const indexes: number[] = newItems
        .map(c => c.data.attrs['data-index'] as string)
        .map(s => parseInt(s));

    const tuple: [number, number] = [
        parseInt(ghost.data.attrs['data-originalIndex'] as string),
        parseInt(ghost.data.attrs['data-itemindex'] as string)
    ];

    if (tuple[0] !== tuple[1]) {
        const customEvent: CustomEvent = new CustomEvent('updateOrder', {
            bubbles: true,
            detail: {
                newOrder: indexes,
                oldIndex: tuple[0],
                newIndex: tuple[1]
            }
        });

        parent.elm.dispatchEvent(customEvent);
    }

    const children: VNode[] = newItems.map(c =>
        removeAttribute(c, 'data-index')
    );

    return replaceNode(node, options.parentSelector, { ...parent, children });
};
