import xs, { Stream } from 'xstream';
import { run } from '@cycle/run';
import {
    ul,
    li,
    p,
    h2,
    div,
    makeDOMDriver,
    DOMSource,
    VNode
} from '@cycle/dom';

import { makeSortable } from '../../../src/makeSortable';

interface Sources {
    DOM: DOMSource;
}

interface Sinks {
    DOM: Stream<VNode>;
}

const sortable = makeSortable(Child, {
    itemSelector: '.li'
});

function Child({ DOM }: Sources): Sinks {
    const vdom$: Stream<VNode> = xs.of(
        ul('.ul', [
            li('.li', '', ['Option 1']),
            li('.li', '', ['Option 2']),
            li('.li', '', ['Option 3']),
            li('.li', '', ['Option 4']),
            li('.li', '', ['Option 5']),
            li('.li', '', ['Option 6'])
        ])
    );

    return {
        DOM: vdom$
    };
}

function main(sources: Sources): Sinks {
    const sinks = sortable(sources);

    const vdom$ = xs
        .combine(
            sinks.DOM,
            sinks.dragging,
            sinks.updateLive.startWith(undefined),
            sinks.updateDone.startWith(undefined)
        )
        .map(([childDOM, isDragging, lastUpdate, update]) =>
            div([
                h2(['Event example']),
                childDOM,
                p(['Is dragging: ' + isDragging]),
                lastUpdate
                    ? p([
                          'Last reordering: ' +
                              lastUpdate.oldIndex +
                              ' to ' +
                              lastUpdate.newIndex
                      ])
                    : p(['Last reordering: none']),
                update
                    ? p([
                          'Last completed reordering: ' +
                              update.oldIndex +
                              ' to ' +
                              update.newIndex
                      ])
                    : p(['Last completed reordering: none'])
            ])
        );

    return {
        DOM: vdom$
    };
}

run(main, {
    DOM: makeDOMDriver('#app')
});
