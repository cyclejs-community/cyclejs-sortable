import { VNode } from '@cycle/dom';

import { SortableOptions } from './makeSortable';

import { mousedownHandler } from './eventHandlers/mousedown';
import { mouseupHandler } from './eventHandlers/mouseup';
import { mousemoveHandler } from './eventHandlers/mousemove';

export function handleEvent(
    options: SortableOptions
): (node: VNode, event: MouseEvent) => VNode {
    return function(node: VNode, event: MouseEvent): VNode {
        const eventHandlerMapping = {
            mousedown: mousedownHandler,
            touchstart: mousedownHandler,
            mouseleave: mouseupHandler,
            mouseup: mouseupHandler,
            touchend: mouseupHandler,
            mousemove: mousemoveHandler,
            touchmove: mousemoveHandler
        };
        return eventHandlerMapping[event.type](node, event, options);
    };
}
