import { VNode, VNodeData } from '@cycle/dom';
import select from 'snabbdom-selector';
import { SortableOptions, MouseOffset } from './definitions';

/**
 * Takes the maybe undefined options and fills them with defaults
 * @param {SortableOptions} options the options, can be undefined
 * @param {VNode} the root VNode of the DOMSource
 * @return {SortableOptions} the non-null options filled with default
 */
export function applyDefaults(options : SortableOptions, root : VNode) : SortableOptions
{
    const sortableRoot : VNode = options && options.parentSelector ?
        select(options.parentSelector, root)[0] : root;

    const itemClass : string = (sortableRoot.children[0] as VNode).sel.split('.')[1];
    const itemSelector : string = options && options.handle ?
        getParentNode(root, options.handle).sel : '.' + itemClass;

    return Object.assign({
        parentSelector: root.sel.substr(root.sel.indexOf('.') + 1),
        handle: '.' + itemClass,
        itemSelector: itemSelector,
        ghostClass: itemClass,
    }, options);
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
        .reduce((acc, curr) => !acc && select(selector, curr)[0] === curr ? true : false, false);

    if (childMatch) { return root; }

    return root.children
        .map<VNode>(e => typeof(e) !== 'object' ? undefined : getParentNode(e, selector))
        .reduce((acc, curr) => !acc && curr ? curr : acc, undefined);
}

/**
 * Replaces the node matching the selector with the replacement
 * @param {VNode} root the root VNode
 * @param {string} selector a valid CSS selector for the replacement
 * @param {VNode} replacement the new VNode
 * @return {VNode} a new root VNode with the replacement applied
 */
export function replaceNode(root : VNode, selector : string, replacement : VNode) : VNode
{
    if (select(selector, root)[0] === root) {
        return replacement;
    }
    if (!root.children) { return root; }

    return Object.assign({}, root, {
        children: root.children
            .map(e => replaceNode(e, selector, replacement))
    });
}

/**
 * Returns the index of the element in the parent's children array
 * @param {Element} e the child element
 * @return {number} the index
 */
 export function getIndex(node : any) : number
 {
     return Array.prototype.indexOf.call(node.parentNode.children, node);
 }

/**
 * Gets the correct style attribute value for the given parameters
 * @param {MouseEvent} event the mouse event that was triggered
 * @param {MouseOffset} mouseOffset the offset of the item
 * @param {ClientRect} itemRect the bounding client rect of the item
 * @return {string} the style value
 */
export function getGhostStyle(event : MouseEvent, mouseOffset : MouseOffset, itemRect : ClientRect) : string
{
    return 'z-index: 5; margin: 0; pointer-events: none; position: absolute; width: '
        + itemRect.width + 'px; ' + 'height: ' + itemRect.height + 'px; top: '
        + (event.clientY + mouseOffset.y + (event.target as Element).scrollTop) + 'px; left: '
        + (event.clientX + mouseOffset.x) + 'px;';
}

/**
 * Finds the parent element that matches the given selector
 * @param {Element} node the current element
 * @param {string} selector a valid CSS selector
 * @return {any} the searched parent or undefined if not found
 */
export function findParent(node : Element, selector : string) : Element
{
    if ((node.matches || (node as any).matchesSelector).call(node, 'html')) {
        return undefined;
    }
    if ((node.matches || (node as any).matchesSelector).call(node, selector)) {
        return node;
    }
    return findParent(node.parentNode as Element, selector);
}

/**
 * Adds the given attribute savely to the VNode
 * @param {VNode} node the VNode to add the attributes on
 * @param {any} addition the new attributes
 * @return {VNode} the newly created VNode
 */
export function addAttributes(e : VNode, newAttr : { [attr : string]: any }) : VNode
{
    const addition : any = { attrs: Object.assign({}, e.data ? e.data.attrs : undefined, newAttr) };
    return addToData(e, addition);
}

/**
 * Adds the given additions savely to the VNode
 * @param {VNode} node the VNode to add the additions on
 * @param {any} addition the new additions
 * @return {VNode} the newly created VNode
 */
function addToData(node : VNode, additions : { [key : string]: any }) : VNode
{
    const hasData : boolean = node.data !== undefined;
    const key : string = Object.keys(additions)[0];
    const a : any = Object.assign({}, hasData ? { [key]: node.data[key] } : {}, additions);
    const data : VNodeData = Object.assign({}, node.data, a);

    return Object.assign({}, node, {
        data: data
    });
}

/**
 * Returns the dimensions of the element without the padding on width and height
 * @param {Element} element
 * @return {ClientRect}
 */
export function getClientRect(element : Element) : ClientRect
{
    const styles : CSSStyleDeclaration = window.getComputedStyle(element);
    const paddingX : number = parseFloat(styles.paddingLeft.slice(0, -2))
        + parseFloat(styles.paddingRight.slice(0, -2));
    const paddingY : number = parseFloat(styles.paddingTop.slice(0, -2))
        + parseFloat(styles.paddingBottom.slice(0, -2));
    const clientRect : ClientRect = element.getBoundingClientRect();

    return { //For whatever reason, but Object.assign does not work here
        top: clientRect.top,
        left: clientRect.left,
        bottom: clientRect.bottom,
        right: clientRect.right,
        width: clientRect.width - paddingX,
        height: clientRect.height - paddingY
    };
}
