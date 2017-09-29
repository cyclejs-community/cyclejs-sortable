import { Observable } from 'rxjs';
import { run } from '@cycle/rxjs-run';
import {
    ul,
    li,
    div,
    h3,
    p,
    makeDOMDriver,
    DOMSource,
    VNode
} from '@cycle/dom';

import { makeSortable } from '../../../src/makeSortable';

type Sources = {
    DOM: DOMSource;
};

type Sinks = {
    DOM: Observable<VNode>;
};

function main({ DOM }: Sources): Sinks {
    const vdom$: Observable<VNode> = Observable.of(
        div([
            h3('Horizontal too!'),
            p('this is running with RxJS'),
            ul('.ul', [
                li('.li', '', ['Option 1']),
                li('.li', '', ['Option 2']),
                li('.li', '', ['Option 3']),
                li('.li', '', ['Option 4']),
                li('.li', '', ['Option 5']),
                li('.li', '', ['Option 6'])
            ])
        ])
    ).let(
        makeSortable<Observable<VNode>>(DOM, {
            parentSelector: '.ul'
        })
    );

    return {
        DOM: vdom$
    };
}

run(main, {
    DOM: makeDOMDriver('#app')
});
