import { VNode } from '@cycle/dom';
import select from 'snabbdom-selector';

import { EventHandler } from '../definitions';
import { replaceNode } from '../helpers';

export const mouseupHandler : EventHandler = (node, event, options) => {
    const parent : VNode = select(options.parentSelector, node)[0];

    return replaceNode(node, options.parentSelector, Object.assign({}, parent, {
        children: parent.children.slice(0, -1)
    }));
};
