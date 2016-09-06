import xs, { Stream } from 'xstream';
import { DOMSource, VNode, VNodeData } from '@cycle/dom';

export interface SortableOptions
{
    restrictMovementArea? : string; //has to be a selector
    handle? : string; //has to be a selector
    ghostClass? : string;
}

interface Dimensions
{
    xmin : number;
    ymin : number;
    xmax : number;
    ymax : number;
}

export type Event = [any, number, string];
export type Transform = (s : Stream<VNode>) => Stream<VNode>;
export type EventHandler =
    (i : number, event : any, node : VNode, options? : SortableOptions) => VNode;

const itemClassName : string = 'x-sortable-item';
const itemSelector : string = '.' + itemClassName;

export function makeSortable(dom : DOMSource, options? : SortableOptions) : Transform
{
    return function(sortable : Stream<VNode>) : Stream<VNode>
    {
        return sortable
        .map(node => {
            const processedNode : VNode = Object.assign({}, node, {
                    children: !node.children ? [] : node.children
                        .map(c => addClassName(c, itemClassName))
                        .map((c, i) => Object.assign(c, { key: i }))
                });

            const items : DOMSource = dom.select(itemSelector);
            const handles : DOMSource = options && options.handle ?
                dom.select(options.handle) : undefined;

            const mousedown$ : Stream<Event> =
                getEventStream(handles ? handles : items, 'mousedown');
            const noselect$ : Stream<Event> = mousedown$
                .mapTo(getEventNameStream(dom.select('body'), 'mousedown', 'noselect'))
                .flatten()
                .map(arr => {
                    const style : string = '-webkit-user-select: none; -moz-user-select: none;' +
                        ' -ms-user-select: none; user-select: none; overflow: hidden;';
                    let body : any = findParent(arr[0].target, 'body').setAttribute('style', style);
                    return arr;
                });
            const mouseup$ : Stream<Event> = mousedown$
                .mapTo(getEventNameStream(dom.select('body'), 'mouseup'))
                .flatten();
            const select$ : Stream<Event> = mousedown$
                .mapTo(getEventNameStream(dom.select('body'), 'mouseup', 'select'))
                .flatten()
                .map(arr => {
                    findParent(arr[0].target, 'body').removeAttribute('style'); //TODO: Better
                    return arr;
                });

            const mousemove$ : Stream<Event> = getEventNameStream(dom.select('body'), 'mousemove')
                .compose(emitBetween(mousedown$, mouseup$));

            const sortableEvent$ : Stream<Event> = xs.merge(
                mousedown$, mouseup$, mousemove$, noselect$, select$
            );

            return sortableEvent$
                .fold((acc, curr) => applyEvent(curr, acc, options), processedNode);
        })
        .flatten();
    };
}

export function emitBetween(start$ : Stream<any>, end$ : Stream<any>)
    : (s : Stream<any>) => Stream<any>
{
    return s => xs.combine(s, start$.startWith(undefined), end$.startWith(undefined))
        .fold((acc, curr) => {
            const startChanged : boolean = curr[1] !== acc[2];
            const endChanged : boolean = curr[2] !== acc[3];
            const shouldEmit : boolean = startChanged ? true
                : (endChanged ? false : acc[0]);
            return [shouldEmit, curr[0], curr[1], curr[2]];
        }, [false, undefined, undefined, undefined])
        .filter(arr => arr[0])
        .map(arr => arr[1]);
}

const transformMouseUp : EventHandler = (index, event, node, options) => {
    return Object.assign({}, node, {
            children: node.children
                .filter(c => !hasClassName(c, 'x-ghost'))
                .map(c => removeAttribute(
                    removeAttribute(removeAttribute(c, 'style'), 'data-dimensions'), 'data-index')
                )
        });
};

const transformMouseMove : EventHandler = (index, event, node, options) => {
        const ghost : VNode = node.children[node.children.length - 1];
        const mouseOffset : any = JSON.parse(ghost.data.attrs['data-mouseoffset']);
        const style : string = ghost.data.attrs.style;

        const scrollOffset : number = findParent(event.target, 'body').scrollTop;

        const restriction : any = options && options.restrictMovementArea ?
            JSON.parse(ghost.data.attrs['data-restriction'])
            : undefined;

        const dimensions : any = JSON.parse(ghost.data.attrs['data-dimensions']);

        const x : number = event.clientX + mouseOffset.x;
        const y : number = event.clientY + mouseOffset.y;
        const newX : number = restriction ?
            (x < restriction.xmin ? restriction.xmin
                : x + dimensions.width > restriction.xmax ?
                restriction.xmax - dimensions.width : x)
            : x;
        const newY : number = (restriction ?
            (y < restriction.ymin ? restriction.ymin + scrollOffset
                : y + dimensions.height > restriction.ymax ?
                restriction.ymax - dimensions.height + scrollOffset : y + scrollOffset)
            : y + scrollOffset);

        const newXMax : number = newX + dimensions.width;
        const newYMax : number = newY + dimensions.height;

        const newStyle : string = style.substring(0, style.indexOf('top: '))
            + 'top: ' + newY + 'px; left: '
            + newX + 'px;';

        const ghostDimensions : Dimensions = {
            xmin: newX, ymin: newY - scrollOffset, xmax: newXMax, ymax: newYMax - scrollOffset
        };

        const swapElement : VNode = (node.children as VNode[])
            .slice(0, node.children.length - 1)
            .reduce((acc, curr) => {
                const itemDimensions : Dimensions = JSON.parse(curr.data.attrs['data-dimensions']);
                const accDimensions : any = JSON.parse(acc.data.attrs['data-dimensions']);
                const area : number = getIntersectionArea(itemDimensions, ghostDimensions);
                if (area < 0) { return acc; }
                return area > getIntersectionArea(accDimensions, ghostDimensions) ? curr : acc;
            });
        const swapDimensions : Dimensions = JSON.parse(swapElement.data.attrs['data-dimensions']);
        const ghostIndex : number = ghost.data.attrs['data-index'];
        const swapIndex : number = swapElement.data.attrs['data-index'];

        const swap : boolean = getIntersectionArea(swapDimensions, ghostDimensions)
            >= 0.66 * getArea(swapDimensions) && swapIndex !== ghostIndex;

        const i : number = swap ? (swapIndex > ghostIndex ? ghostIndex : swapIndex) : -1;

        const swappedChildren : VNode[] = i !== -1 ? [
            ...node.children.slice(0, i),
            addAttributes(node.children[i + 1], {
                'data-index': (node.children[i] as VNode).data.attrs['data-index'],
                'data-dimensions': (node.children[i] as VNode).data.attrs['data-dimensions']
            }),
            addAttributes(node.children[i], {
                'data-index': (node.children[i + 1] as VNode).data.attrs['data-index'],
                'data-dimensions': (node.children[i + 1] as VNode).data.attrs['data-dimensions']
            }),
            ...node.children.slice(i + 2, node.children.length - 1),
            addAttributes(ghost, {
                'data-index': swap ? swapIndex : ghostIndex,
                'style': newStyle
            })
        ] : applyToNthChild(
                node.children, node.children.length - 1, c => addAttributes(c, {
                    style: newStyle
                }));

        return Object.assign({}, node, { children: swappedChildren });
};

const transformMouseDown : EventHandler = (index, event, node, options) => {
    const itemClientRect : ClientRect = findParent(event.target, itemSelector)
        .getBoundingClientRect();

    const scrollOffset : number = findParent(event.target, 'body').scrollTop;

    const mouseOffset : any = {
        x: itemClientRect.left - event.clientX,
        y: itemClientRect.top - event.clientY
    };

    const restriction : ClientRect = options && options.restrictMovementArea ?
        findParent(event.target, options.restrictMovementArea).getBoundingClientRect() : undefined;

    const restrictionObj : Dimensions = !restriction ? undefined : {
        xmin: restriction.left,
        xmax: restriction.left + restriction.width,
        ymin: restriction.top,
        ymax: restriction.top + restriction.height
    };

    const dimensions : any = {
        xmin: itemClientRect.left,
        xmax: itemClientRect.left + itemClientRect.width,
        ymin: itemClientRect.top,
        ymax: itemClientRect.top + itemClientRect.height,
        width: itemClientRect.width,
        height: itemClientRect.height
    };

    const attrs : any = {
        'data-mouseoffset': JSON.stringify(mouseOffset),
        'data-restriction': JSON.stringify(restrictionObj),
        'data-dimensions': JSON.stringify(dimensions),
        'data-originalIndex': index,
        'style': 'z-index: 5; margin: 0; pointer-events: none; position: absolute; width: '
            + itemClientRect.width + 'px; ' + 'height: ' + itemClientRect.height + 'px; top: '
            + (event.clientY + mouseOffset.y + scrollOffset) + 'px; left: '
            + (event.clientX + mouseOffset.x) + 'px;'
    };

    const dragging : any = { style: 'opacity: 0;' };
    const className : string = (options && options.ghostClass ? options.ghostClass + ' ' : '')
        + 'x-ghost';

    const sortable : any = findParent(event.target, itemSelector).parentNode;
    const items : any[] = [].slice.call(sortable.children);

    const itemDimensions : Dimensions[] = items
        .map(i => i.getBoundingClientRect())
        .map(r => ({
            xmin: r.left,
            ymin: r.top,
            xmax: r.left + r.width,
            ymax: r.top + r.height
        }));

    const withDimensions : VNode[] = node.children
        .map((c, i) => addAttributes(c, {
            'data-dimensions': JSON.stringify(itemDimensions[i]),
            'data-index': i
        }));

    return Object.assign({}, node, {
        children: [
            ...applyToNthChild(withDimensions, index, c => addAttributes(c, dragging)),
            addAttributes(addClassName(withDimensions[index], className), attrs)
        ]
    });
};

function applyEvent(event : Event, node : VNode, options? : SortableOptions) : VNode
{
    const mapping : { [key : string]: EventHandler } = {
        'mousedown': transformMouseDown,
        'mouseup': transformMouseUp,
        'mousemove': transformMouseMove
    };

    return mapping[event[2]] ? mapping[event[2]](event[1], event[0], node, options) : node;
}

function getEventStream(items : DOMSource, eventName : string, customName? : string) : Stream<Event>
{
    return items
        .events(eventName)
        .map(ev => [ev, findParent(ev.target, itemSelector)]) //in case of handle go up to item
        .map(arr => [arr[0], getIndex(arr[1])])
        .map(arr => [arr[0], arr[1], customName ? customName : eventName]);
}

function getEventNameStream(items : DOMSource, eventName : string, customName? : string)
    : Stream<Event>
{
    return items
        .events(eventName)
        .map(ev => [ev, NaN, customName ? customName : eventName]);
}

function getArea(d : Dimensions) : number
{
    return (d.xmax - d.xmin) * (d.ymax - d.ymin);
}

function getIntersectionArea(a : Dimensions, b : Dimensions) : number
{
    const intersection : Dimensions = {
        xmin: Math.max(a.xmin, b.xmin),
        ymin: Math.max(a.ymin, b.ymin),
        xmax: Math.min(a.xmax, b.xmax),
        ymax: Math.min(a.ymax, b.ymax)
    };
    if (intersection.xmin >= intersection.xmax || intersection.ymin >= intersection.ymax) {
        return -1;
    }
    return getArea(intersection);
}

function applyToNthChild(children : VNode[], index : number, fn : (e : VNode) => VNode) : VNode[]
{
    return [...children.slice(0, index), fn(children[index]), ...children.slice(index + 1)];
}

function addAttributes(e : VNode, newAttr : { [attr : string]: any }) : VNode
{
    const addition : any = { attrs: Object.assign({}, e.data ? e.data.attrs : undefined, newAttr) };
    return addToData(e, addition);
}

function removeAttribute(node : VNode, attributeName : string) : VNode
{
    if (!node.data || !node.data.attrs) { return node; }
    return Object.assign({}, node, {
        data: Object.assign({}, node.data, {
            attrs: Object.keys(node.data.attrs)
                .filter(k => k !== attributeName)
                .map(k => ({ [k]: node.data.attrs[k] }))
                .reduce((acc, curr) => Object.assign(acc, curr), {})
        })
    });
}

function findParent(node : any, selector : string) : any
{
    if ((node.matches || node.matchesSelector).call(node, selector)) {
        return node;
    }
    return findParent(node.parentNode, selector);
}

function addClassName(node : VNode, className : string) : VNode
{
    const hasClass : boolean = hasClassNameProperty(node);
    const addition : any = {
        props: {
            className: (hasClass ? node.data.props.className + ' ' : '') + className
        }
    };

    return addToData(node, addition);
}

function hasClassName(node : VNode, className : string) : boolean
{
    return hasClassNameProperty(node) && node.data.props.className.indexOf(className) !== -1;
}

function hasClassNameProperty(node : VNode) : boolean
{
    return node.data && node.data.props && node.data.props.className;
}

function addToData(node : VNode, addition : { [key : string]: any }) : VNode
{
    const hasData : boolean = node.data !== undefined;
    const key : string = Object.keys(addition)[0];
    const a : any = Object.assign({}, hasData ? { [key]: node.data[key] } : {}, addition);
    const data : VNodeData = Object.assign({}, node.data, a);

    return Object.assign({}, node, {
        data: data
    });
}

export function getIndex(node : any) : number
{
    return Array.prototype.indexOf.call(node.parentNode.children, node);
}
