import xs, { Stream } from 'xstream';
import Cycle from '@cycle/xstream-run';
import { ul, li, span, div, makeDOMDriver, DOMSource, VNode } from '@cycle/dom';

import { makeSortable, getUpdateEvent } from '../../../src/makeSortable';

interface Sources {
    DOM : DOMSource;
}

interface Sinks {
    DOM : Stream<VNode>;
}

function main({ DOM } : Sources) : Sinks
{
    const sortable$ : Stream<VNode> = xs.of(
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

    const update$ : Stream<VNode> = getUpdateEvent(DOM, '.ul')
        .map(o => 'You changed item Number ' + (o.oldIndex + 1) + ' to postion ' + (o.newIndex + 1))
        .startWith('You havent changed anything yet')
        .map(s => span('.span', s));

    const vdom$ : Stream<VNode> = xs.combine(sortable$, update$)
        .map(arr => div([arr[0], arr[1]]));

    return {
        DOM: vdom$
    };
}

Cycle.run(main, {
    DOM: makeDOMDriver('#app')
});
