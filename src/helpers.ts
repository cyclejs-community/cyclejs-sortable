import { VNode, VNodeData } from '@cycle/dom';
import { select, classNameFromVNode } from 'snabbdom-selector';

import {
    SortableOptions,
    MouseOffset,
    StartPositionOffset,
    Intersection
} from './definitions';

/**
 * Takes the maybe undefined options and fills them with defaults
 * @param {SortableOptions} options the options, can be undefined
 * @param {VNode} the root VNode of the DOMSource
 * @return {SortableOptions} the non-null options filled with default
 */
export function applyDefaults(
    options: SortableOptions,
    root: VNode
): SortableOptions {
    const firstClass: (n: VNode) => string = node =>
        '.' + classNameFromVNode(node.children[0] as VNode).split(' ')[0];

    const itemSelector: string = options.handle
        ? ''
        : options.parentSelector
          ? firstClass(select(options.parentSelector, root)[0] as VNode)
          : firstClass(root);

    return {
        parentSelector:
            options.parentSelector ||
            '.' +
                classNameFromVNode(root)
                    .split(' ')
                    .join('.'),
        handle: options.handle || itemSelector,
        ghostClass: options.ghostClass || '',
        selectionDelay: options.selectionDelay || 0
    };
}

/**
 * Adds keys to the VNodes to make them able to swap
 * @param {VNode} node the root VNode
 * @param {key} can be used to specify a inital key
 * @return {VNode} a new VNode with the keys
 */
export function addKeys(
    node: VNode,
    key: string = Math.random().toString()
): VNode {
    if (!node) return;

    if (!node.children) {
        return { ...node, key: node.key ? node.key : key };
    }

    const children: VNode[] = (node.children as VNode[]).map((c, i) =>
        addKeys(c, key + '-' + i)
    );

    return { ...node, key: node.key ? node.key : key, children };
}

/**
 * Returns a parent VNode that has a children matching the selector.
 * Currently only works with simple class selector
 * @param {VNode} root the parent VNode
 * @param {string} selector a valid CSS selector
 * @return {VNode} The searched parent node or undefined if none was found
 */
export function getParentNode(root: VNode, selector: string): VNode {
    if (root.children === undefined) {
        return undefined;
    }

    const childMatch: boolean = (root.children as VNode[]).reduce(
        (acc, curr) =>
            !acc && select(selector, curr)[0] === curr ? true : false,
        false
    );

    if (childMatch) {
        return root;
    }

    return root.children
        .map<VNode>(
            e =>
                typeof e !== 'object' ? undefined : getParentNode(e, selector)
        )
        .reduce((acc, curr) => (!acc && curr ? curr : acc), undefined);
}

/**
 * Replaces the node matching the selector with the replacement
 * @param {VNode} root the root VNode
 * @param {string} selector a valid CSS selector for the replacement
 * @param {VNode} replacement the new VNode
 * @return {VNode} a new root VNode with the replacement applied
 */
export function replaceNode(
    root: VNode,
    selector: string,
    replacement: VNode
): VNode {
    if (select(selector, root)[0] === root) {
        return replacement;
    }
    if (!root.children) {
        return root;
    }

    const children: VNode[] = (root.children as VNode[]).map(e =>
        replaceNode(e, selector, replacement)
    );

    return { ...root, children };
}

/**
 * Returns the index of the element in the parent's children array
 * @param {Element} e the child element
 * @return {number} the index
 */
export function getIndex(node: any): number {
    return Array.prototype.indexOf.call(node.parentNode.children, node);
}

/**
 * Gets the correct style attribute value for the given parameters
 * @param {StartPositionOffset} event the mouse event that was triggered, enriched with distance information
 * @param {MouseOffset} mouseOffset the offset of the item
 * @param {ClientRect} itemRect the bounding client rect of the item
 * @return {string} the style value
 */
export function getGhostStyle(mouseOffset: MouseOffset, item: Element): string {
    const itemRect: ClientRect = item.getBoundingClientRect();
    return (
        'z-index: 5; margin: 0; pointer-events: none; position: absolute; ' +
        'width: ' +
        itemRect.width +
        'px; ' +
        'height: ' +
        itemRect.height +
        'px; ' +
        'top: ' +
        (mouseOffset.itemTop - mouseOffset.parentTop) +
        'px; ' +
        'left: ' +
        (mouseOffset.itemLeft - mouseOffset.parentLeft) +
        'px;'
    );
}

/**
 * Returns the updated style for this ghost element
 */
export function updateGhostStyle(
    event: StartPositionOffset,
    mouseOffset: MouseOffset,
    ghost: Element
): string {
    const prevStyle: string = ghost.getAttribute('style');

    return (
        prevStyle.substring(0, prevStyle.indexOf(' top:')) +
        ' top: ' +
        (mouseOffset.itemTop - mouseOffset.parentTop + event.distY) +
        'px; left: ' +
        (mouseOffset.itemLeft - mouseOffset.parentLeft + event.distX) +
        'px;'
    );
}

/**
 * Prevents the page from randomly selecting text when dragging
 * @return {string} the content of the style attribute
 */
export function getBodyStyle(): string {
    return (
        '-webkit-user-select: none; -moz-user-select: none;' +
        ' -ms-user-select: none; user-select: none; overflow: hidden;'
    );
}

/**
 * Finds the parent element that matches the given selector
 * @param {Element} node the current element
 * @param {string} selector a valid CSS selector
 * @return {any} the searched parent or undefined if not found
 */
export function findParent(node: Element, selector: string): Element {
    if ((node.matches || (node as any).matchesSelector).call(node, 'html')) {
        return undefined;
    }
    if ((node.matches || (node as any).matchesSelector).call(node, selector)) {
        return node;
    }
    return findParent(node.parentNode as Element, selector);
}

/**
 * Adds the given attribute safely to the VNode
 * @param {VNode} node the VNode to add the attributes on
 * @param {any} addition the new attributes
 * @return {VNode} the newly created VNode
 */
export function addAttributes(
    e: VNode,
    newAttr: { [attr: string]: any },
    ghostClass?: string
): VNode {
    const addition: any = {
        attrs: Object.assign({}, e.data ? e.data.attrs : undefined, newAttr)
    };
    return addToData(e, addition);
}

/**
 * Adds the given class safely to the VNode
 * @param {VNode} node the VNode to add the attributes on
 * @param {any} addition the css ghost class
 * @return {VNode} the newly created VNode
 */
export function addGhostClass(e: VNode, ghostClass?: string): VNode {
    const className =
        ghostClass && ghostClass.length > 1
            ? ghostClass[0] === '.' ? ghostClass.substring(1) : ghostClass
            : undefined;
    const classVal = className ? { [className]: true } : undefined;
    const addition: any = {
        class: classVal
    };
    return addToData(e, addition);
}

/**
 * Removes the given attribute from the VNode
 * @param {VNode} node the VNode
 * @param {string} attributeName the name of the attribute
 * @return {VNode} a new VNode without the attribute
 */
export function removeAttribute(node: VNode, attributeName: string): VNode {
    if (!node.data || !node.data.attrs) {
        return node;
    }
    return Object.assign({}, node, {
        data: Object.assign({}, node.data, {
            attrs: Object.keys(node.data.attrs)
                .filter(k => k !== attributeName)
                .map(k => ({ [k]: node.data.attrs[k] }))
                .reduce((acc, curr) => Object.assign(acc, curr), {})
        })
    });
}

/**
 * Adds the given additions safely to the VNode
 * @param {VNode} node the VNode to add the additions on
 * @param {any} addition the new additions
 * @return {VNode} the newly created VNode
 */
export function addToData(
    node: VNode,
    additions: { [key: string]: any }
): VNode {
    const hasData: boolean = node.data !== undefined;
    const key: string = Object.keys(additions)[0];
    const a: any = Object.assign(
        {},
        hasData ? { [key]: node.data[key] } : {},
        additions
    );
    const data: VNodeData = Object.assign({}, node.data, a);

    return Object.assign({}, node, {
        data: data
    });
}

/**
 * Calculates the intersection of two elements
 * @param {Element} e1 the first element
 * @param {Element} e2 the first element
 * @return {Intersection} the intersection or undefined if there is no intersecton
 */
export function getIntersection(e1: Element, e2: Element): Intersection {
    const c1: ClientRect = e1.getBoundingClientRect();
    const c2: ClientRect = e2.getBoundingClientRect();

    const intersection: Intersection = {
        xmin: Math.max(c1.left, c2.left),
        ymin: Math.max(c1.top, c2.top),
        xmax: Math.min(c1.right, c2.right),
        ymax: Math.min(c1.bottom, c2.bottom)
    };

    return intersection;
}

/**
 * Calculates the area of the given rectangle
 */
export function getArea(intersection: Intersection): number {
    return (
        (intersection.xmax - intersection.xmin) *
        (intersection.ymax - intersection.ymin)
    );
}
