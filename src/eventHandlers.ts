import { VNode } from '@cycle/dom';

import { EventHandler, SortableOptions } from './definitions';
import { mousedownHandler } from './eventHandlers/mousedown';
import { mouseupHandler } from './eventHandlers/mouseup';
import { mousemoveHandler } from './eventHandlers/mousemove';

/**
 * Uses the event.type property to forward the event to the right handler
 * @param {VNode} the root VNode of the DOMSource
 * @param {MouseEvent} event the event that should be handled
 * @param {SortableOptions} options a valid SortableOptions object, it and its properties have to be defined
 * @return {VNode} The new root VNode
 */
export function handleEvent(node : VNode, event : MouseEvent, options : SortableOptions) : VNode
{
    const eventHandlerMapping : { [type : string]: EventHandler } = {
        'mousedown': mousedownHandler,
        'mouseup': mouseupHandler,
        'mousemove': mousemoveHandler
    };

    return eventHandlerMapping[event.type](node, event, options);
}
