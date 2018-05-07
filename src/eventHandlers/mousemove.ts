import { VNode } from '@cycle/dom';

import { SortableOptions } from '../makeSortable';
import { addDataEntry } from '../helpers';

export function mousemoveHandler(
    node: VNode,
    ev: MouseEvent,
    opts: SortableOptions
): VNode {
    const item: Element = (node.children as any[])
        .map(n => n.data.dataset.item)
        .filter(n => !!n)[0];

    const siblings = [...item.parentElement.children];
    const index = siblings.indexOf(item);
    const ghost = siblings[siblings.length - 1];
    const itemArea = getArea(ghost);
    let swapIndex = index;

    const children = node.children.slice(0) as VNode[];

    if (index > 0 && getIntersection(ghost, siblings[index - 1], true) > 0) {
        swapIndex = index - 1;
    } else if (
        index < siblings.length - 2 &&
        getIntersection(ghost, siblings[index + 1], false) > 0
    ) {
        swapIndex = index + 1;
    }

    if (swapIndex !== index) {
        const tmp = children[index];
        children[index] = children[swapIndex];
        children[swapIndex] = tmp;
    }

    children[children.length - 1] = updateGhost(
        children[children.length - 1],
        ev
    );

    return {
        ...node,
        children
    };
}

function getArea(item: Element): number {
    const rect = item.getBoundingClientRect();
    return rect.width * rect.height;
}

function getIntersectionArea(rectA: any, rectB: any): number {
    let a =
        Math.min(rectA.right, rectB.right) - Math.max(rectA.left, rectB.left);
    a = a < 0 ? 0 : a;
    const area =
        a *
        (Math.min(rectA.bottom, rectB.bottom) - Math.max(rectA.top, rectB.top));
    return area < 0 ? 0 : area;
}

function getIntersection(ghost: Element, elm: Element, upper: boolean): number {
    const f = 0.25;
    const _a = (upper ? ghost : elm).getBoundingClientRect();
    const _b = (upper ? elm : ghost).getBoundingClientRect();
    const a = {
        left: _a.left,
        right: _a.right,
        top: _a.top,
        bottom: _a.bottom
    };
    const b = {
        left: _b.left,
        right: _b.right,
        top: _b.top,
        bottom: _b.bottom
    };

    const aRight = { ...a, left: a.right - (a.right - a.left) * f };
    const aBottom = { ...a, top: a.bottom - (a.bottom - a.top) * f };

    const bLeft = { ...b, right: b.left + (b.right - b.left) * f };
    const bTop = { ...b, bottom: b.top + (b.bottom - b.top) * f };

    const area =
        getIntersectionArea(aRight, bLeft) + getIntersectionArea(aBottom, bTop);

    return area < 0 ? 0 : area;
}

function updateGhost(node: VNode, ev: MouseEvent): VNode {
    const { offsetX, offsetY } = node.data.dataset as any;
    return addDataEntry(node, 'style', {
        left: ev.clientX - offsetX + 'px',
        top: ev.clientY - offsetY + 'px'
    });
}
