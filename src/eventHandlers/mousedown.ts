import { VNode } from '@cycle/dom';
import { select } from 'snabbdom-selector';
import { EventHandler, MouseOffset, SortableOptions } from '../definitions';

import {
    getIndex,
    getGhostStyle,
    findParent,
    addAttributes,
    addGhostClass,
    replaceNode,
    getBodyStyle,
    addKeys
} from '../helpers';

/**
 * Used to create the ghost and hide the item dragged
 * @type {EventHandler}
 */
export const mousedownHandler: EventHandler = (node, event, options) => {
    const item: Element = findParent(
        event.target as Element,
        options.parentSelector + ' > *'
    );
    const itemRect: ClientRect = item.getBoundingClientRect();
    const parentNode: Element = item.parentElement;
    const parentRect: ClientRect = parentNode.getBoundingClientRect();
    const mouseOffset: MouseOffset = {
        x: itemRect.left - event.clientX,
        y: itemRect.top - event.clientY,
        itemLeft: itemRect.left,
        itemTop: itemRect.top,
        parentLeft: parentRect.left,
        parentTop: parentRect.top
    };

    const body: Element = findParent(event.target as Element, 'body');
    body.setAttribute('style', getBodyStyle());

    const parent: VNode = select(options.parentSelector, node)[0];
    const index: number = getIndex(item);
    const ghostAttrs: { [name: string]: string } = {
        'data-mouseoffset': JSON.stringify(mouseOffset),
        'data-itemdimensions': JSON.stringify({
            width: itemRect.width,
            height: itemRect.height
        }),
        'data-itemindex': index.toString(),
        'data-originalIndex': index.toString(),
        style: getGhostStyle(mouseOffset, item)
    };

    const items: VNode[] = parent.children as VNode[];

    const children: VNode[] = [
        ...items.slice(0, index),
        addAttributes(items[index], { style: 'opacity: 0;' }),
        ...items.slice(index + 1),
        addGhostClass(
            addAttributes({ ...items[index], elm: undefined }, ghostAttrs),
            options.ghostClass
        )
    ].map((c, i) => addAttributes(c, { 'data-index': i }));

    return replaceNode(node, options.parentSelector, { ...parent, children });
};
