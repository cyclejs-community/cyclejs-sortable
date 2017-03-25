import xs, { Stream } from 'xstream';
import { run } from '@cycle/run';
import { ul, li, div, span, makeDOMDriver, DOMSource, VNode } from '@cycle/dom';

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
            span('.test', 'Test, should not move'),
            ul('.ul', [
                li('.class', '', ['Option 1']),
                li('.class', '', ['Option 2']),
                li('.class', '', ['Option 3']),
                li('.class', '', ['Option 4']),
                li('.class', '', ['Option 5']),
                li('.class', '', ['Option 6']),
            ])
        ])
    )
    .compose(makeSortable<Stream<VNode>>(DOM, {
        parentSelector: '.ul'
    }));

    return {
        DOM: vdom$
    };
}

run(main, {
    DOM: makeDOMDriver('#app')
});
