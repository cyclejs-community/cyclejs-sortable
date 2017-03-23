import { VNode } from '@cycle/dom';
import { select } from 'snabbdom-selector';
import { EventHandler, MouseOffset } from '../definitions';

import { getIndex, getGhostStyle, findParent, addAttributes, replaceNode, getBodyStyle, addKeys } from '../helpers';

/**
 * Used to create the ghost and hide the item dragged
 * @type {EventHandler}
 */
export const mousedownHandler : EventHandler = (node, event, options) => {
    const newNode : VNode = addKeys(node);
    const item : Element = findParent(event.target as Element, options.parentSelector + ' > *');
    const itemRect : ClientRect = item.getBoundingClientRect();
    const mouseOffset : MouseOffset = {
        x: itemRect.left - event.clientX,
        y: itemRect.top - event.clientY
    };

    const body : Element = findParent(event.target as Element, 'body');
    body.setAttribute('style', getBodyStyle());

    const parent : VNode = select(options.parentSelector, newNode)[0];
    const index : number = getIndex(item);

    const ghostAttrs : { [name : string]: string } = {
        'data-mouseoffset': JSON.stringify(mouseOffset),
        'data-itemdimensions': JSON.stringify({ width: itemRect.width, height: itemRect.height }),
        'data-itemindex': index.toString(),
        'data-originalIndex': index.toString(),
        'style': getGhostStyle(event, mouseOffset, item)
    };

    const items : VNode[] = parent.children as VNode[];

    const children : VNode[] = [
        ...items.slice(0, index),
        addAttributes(items[index], { 'style': 'opacity: 0;' }),
        ...items.slice(index + 1),
        addAttributes(items[index], ghostAttrs)
    ].map((c, i) => addAttributes(c, { 'data-index' : i }));

    return replaceNode(newNode, options.parentSelector, { ...parent, children });
};
