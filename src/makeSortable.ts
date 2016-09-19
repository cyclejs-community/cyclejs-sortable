import xs, { Stream } from 'xstream';
import { DOMSource, VNode, VNodeData } from '@cycle/dom';

import { SortableOptions, Transform, EventHandler } from './definitions';
import { applyDefaults, addKeys } from './helpers';
import { handleEvent } from './eventHandlers';
import { emitBetween } from './xstreamHelpers';

/**
 * Can be composed with a Stream of VNodes to make them sortable via drag&drop
 * @param {DOMSource} dom The preselected root VNode of the sortable, also indicates the area in which the ghost can be dragged
 * @param {SortableOptions} options  @see {SortableOptions}
 * @return {Transform<VNode, VNode>} A function to be composed with a view VNode stream
 */
export function makeSortable(dom : DOMSource, options? : SortableOptions) : Transform<VNode, VNode>
{
    return sortable => sortable
        .map(node => {
            const defaults : SortableOptions = applyDefaults(options, node);
            const newNode : VNode = addKeys(node, defaults);

            const mousedown$ : Stream<MouseEvent> = dom.select(defaults.handle)
                .events('mousedown');

            const mouseup$ : Stream<MouseEvent> = mousedown$
                .mapTo(dom.select('body').events('mouseup'))
                .flatten();

            const mousemove$ : Stream<MouseEvent> = mousedown$
                .mapTo(dom.select('body').events('mousemove'))
                .flatten()
                .compose(emitBetween(mousedown$, mouseup$));

            const event$ : Stream<MouseEvent> = xs.merge(mousedown$, mouseup$, mousemove$);

            return event$.fold((acc, curr) => handleEvent(acc, curr, defaults), newNode);
        })
        .flatten();
}
