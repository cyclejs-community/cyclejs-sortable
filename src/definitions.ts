import { Stream } from 'xstream';
import { VNode } from '@cycle/dom';

export type Transform<T, U> = (s: Stream<T>) => Stream<U>;
export type EventHandler = (
    node: VNode,
    event: MouseEvent,
    options: SortableOptions
) => VNode;

export interface SortableOptions {
    /**
     * Optional, has to be a valid CSS selector.
     * Used to select a child of the root VNode as parent of the sortable
     * The items are always the children of that VNode (are not allowed to be strings)
     * @default the root VNode of the given DOMSource
     * @type {string}
     */
    parentSelector?: string;

    /**
     * Optional, has to be a valid CSS selector.
     * Used to define a drag handle on the sortable items
     * @default string the whole item
     * @type {string}
     */
    handle?: string;

    /**
     * Optional, has to be a CSS class name
     * Can be used to style the ghost item
     * @default string ''
     * @type {string}
     */
    ghostClass?: string;

    /**
     * Optional, number of milliseconds to
     * wait after mousedown/touchstart before selecting the item
     * @default number in milliseconds, defaults to 0
     * @type {number}
     */
    selectionDelay?: number;
}

/**
 * Contains the offset from the cursor to the top left of the item
 * x and y are negative or zero, so you have to add them to the current mouse position
 * @type {MouseOffset}
 */
export interface MouseOffset {
    x: number;
    y: number;
    itemLeft: number;
    itemTop: number;
    parentLeft: number;
    parentTop: number;
}

/**
 * Contains the offset from mousedown position
 * distX and distY increase going down and to the left
 * @type {StartPositionOffset}
 */
export interface StartPositionOffset extends MouseEvent {
    distX: number;
    distY: number;
}

/**
 * Defines the object available on a custom updateOrder event
 * @type {EventDetails}
 */
export interface EventDetails {
    newOrder: number[];
    oldIndex: number;
    newIndex: number;
}

export interface ItemDimensions {
    width: number;
    height: number;
}

export interface Intersection {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
}
