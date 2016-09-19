import { Stream } from 'xstream';
import { VNode } from '@cycle/dom';

export type Transform<T, U> = (s : Stream<T>) => Stream<U>
export type EventHandler = (node : VNode, event : MouseEvent, options : SortableOptions) => VNode;

export interface SortableOptions {
    /**
     * Optional, has to be a valid CSS selector.
     * Used to select a child of the root VNode as parent of the sortable
     * Currently works only with a simple CSS class selector
     * @default the root VNode of the given DOMSource
     * @type {string}
     */
    parentSelector? : string;

    /**
     * Optional, has to be a valid CSS selector.
     * Used to define a drag handle on the sortable items
     * @default the whole item (the first CSS class of the first item is used as selector)
     * @type {string}
     */
    handle? : string;

    /**
     * Optional, only used in conjunction with @see {handle}, has to be a valid CSS selector.
     * Used to define the item
     * @default the parent of the handle
     * @type {string}
     */
    itemSelector? : string;

    /**
     * Optional, has to be a CSS class name
     * Can be used to style the ghost item
     * @default the first CSS class of the first item
     * @type {string}
     */
    ghostClass? : string;
}

/**
 * Contains the offset from the cursor to the top left of the item
 * x and y are negative or zero, so you have to add them to the current mouse position
 * @type {MouseOffset}
 */
export interface MouseOffset
{
    x : number;
    y : number;
}

/**
 * Defines the object available on a custom updateOrder event
 * @type {EventDetails}
 */
export interface EventDetails
{
    newOrder : number[];
    oldIndex : number;
    newIndex : number;
}

export interface ItemDimensions
{
    width : number;
    height : number;
}

export interface Intersection
{
    xmin : number;
    ymin : number;
    xmax : number;
    ymax : number;
}
