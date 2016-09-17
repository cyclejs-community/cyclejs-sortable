import { Stream } from 'xstream';

/**
 * CSS class name that is added to every item
 * @type {string}
 */
export const itemClassName : string = 'x-sortable-item';

export type Transform<T, U> = (s : Stream<T>) => Stream<U>

export interface SortableOptions {
    /**
     * Optional, has to be a valid CSS selector.
     * Used to select a child of the root VNode as parent of the sortable
     * @default the root VNode of the given DOMSource
     * @type {string}
     */
    parentSelector? : string;

    /**
     * Optional, has to be a valid CSS selector.
     * Used to define a drag handle on the sortable items
     * @type {string}
     */
    handle? : string;

    /**
     * Optional, has to be a CSS class name
     * Can be used to style the ghost item
     * @type {string}
     */
    ghostClass? : string;
}
