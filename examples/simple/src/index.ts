import xs, { Stream } from 'xstream';
import Cycle from '@cycle/xstream-run';
import { ul, li, makeDOMDriver, DOMSource, VNode } from '@cycle/dom';

import { makeSortable } from '../../../src/makeSortable';

interface Sources {
    DOM : DOMSource;
}

interface Sinks {
    DOM : Stream<VNode>;
}

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
    .compose(makeSortable(DOM));

    return {
        DOM: vdom$
    };
}

Cycle.run(main, {
    DOM: makeDOMDriver('#app')
});
