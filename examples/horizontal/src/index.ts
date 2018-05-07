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
    DOM?: Observable<VNode>;
    sortable?: Observable<boolean>;
};

function userSelectDriver(sort$): void {
    sort$.addListener({
        next(b) {
            if (b) {
                document.body.setAttribute(
                    'style',
                    '-webkit-user-select: none; -moz-user-select: none;' +
                        ' -ms-user-select: none; user-select: none;'
                );
            } else {
                document.body.removeAttribute('style');
            }
        }
    });
}

function main(sources: Sources): Sinks {
    const sinks = makeSortable(Child, {
        itemSelector: '.li'
    })(sources);

    return {
        ...sinks,
        DOM: sinks.DOM.map(dom =>
            div([h3('Horizontal too!'), p('this is running with RxJS'), dom])
        )
    };
}

function Child({ DOM }: Sources): Sinks {
    const vdom$: Observable<VNode> = Observable.of(
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

run(main, {
    DOM: makeDOMDriver('#app'),
    sortable: userSelectDriver
});
