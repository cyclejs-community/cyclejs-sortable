import { VNode } from '@cycle/dom';
import select from 'snabbdom-selector';

import { EventHandler } from '../definitions';
import { replaceNode, removeAttribute, findParent } from '../helpers';

/**
 * Used to remove the ghost element
 * @type {EventHandler}
 */
export const mouseupHandler : EventHandler = (node, event, options) => {
    const parent : VNode = select(options.parentSelector, node)[0];
    const ghost : VNode = parent.children[parent.children.length - 1];
    const itemIndex : number = parseInt(ghost.data.attrs['data-itemindex']);

    const body : Element = findParent(event.target as Element, 'body');
    body.removeAttribute('style');

    const newChildren : VNode[] = [
        ...parent.children.slice(0, itemIndex),
        removeAttribute(parent.children[itemIndex], 'style'),
        ...parent.children.slice(itemIndex + 1, -1)
    ];

    return replaceNode(node, options.parentSelector, Object.assign({}, parent, {
        children: newChildren
    }));
};
