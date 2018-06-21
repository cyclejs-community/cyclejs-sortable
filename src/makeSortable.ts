import xs, { Stream } from 'xstream';
import delay from 'xstream/extra/delay';
import sampleCombine from 'xstream/extra/sampleCombine';
import throttle from 'xstream/extra/throttle';
import { DOMSource, VNode } from '@cycle/dom';
import { adapt } from '@cycle/run/lib/adapt';

import { addKeys } from './helpers';
import { handleEvent } from './eventHandler';

export type Component<So, Si> = (s: So) => Si;
export type HOC<So, Si> = (
    c: Component<So, Si>
) => Component<So, Si & SortableSinks>;

export interface SortableOptions {
    itemSelector: string;
    handle?: string;
    DOMDriverKey?: string;
    TimeDriverKey?: string;
    selectionDelay?: number;
}

export interface UpdateOrder {
    indexMap: { [old: number]: number };
    oldIndex: number;
    newIndex: number;
}

export interface SortableSinks {
    dragging: Stream<boolean>;
    updateLive: Stream<UpdateOrder>;
    updateDone: Stream<UpdateOrder>;
}

export function toSortable<Sources extends object, Sinks extends object>(
    options: SortableOptions
): HOC<Sources, Sinks> {
    return component => makeSortable(component, options);
}

export function makeSortable<Sources extends object, Sinks extends object>(
    main: Component<Sources, Sinks>,
    options: SortableOptions
): Component<Sources, Sinks & SortableSinks> {
    return function(sources: Sources): Sinks & SortableSinks {
        if (!options.DOMDriverKey) {
            options.DOMDriverKey = 'DOM';
        }
        if (!options.TimeDriverKey) {
            options.TimeDriverKey = 'Time';
        }

        const sinks: any = main(sources);
        const eventHandler = handleEvent(options);

        const childDOM$: Stream<VNode> = xs
            .fromObservable<VNode>(sinks[options.DOMDriverKey])
            .map(addKeys);

        const down$: Stream<MouseEvent> = getMouseStream(
            sources[options.DOMDriverKey],
            ['mousedown', 'touchstart'],
            options.handle || options.itemSelector
        );
        const up$: Stream<MouseEvent> = getMouseStream(
            sources[options.DOMDriverKey],
            ['mouseleave', 'mouseup', 'touchend'],
            'body'
        );
        const move$: Stream<MouseEvent> = getMouseStream(
            sources[options.DOMDriverKey],
            ['mousemove', 'touchmove'],
            'body'
        );

        const mousedown$: Stream<MouseEvent> = down$
            .map(ev =>
                xs
                    .of(ev)
                    .compose<Stream<MouseEvent>>(
                        sources[options.TimeDriverKey]
                            ? sources[options.TimeDriverKey].delay(
                                  options.selectionDelay
                              )
                            : delay(options.selectionDelay)
                    )
                    .endWhen(xs.merge(up$, move$))
            )
            .flatten();
        const mouseup$: Stream<MouseEvent> = mousedown$
            .map(_ => up$.take(1))
            .flatten();
        const mousemove$: Stream<MouseEvent> = mousedown$
            .map(start => move$.endWhen(mouseup$))
            .flatten();

        const data$: Stream<[VNode, UpdateOrder | undefined]> = childDOM$
            .map(dom =>
                xs
                    .merge(mousedown$, mousemove$, mouseup$)
                    .fold(eventHandler, [dom, undefined])
            )
            .flatten();

        const vdom$: Stream<VNode> = data$.map(([dom, _]) => dom);

        const updateOrder$: Stream<UpdateOrder> = data$
            .map(([_, x]) => x)
            .filter(x => x !== undefined);

        const updateAccumulated$: Stream<UpdateOrder> = mousedown$
            .map(
                () =>
                    updateOrder$
                        .fold(
                            (acc, curr) => ({
                                indexMap: acc.indexMap
                                    ? Object.keys(acc.indexMap)
                                          .map(k => ({
                                              [k]:
                                                  curr.indexMap[acc.indexMap[k]]
                                          }))
                                          .reduce(
                                              (a, c) => ({ ...a, ...c }),
                                              {}
                                          )
                                    : curr.indexMap,
                                oldIndex:
                                    acc.oldIndex === -1
                                        ? curr.oldIndex
                                        : acc.oldIndex,
                                newIndex: curr.newIndex
                            }),
                            {
                                indexMap: undefined,
                                oldIndex: -1,
                                newIndex: -1
                            }
                        )
                        .drop(1) as Stream<UpdateOrder>
            )
            .flatten();

        const updateDone$: Stream<UpdateOrder> = mouseup$
            .compose(sampleCombine(updateAccumulated$))
            .map(([_, x]) => x);

        const dragInProgress$ = xs
            .merge(mousedown$, mouseup$)
            .fold(acc => !acc, false);

        return {
            ...sinks,
            DOM: adapt(vdom$),
            dragging: adapt(dragInProgress$),
            updateLive: adapt(updateOrder$),
            updateDone: adapt(updateDone$)
        };
    };
}

function getMouseStream(
    DOM: DOMSource,
    eventTypes: string[],
    handle: string
): Stream<MouseEvent> {
    return xs.merge(
        ...eventTypes
            .slice(0, -1)
            .map(ev => xs.fromObservable(DOM.select(handle).events(ev))),
        xs
            .fromObservable(
                DOM.select(handle).events(eventTypes[eventTypes.length - 1])
            )
            .map(augmentEvent)
    ) as Stream<MouseEvent>;
}

function augmentEvent(ev: any): MouseEvent {
    const touch: any = ev.touches[0];
    ev.clientX = touch.clientX;
    ev.clientY = touch.clientY;
    return ev;
}
