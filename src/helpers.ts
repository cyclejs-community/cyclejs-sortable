import { VNode } from '@cycle/dom';

import { SortableOptions } from './definitions';

/**
 * Takes the maybe undefined options and fills them with defaults
 * @param {SortableOptions} options the options, can be undefined
 * @param {VNode} the root VNode of the DOMSource
 * @return {SortableOptions} the non-null options filled with default
 */
export function applyDefaults(options : SortableOptions, root : VNode) : SortableOptions
{
    const sortableRoot : VNode = options && options.parentSelector ?
        getNode(root, options.parentSelector) : root;

    const itemClass : string = (sortableRoot.children[0] as VNode).sel.split('.')[1];
    const itemSelector : string = options && options.handle ?
        getParentNode(root, options.handle).sel : '.' + itemClass;

    return Object.assign({
        parentSelector: root.sel,
        handle: '.' + itemClass,
        item: itemSelector,
        ghostClass: itemClass,
    }, options);
}

export function matchesSelector(node : VNode, selector : string) : boolean
{
    return node.sel.split('.').indexOf(selector.substring(1)) !== -1;
}

/**
 * Returns a child VNode that matches the selector.
 * Currently only works with simple class selector
 * @param {VNode} root the parent VNode
 * @param {string} selector a valid CSS selector
 * @return {VNode} The searched child node or undefined if none was found
 */
export function getNode(root : VNode, selector : string) : VNode
{
    if (matchesSelector(root, selector)) { return root; }
    if (root.children === undefined) { return undefined; }

    return root.children
        .map<VNode>(e => typeof(e) !== 'object' ? undefined : getNode(e, selector))
        .reduce((acc, curr) => !acc && curr ? curr : acc, undefined);
}

/**
 * Returns a parent VNode that has a children matching the selector.
 * Currently only works with simple class selector
 * @param {VNode} root the parent VNode
 * @param {string} selector a valid CSS selector
 * @return {VNode} The searched parent node or undefined if none was found
 */
export function getParentNode(root : VNode, selector : string) : VNode
{
    if (root.children === undefined) { return undefined; }

    const childMatch : boolean = root.children
        .reduce((acc, curr) => !acc && matchesSelector(curr, selector) ? true : false, false);

    if (childMatch) { return root; }

    return root.children
        .map<VNode>(e => typeof(e) !== 'object' ? undefined : getParentNode(e, selector))
        .reduce((acc, curr) => !acc && curr ? curr : acc, undefined);
}
