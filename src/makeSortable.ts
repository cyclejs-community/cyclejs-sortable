import xs, { Stream } from 'xstream';
import delay from 'xstream/extra/delay';
import { DOMSource, VNode } from '@cycle/dom';
import { adapt } from '@cycle/run/lib/adapt';

import {
    SortableOptions,
    StartPositionOffset,
    Transform,
    EventDetails
} from './definitions';
import { applyDefaults, addKeys } from './helpers';
import { handleEvent } from './eventHandlers';

export {
    SortableOptions,
    Transform,
    EventHandler,
    EventDetails
} from './definitions';

function augmentEvent(ev: any): MouseEvent {
    const touch: any = (ev as any).touches[0];
    ev.clientX = touch.clientX;
    ev.clientY = touch.clientY;
    return ev;
}

function augmentStartDistance(
    ev: any,
    startX: any,
    startY: any
): StartPositionOffset {
    ev.distX = ev.clientX - startX;
    ev.distY = ev.clientY - startY;
    return ev;
}

function moreThanOneChild(node: VNode) {
    if (Array.isArray(node)) {
        throw new Error('Composed stream should emit VNodes not arrays');
    }

    return !node || node.children.length > 1;
}

function notMoreThanOneChild(node: VNode) {
    return !moreThanOneChild(node);
}

/**
 * Can be composed with a Stream of VNodes to make them sortable via drag&drop
 * @param {DOMSource} dom The preselected root VNode of the sortable, also indicates the area in which the ghost can be dragged
 * @param {SortableOptions} options  @see {SortableOptions}
 * @return {Transform<VNode, VNode>} A function to be composed with a view VNode stream
 */
export function makeSortable<T>(
    dom: DOMSource,
    options?: SortableOptions
): (s: T) => T {
    return sortable => {
        const dom$ = (xs.fromObservable(sortable as any) as Stream<
            VNode
        >).remember();

        const moreThanOneChild$ = dom$.filter(moreThanOneChild);
        const notMoreThanOneChild$ = dom$.filter(notMoreThanOneChild);
        const out$ = xs.merge(
            notMoreThanOneChild$,
            moreThanOneChild$
                .map(addKeys)
                .map(node => {
                    const defaults: SortableOptions = applyDefaults(
                        options || {},
                        node
                    );
                    const down$ = xs.merge(
                        xs.fromObservable(
                            dom.select(defaults.handle).events('mousedown')
                        ),
                        xs
                            .fromObservable(
                                dom.select(defaults.handle).events('touchstart')
                            )
                            .map(augmentEvent)
                    );
                    const up$ = xs.merge(
                        xs.fromObservable(
                            dom.select('body').events('mouseleave')
                        ),
                        xs.fromObservable(dom.select('body').events('mouseup')),
                        xs.fromObservable(
                            dom.select(defaults.handle).events('touchend')
                        )
                    );

                    const move$ = xs.merge(
                        xs.fromObservable(
                            dom.select('body').events('mousemove')
                        ),
                        xs
                            .fromObservable(
                                dom.select(defaults.handle).events('touchmove')
                            )
                            .map(augmentEvent)
                    );

                    const mousedown$: Stream<MouseEvent> = down$
                        .map(ev =>
                            xs
                                .of(ev)
                                .compose(delay(defaults.selectionDelay))
                                .endWhen(xs.merge(up$, move$))
                        )
                        .flatten() as Stream<MouseEvent>;

                    const mouseup$: Stream<MouseEvent> = mousedown$
                        .map(_ => up$.take(1))
                        .flatten() as Stream<MouseEvent>;

                    const mousemove$: Stream<MouseEvent> = mousedown$
                        .map(start => {
                            return move$
                                .map(ev =>
                                    augmentStartDistance(
                                        ev,
                                        start.clientX,
                                        start.clientY
                                    )
                                )
                                .endWhen(mouseup$);
                        })
                        .flatten() as Stream<MouseEvent>;
                    const event$: Stream<MouseEvent> = xs.merge(
                        mousedown$,
                        mouseup$,
                        mousemove$
                    );

                    return event$.fold(
                        (acc, curr) => handleEvent(acc, curr, defaults),
                        node
                    );
                })
                .flatten()
        );
        return adapt(out$ as any);
    };
}

/**
 * Returns a stream of swapped indices
 * @param {DOMSource} dom a DOMSource containing the sortable
 * @param {string} parentSelector a valid CSS selector for the sortable parent (not the items)
 * @return {Stream<EventDetails>} an object containing the new positions @see EventDetails
 */
export function getUpdateEvent(
    dom: DOMSource,
    parentSelector: string
): Stream<EventDetails> {
    return adapt((xs.fromObservable(
        dom.select(parentSelector).events('updateOrder')
    ) as Stream<any>)
        .compose(delay(10)) //Allow mouseup to execute properly
        .map(ev => ev.detail) as any);
}
