import { VNode } from '@cycle/dom';
import select from 'snabbdom-selector';
import { EventHandler, MouseOffset, ItemDimensions, Intersection } from '../definitions';

import { getGhostStyle, findParent, getIntersection, getArea, addAttributes, replaceNode } from '../helpers';

/**
 * Used to adjust the position of the ghost and swap the items if needed
 * @type {EventHandler}
 */
export const mousemoveHandler : EventHandler = (node, event, options) => {
    const parent : VNode = select(options.parentSelector, node)[0];
    const ghost : VNode = parent.children[parent.children.length - 1];

    const mouseOffset : MouseOffset = JSON.parse(ghost.data.attrs['data-mouseoffset']);
    const itemDimensions : ItemDimensions = JSON.parse(ghost.data.attrs['data-itemdimensions']);
    const itemIndex : number = parseInt(ghost.data.attrs['data-itemindex']);

    const intersectionAreas : [number, number][] = parent.children
        .slice(0, -1)
        .map<Element>(c => (c as VNode).elm as Element)
        .map<Intersection>(e => getIntersection(e, ghost.elm as Element))
        .map<[number, number]>((e, i) => [getArea(e), i]);

    const newIndex : number = intersectionAreas
        .reduce((acc, curr) => curr[0] > acc[0] ? curr : acc)[1];

    const ghostAttrs : { [attr : string]: string } = {
        'style': getGhostStyle(event, mouseOffset, ghost.elm as Element),
        'data-itemindex': newIndex.toString()
    };

    const filteredChildren : VNode[] = parent.children
        .filter((e, i) => i !== itemIndex)
        .slice(0, -1);

    const newChildren : VNode[] = [
        ...filteredChildren.slice(0, newIndex),
        parent.children[itemIndex],
        ...filteredChildren.slice(newIndex, filteredChildren.length)
    ];

    return replaceNode(node, options.parentSelector, Object.assign({}, parent, {
        children: [...newChildren, addAttributes(ghost, ghostAttrs)]
    }));
};
