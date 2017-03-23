import xs, { Stream } from 'xstream';
import { run } from '@cycle/run';
import { ul, li, div, h3, makeDOMDriver, DOMSource, VNode } from '@cycle/dom';

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
        div([
            h3('Horizontal too!'),
            ul('.ul', [
                li('.li', '', ['Option 1']),
                li('.li', '', ['Option 2']),
                li('.li', '', ['Option 3']),
                li('.li', '', ['Option 4']),
                li('.li', '', ['Option 5']),
                li('.li', '', ['Option 6']),
            ])
        ])
    )
    .compose(makeSortable(DOM, {
        parentSelector: '.ul'
    }));

    return {
        DOM: vdom$
    };
}

run(main, {
    DOM: makeDOMDriver('#app')
});
