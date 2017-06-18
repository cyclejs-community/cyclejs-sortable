import xs, { Stream } from 'xstream';
import { run } from '@cycle/run';
import { ul, li, makeDOMDriver, DOMSource, VNode } from '@cycle/dom';

import { makeSortable } from '../../../src/makeSortable';

type Sources = {
    DOM : DOMSource;
};

type Sinks = {
    DOM : Stream<VNode>;
};

function main({ DOM } : Sources) : Sinks
{
    const vdom$ : Stream<VNode> = xs.of(
        ul('.ul', [
            li('.li', '', ['Option 1']),
            li('.li', '', ['Option 2']),
            li('.li', '', ['Option 3']),
            li('.li', '', ['Option 4']),
            li('.li', '', ['Option 5']),
            li('.li', '', ['Option 6']),
        ])
    )
    .compose(makeSortable<Stream<VNode>>(DOM, { ghostClass: '.ghost', selectionDelay: 500 }));

    return {
        DOM: vdom$
    };
}

run(main, {
    DOM: makeDOMDriver('#app')
});
