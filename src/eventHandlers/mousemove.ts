import { VNode } from '@cycle/dom';
import select from 'snabbdom-selector';
import { EventHandler, MouseOffset, ItemDimensions, Intersection } from '../definitions';

import { getGhostStyle, findParent, getIntersection, getArea, addAttributes, replaceNode, crop } from '../helpers';

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

    const intersectionAreas : number[] = parent.children
        .slice(0, -1)
        .map<Element>(c => (c as VNode).elm as Element)
        .map<Intersection>(e => getIntersection(e, ghost.elm as Element))
        .map<number>(i => getArea(i));

    const pairwiseIntersections : [number, number][] = [
        [0, intersectionAreas[0]],
        ...intersectionAreas
            .slice(0, -1)
            .map<[number, number]>((e, i) => [e, intersectionAreas[i + 1]]),
        [intersectionAreas[intersectionAreas.length - 1], 0]
    ];

    const newIndex : number = crop(
        pairwiseIntersections
        .map<number>(arr => arr[0] + arr[1])
        .map<[number, number]>((e, i) => [e, i])
        .reduce((acc, curr) => curr[0] > acc[0] ? curr : acc)[1] - 1,
        0, parent.children.length - 2
    );

    const filteredChildren : VNode[] = parent.children
        .filter((e, i) => i !== itemIndex);

    const ghostAttrs : { [attr : string]: string } = {
        'style': getGhostStyle(event, mouseOffset, itemDimensions),
        'data-itemindex': newIndex.toString()
    };

    const min : number = Math.min(itemIndex, newIndex);
    const max : number = Math.max(itemIndex, newIndex);

    const newChildren : VNode[] = itemIndex === newIndex ? parent.children.slice(0, -1) : [
        ...parent.children.slice(0, min),
        parent.children[max],
        parent.children[min],
        ...parent.children.slice(min + 1, max),
        ...filteredChildren.slice(max, filteredChildren.length - 1)
    ];

    return replaceNode(node, options.parentSelector, Object.assign({}, parent, {
        children: [...newChildren, addAttributes(parent.children[parent.children.length - 1], ghostAttrs)]
    }));
};
