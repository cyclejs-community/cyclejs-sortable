import xs, { Stream } from 'xstream';
import delay from 'xstream/extra/delay';
import { DOMSource, VNode } from '@cycle/dom';
import { adapt } from '@cycle/run/lib/adapt';

import { SortableOptions, Transform, EventDetails } from './definitions';
import { applyDefaults } from './helpers';
import { handleEvent } from './eventHandlers';
import { emitBetween } from './xstreamHelpers';

export { SortableOptions, Transform, EventHandler, EventDetails } from './definitions';

function augmentEvent(ev : any) : any {
    const touch : any = (ev as any).touches[0];
    ev.clientX = touch.clientX;
    ev.clientY = touch.clientY;
    return ev;
}

/**
 * Can be composed with a Stream of VNodes to make them sortable via drag&drop
 * @param {DOMSource} dom The preselected root VNode of the sortable, also indicates the area in which the ghost can be dragged
 * @param {SortableOptions} options  @see {SortableOptions}
 * @return {Transform<VNode, VNode>} A function to be composed with a view VNode stream
 */
export function makeSortable<T>(dom : DOMSource, options? : SortableOptions) : (s : T) => T
{
    return sortable => adapt(
        (xs.fromObservable(sortable as any) as Stream<VNode>)
        .map(node => {
            const defaults : SortableOptions = applyDefaults(options || {}, node);

            const mousedown$ : Stream<MouseEvent> = xs.merge(
                xs.fromObservable(dom.select(defaults.handle).events('mousedown')),
                xs.fromObservable(dom.select(defaults.handle).events('touchstart'))
                    .map(augmentEvent)
            ) as Stream<MouseEvent>;

            const mouseup$ : Stream<MouseEvent> = mousedown$
                .mapTo(
                    xs.merge(
                        xs.fromObservable(dom.select('body').events('mouseleave')),
                        xs.fromObservable(dom.select('body').events('mouseup')),
                        xs.fromObservable(dom.select(defaults.handle).events('touchend'))
                    )
                    .take(1)
                ).flatten() as Stream<MouseEvent>;

            const mousemove$ : Stream<MouseEvent> = mousedown$
                .mapTo(xs.merge(
                    xs.fromObservable(dom.select('body').events('mousemove')),
                    xs.fromObservable(dom.select(defaults.handle).events('touchmove'))
                        .map(augmentEvent)
                ))
                .flatten()
                .compose(emitBetween(mousedown$, mouseup$)) as Stream<MouseEvent>;

            const event$ : Stream<MouseEvent> = xs.merge(mousedown$, mouseup$, mousemove$);

            return event$.fold((acc, curr) => handleEvent(acc, curr, defaults), node);
        })
        .flatten()
    );
}

/**
 * Returns a stream of swapped indices
 * @param {DOMSource} dom a DOMSource containing the sortable
 * @param {string} parentSelector a valid CSS selector for the sortable parent (not the items)
 * @return {Stream<EventDetails>} an object containing the new positions @see EventDetails
 */
export function getUpdateEvent(dom : DOMSource, parentSelector : string) : Stream<EventDetails>
    {
        return adapt(
            (xs.fromObservable(dom.select(parentSelector).events('updateOrder')) as Stream<any>)
                .compose(delay(10)) //Allow mouseup to execute properly
                .map(ev => ev.detail)
        );
    }
