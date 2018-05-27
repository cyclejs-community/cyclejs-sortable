import { VNode } from '@cycle/dom';

import { SortableOptions, UpdateOrder } from './makeSortable';

import { mousedownHandler } from './eventHandlers/mousedown';
import { mouseupHandler } from './eventHandlers/mouseup';
import { mousemoveHandler } from './eventHandlers/mousemove';

export function handleEvent(
    options: SortableOptions
): (data: [VNode, any], event: MouseEvent) => [VNode, UpdateOrder | undefined] {
    return function(data, event) {
        const eventHandlerMapping = {
            mousedown: mousedownHandler,
            touchstart: mousedownHandler,
            mouseleave: mouseupHandler,
            mouseup: mouseupHandler,
            touchend: mouseupHandler,
            mousemove: mousemoveHandler,
            touchmove: mousemoveHandler
        };
        return eventHandlerMapping[event.type](data[0], event, options);
    };
}
