import xs, { Stream } from 'xstream';
import delay from 'xstream/extra/delay';
import { DOMSource, VNode, VNodeData } from '@cycle/dom';

import { SortableOptions, Transform, EventHandler, EventDetails } from './definitions';
import { applyDefaults, addKeys } from './helpers';
import { handleEvent } from './eventHandlers';
import { emitBetween } from './xstreamHelpers';

export { SortableOptions, Transform, EventHandler, EventDetails } from './definitions';

/**
 * Can be composed with a Stream of VNodes to make them sortable via drag&drop
 * @param {DOMSource} dom The preselected root VNode of the sortable, also indicates the area in which the ghost can be dragged
 * @param {SortableOptions} options  @see {SortableOptions}
 * @return {Transform<VNode, VNode>} A function to be composed with a view VNode stream
 */
export function makeSortable(dom : DOMSource, options? : SortableOptions) : Transform<VNode, VNode>
{
    return sortable => sortable
        .map(node => {
            const defaults : SortableOptions = applyDefaults(options, node);

            const mousedown$ : Stream<MouseEvent> = dom.select(defaults.handle)
                .events('mousedown');

            const mouseup$ : Stream<MouseEvent> = mousedown$
                .mapTo(dom.select('body').events('mouseup').take(1))
                .flatten();

            const mousemove$ : Stream<MouseEvent> = mousedown$
                .mapTo(dom.select('body').events('mousemove'))
                .flatten()
                .compose(emitBetween(mousedown$, mouseup$));

            const event$ : Stream<MouseEvent> = xs.merge(mousedown$, mouseup$, mousemove$);

            return event$.fold((acc, curr) => handleEvent(acc, curr, defaults), node);
        })
        .flatten();
}

/**
 * Returns a stream of swapped indices
 * @param {DOMSource} dom a DOMSource containing the sortable
 * @param {string} parentSelector a valid CSS selector for the sortable parent (not the items)
 * @return {Stream<EventDetails>} an object containing the new positions @see EventDetails
 */
export function getUpdateEvent(dom : DOMSource, parentSelector : string) : Stream<EventDetails>
{
    return dom.select(parentSelector)
        .events('updateOrder')
        .compose(delay(10)) //Allow mouseup to execute properly
        .map(ev => ev.detail);
}
