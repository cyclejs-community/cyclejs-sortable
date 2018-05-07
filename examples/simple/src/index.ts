import xs, { Stream } from 'xstream';
import { run } from '@cycle/run';
import { ul, li, makeDOMDriver, DOMSource, VNode } from '@cycle/dom';

import { makeSortable } from '../../../src/makeSortable';

type Sources = {
    DOM: DOMSource;
};

type Sinks = {
    DOM: Stream<VNode>;
};

const main = makeSortable(Child, {
    itemSelector: '.li',
    selectionDelay: 500
});

function Child({ DOM }: Sources): Sinks {
    const vdom$: Stream<VNode> = xs.of(
        ul('.ul', [
            li('.li', '', ['You have to hold for 500ms to start reordering']),
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

run(main, {
    DOM: makeDOMDriver('#app')
});
