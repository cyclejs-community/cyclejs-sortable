(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == 'function' && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw ((f.code = 'MODULE_NOT_FOUND'), f);
            }
            var l = (n[o] = { exports: {} });
            t[o][0].call(
                l.exports,
                function(e) {
                    var n = t[o][1][e];
                    return s(n ? n : e);
                },
                l,
                l.exports,
                e,
                t,
                n,
                r
            );
        }
        return n[o].exports;
    }
    var i = typeof require == 'function' && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s;
})(
    {
        1: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                const xstream_1 = require('xstream');
                const run_1 = require('@cycle/run');
                const dom_1 = require('@cycle/dom');
                const makeSortable_1 = require('../../../src/makeSortable');
                function main({ DOM }) {
                    const sortable$ = xstream_1.default
                        .of(
                            dom_1.ul('.ul', [
                                dom_1.li('.li', '', ['Option 1']),
                                dom_1.li('.li', '', ['Option 2']),
                                dom_1.li('.li', '', ['Option 3']),
                                dom_1.li('.li', '', ['Option 4']),
                                dom_1.li('.li', '', ['Option 5']),
                                dom_1.li('.li', '', ['Option 6'])
                            ])
                        )
                        .compose(makeSortable_1.makeSortable(DOM));
                    const update$ = makeSortable_1
                        .getUpdateEvent(DOM, '.ul')
                        .map(
                            o =>
                                'You changed item Number ' +
                                (o.oldIndex + 1) +
                                ' to postion ' +
                                (o.newIndex + 1)
                        )
                        .startWith('You havent changed anything yet')
                        .map(s => dom_1.span('.span', s));
                    const vdom$ = xstream_1.default
                        .combine(sortable$, update$)
                        .map(arr => dom_1.div([arr[0], arr[1]]));
                    return {
                        DOM: vdom$
                    };
                }
                run_1.run(main, {
                    DOM: dom_1.makeDOMDriver('#app')
                });
            },
            {
                '../../../src/makeSortable': 7,
                '@cycle/dom': 18,
                '@cycle/run': 29,
                xstream: 146
            }
        ],
        2: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                const mousedown_1 = require('./eventHandlers/mousedown');
                const mouseup_1 = require('./eventHandlers/mouseup');
                const mousemove_1 = require('./eventHandlers/mousemove');
                /**
 * Uses the event.type property to forward the event to the right handler
 * @param {VNode} the root VNode of the DOMSource
 * @param {MouseEvent} event the event that should be handled
 * @param {SortableOptions} options a valid SortableOptions object, it and its properties have to be defined
 * @return {VNode} The new root VNode
 */
                function handleEvent(node, event, options) {
                    const eventHandlerMapping = {
                        mousedown: mousedown_1.mousedownHandler,
                        mouseup: mouseup_1.mouseupHandler,
                        mouseleave: mouseup_1.mouseupHandler,
                        mousemove: mousemove_1.mousemoveHandler,
                        touchstart: mousedown_1.mousedownHandler,
                        touchend: mouseup_1.mouseupHandler,
                        touchmove: mousemove_1.mousemoveHandler
                    };
                    return eventHandlerMapping[event.type](
                        node,
                        event,
                        options
                    );
                }
                exports.handleEvent = handleEvent;
            },
            {
                './eventHandlers/mousedown': 3,
                './eventHandlers/mousemove': 4,
                './eventHandlers/mouseup': 5
            }
        ],
        3: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                const snabbdom_selector_1 = require('snabbdom-selector');
                const helpers_1 = require('../helpers');
                /**
 * Used to create the ghost and hide the item dragged
 * @type {EventHandler}
 */
                exports.mousedownHandler = (node, event, options) => {
                    const item = helpers_1.findParent(
                        event.target,
                        options.parentSelector + ' > *'
                    );
                    const itemRect = item.getBoundingClientRect();
                    const parentNode = item.parentElement;
                    const parentRect = parentNode.getBoundingClientRect();
                    const mouseOffset = {
                        x: itemRect.left - event.clientX,
                        y: itemRect.top - event.clientY,
                        itemLeft: itemRect.left,
                        itemTop: itemRect.top,
                        parentLeft: parentRect.left,
                        parentTop: parentRect.top
                    };
                    const body = helpers_1.findParent(event.target, 'body');
                    body.setAttribute('style', helpers_1.getBodyStyle());
                    const parent = snabbdom_selector_1.select(
                        options.parentSelector,
                        node
                    )[0];
                    const index = helpers_1.getIndex(item);
                    const ghostAttrs = {
                        'data-mouseoffset': JSON.stringify(mouseOffset),
                        'data-itemdimensions': JSON.stringify({
                            width: itemRect.width,
                            height: itemRect.height
                        }),
                        'data-itemindex': index.toString(),
                        'data-originalIndex': index.toString(),
                        style: helpers_1.getGhostStyle(mouseOffset, item)
                    };
                    const items = parent.children;
                    const children = [
                        ...items.slice(0, index),
                        helpers_1.addAttributes(items[index], {
                            style: 'opacity: 0;'
                        }),
                        ...items.slice(index + 1),
                        helpers_1.addGhostClass(
                            helpers_1.addAttributes(
                                Object.assign({}, items[index], {
                                    elm: undefined
                                }),
                                ghostAttrs
                            ),
                            options.ghostClass
                        )
                    ].map((c, i) =>
                        helpers_1.addAttributes(c, { 'data-index': i })
                    );
                    return helpers_1.replaceNode(
                        node,
                        options.parentSelector,
                        Object.assign({}, parent, { children })
                    );
                };
            },
            { '../helpers': 6, 'snabbdom-selector': 123 }
        ],
        4: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                const snabbdom_selector_1 = require('snabbdom-selector');
                const helpers_1 = require('../helpers');
                /**
 * Used to adjust the position of the ghost and swap the items if needed
 * @type {EventHandler}
 */
                exports.mousemoveHandler = (node, event, options) => {
                    const parent = snabbdom_selector_1.select(
                        options.parentSelector,
                        node
                    )[0];
                    const ghost = parent.children[parent.children.length - 1];
                    // Hack for now.  Immediately after the mouse down event if the mousemove
                    // handler gets called (as in the pointer gets moved very quickly) the ghost
                    // VNode may not have been attached to the element yet causing ghost.elm to
                    // be undefined, in which case we just return the node unchanged
                    if (!ghost.elm) {
                        return node;
                    }
                    const mouseOffset = JSON.parse(
                        ghost.data.attrs['data-mouseoffset']
                    );
                    const itemIndex = parseInt(
                        ghost.data.attrs['data-itemindex']
                    );
                    const item = parent.children[itemIndex];
                    const itemIntersection = helpers_1.getArea(
                        helpers_1.getIntersection(item.elm, ghost.elm)
                    );
                    const itemArea = helpers_1.getArea(
                        helpers_1.getIntersection(item.elm, item.elm)
                    );
                    const intersectionAreas = parent.children
                        .slice(0, -1)
                        .map(c => c.elm)
                        .map(e => helpers_1.getIntersection(e, ghost.elm))
                        .map((e, i) => [helpers_1.getArea(e), i]);
                    const maxIntersection = intersectionAreas.reduce(
                        (acc, curr) => (curr[0] > acc[0] ? curr : acc)
                    );
                    const maxElement = parent.children[maxIntersection[1]].elm;
                    const maxArea = helpers_1.getArea(
                        helpers_1.getIntersection(maxElement, maxElement)
                    );
                    const newIndex =
                        maxIntersection[1] === itemIndex
                            ? itemIndex
                            : -itemIntersection > maxArea - itemArea
                              ? maxIntersection[1]
                              : itemIndex;
                    const ghostAttrs = {
                        style: helpers_1.updateGhostStyle(
                            event,
                            mouseOffset,
                            ghost.elm
                        ),
                        'data-itemindex': newIndex.toString()
                    };
                    const filteredChildren = parent.children
                        .filter((e, i) => i !== itemIndex)
                        .slice(0, -1);
                    const newChildren = [
                        ...filteredChildren.slice(0, newIndex),
                        parent.children[itemIndex],
                        ...filteredChildren.slice(
                            newIndex,
                            filteredChildren.length
                        )
                    ];
                    return helpers_1.replaceNode(
                        node,
                        options.parentSelector,
                        Object.assign({}, parent, {
                            children: [
                                ...newChildren,
                                helpers_1.addAttributes(ghost, ghostAttrs)
                            ]
                        })
                    );
                };
            },
            { '../helpers': 6, 'snabbdom-selector': 123 }
        ],
        5: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                const snabbdom_selector_1 = require('snabbdom-selector');
                const helpers_1 = require('../helpers');
                /**
 * Used to remove the ghost element
 * @type {EventHandler}
 */
                exports.mouseupHandler = (node, event, options) => {
                    const parent = snabbdom_selector_1.select(
                        options.parentSelector,
                        node
                    )[0];
                    const items = parent.children;
                    const ghost = items[items.length - 1];
                    if (!parent || !ghost) {
                        return node;
                    }
                    const itemIndex = parseInt(
                        ghost.data.attrs['data-itemindex']
                    );
                    const body = helpers_1.findParent(event.target, 'body');
                    body.removeAttribute('style');
                    const newItems = [
                        ...items.slice(0, itemIndex),
                        helpers_1.removeAttribute(items[itemIndex], 'style'),
                        ...items.slice(itemIndex + 1, -1)
                    ];
                    const indexes = newItems
                        .map(c => c.data.attrs['data-index'])
                        .map(s => parseInt(s));
                    const tuple = [
                        parseInt(ghost.data.attrs['data-originalIndex']),
                        parseInt(ghost.data.attrs['data-itemindex'])
                    ];
                    if (tuple[0] !== tuple[1]) {
                        const customEvent = new CustomEvent('updateOrder', {
                            bubbles: true,
                            detail: {
                                newOrder: indexes,
                                oldIndex: tuple[0],
                                newIndex: tuple[1]
                            }
                        });
                        parent.elm.dispatchEvent(customEvent);
                    }
                    const children = newItems.map(c =>
                        helpers_1.removeAttribute(c, 'data-index')
                    );
                    return helpers_1.replaceNode(
                        node,
                        options.parentSelector,
                        Object.assign({}, parent, { children })
                    );
                };
            },
            { '../helpers': 6, 'snabbdom-selector': 123 }
        ],
        6: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                const snabbdom_selector_1 = require('snabbdom-selector');
                /**
 * Takes the maybe undefined options and fills them with defaults
 * @param {SortableOptions} options the options, can be undefined
 * @param {VNode} the root VNode of the DOMSource
 * @return {SortableOptions} the non-null options filled with default
 */
                function applyDefaults(options, root) {
                    const firstClass = node =>
                        '.' +
                        snabbdom_selector_1
                            .classNameFromVNode(node.children[0])
                            .split(' ')[0];
                    const itemSelector = options.handle
                        ? ''
                        : options.parentSelector
                          ? firstClass(
                                snabbdom_selector_1.select(
                                    options.parentSelector,
                                    root
                                )[0]
                            )
                          : firstClass(root);
                    return {
                        parentSelector:
                            options.parentSelector ||
                            '.' +
                                snabbdom_selector_1
                                    .classNameFromVNode(root)
                                    .split(' ')
                                    .join('.'),
                        handle: options.handle || itemSelector,
                        ghostClass: options.ghostClass || '',
                        selectionDelay: options.selectionDelay || 0
                    };
                }
                exports.applyDefaults = applyDefaults;
                /**
 * Adds keys to the VNodes to make them able to swap
 * @param {VNode} node the root VNode
 * @param {key} can be used to specify a inital key
 * @return {VNode} a new VNode with the keys
 */
                function addKeys(node, key = Math.random().toString()) {
                    if (!node.children) {
                        return Object.assign({}, node, {
                            key: node.key ? node.key : key
                        });
                    }
                    const children = node.children.map((c, i) =>
                        addKeys(c, key + '-' + i)
                    );
                    return Object.assign({}, node, {
                        key: node.key ? node.key : key,
                        children
                    });
                }
                exports.addKeys = addKeys;
                /**
 * Returns a parent VNode that has a children matching the selector.
 * Currently only works with simple class selector
 * @param {VNode} root the parent VNode
 * @param {string} selector a valid CSS selector
 * @return {VNode} The searched parent node or undefined if none was found
 */
                function getParentNode(root, selector) {
                    if (root.children === undefined) {
                        return undefined;
                    }
                    const childMatch = root.children.reduce(
                        (acc, curr) =>
                            !acc &&
                            snabbdom_selector_1.select(selector, curr)[0] ===
                                curr
                                ? true
                                : false,
                        false
                    );
                    if (childMatch) {
                        return root;
                    }
                    return root.children
                        .map(
                            e =>
                                typeof e !== 'object'
                                    ? undefined
                                    : getParentNode(e, selector)
                        )
                        .reduce(
                            (acc, curr) => (!acc && curr ? curr : acc),
                            undefined
                        );
                }
                exports.getParentNode = getParentNode;
                /**
 * Replaces the node matching the selector with the replacement
 * @param {VNode} root the root VNode
 * @param {string} selector a valid CSS selector for the replacement
 * @param {VNode} replacement the new VNode
 * @return {VNode} a new root VNode with the replacement applied
 */
                function replaceNode(root, selector, replacement) {
                    if (
                        snabbdom_selector_1.select(selector, root)[0] === root
                    ) {
                        return replacement;
                    }
                    if (!root.children) {
                        return root;
                    }
                    const children = root.children.map(e =>
                        replaceNode(e, selector, replacement)
                    );
                    return Object.assign({}, root, { children });
                }
                exports.replaceNode = replaceNode;
                /**
 * Returns the index of the element in the parent's children array
 * @param {Element} e the child element
 * @return {number} the index
 */
                function getIndex(node) {
                    return Array.prototype.indexOf.call(
                        node.parentNode.children,
                        node
                    );
                }
                exports.getIndex = getIndex;
                /**
 * Gets the correct style attribute value for the given parameters
 * @param {StartPositionOffset} event the mouse event that was triggered, enriched with distance information
 * @param {MouseOffset} mouseOffset the offset of the item
 * @param {ClientRect} itemRect the bounding client rect of the item
 * @return {string} the style value
 */
                function getGhostStyle(mouseOffset, item) {
                    const itemRect = item.getBoundingClientRect();
                    return (
                        'z-index: 5; margin: 0; pointer-events: none; position: absolute; ' +
                        'width: ' +
                        itemRect.width +
                        'px; ' +
                        'height: ' +
                        itemRect.height +
                        'px; ' +
                        'top: ' +
                        (mouseOffset.itemTop - mouseOffset.parentTop) +
                        'px; ' +
                        'left: ' +
                        (mouseOffset.itemLeft - mouseOffset.parentLeft) +
                        'px;'
                    );
                }
                exports.getGhostStyle = getGhostStyle;
                /**
 * Returns the updated style for this ghost element
 */
                function updateGhostStyle(event, mouseOffset, ghost) {
                    const prevStyle = ghost.getAttribute('style');
                    return (
                        prevStyle.substring(0, prevStyle.indexOf(' top:')) +
                        ' top: ' +
                        (mouseOffset.itemTop -
                            mouseOffset.parentTop +
                            event.distY) +
                        'px; left: ' +
                        (mouseOffset.itemLeft -
                            mouseOffset.parentLeft +
                            event.distX) +
                        'px;'
                    );
                }
                exports.updateGhostStyle = updateGhostStyle;
                /**
 * Prevents the page from randomly selecting text when dragging
 * @return {string} the content of the style attribute
 */
                function getBodyStyle() {
                    return (
                        '-webkit-user-select: none; -moz-user-select: none;' +
                        ' -ms-user-select: none; user-select: none; overflow: hidden;'
                    );
                }
                exports.getBodyStyle = getBodyStyle;
                /**
 * Finds the parent element that matches the given selector
 * @param {Element} node the current element
 * @param {string} selector a valid CSS selector
 * @return {any} the searched parent or undefined if not found
 */
                function findParent(node, selector) {
                    if (
                        (node.matches || node.matchesSelector).call(
                            node,
                            'html'
                        )
                    ) {
                        return undefined;
                    }
                    if (
                        (node.matches || node.matchesSelector).call(
                            node,
                            selector
                        )
                    ) {
                        return node;
                    }
                    return findParent(node.parentNode, selector);
                }
                exports.findParent = findParent;
                /**
 * Adds the given attribute safely to the VNode
 * @param {VNode} node the VNode to add the attributes on
 * @param {any} addition the new attributes
 * @return {VNode} the newly created VNode
 */
                function addAttributes(e, newAttr, ghostClass) {
                    const addition = {
                        attrs: Object.assign(
                            {},
                            e.data ? e.data.attrs : undefined,
                            newAttr
                        )
                    };
                    return addToData(e, addition);
                }
                exports.addAttributes = addAttributes;
                /**
 * Adds the given class safely to the VNode
 * @param {VNode} node the VNode to add the attributes on
 * @param {any} addition the css ghost class
 * @return {VNode} the newly created VNode
 */
                function addGhostClass(e, ghostClass) {
                    const className =
                        ghostClass && ghostClass.length > 1
                            ? ghostClass[0] === '.'
                              ? ghostClass.substring(1)
                              : ghostClass
                            : undefined;
                    const classVal = className
                        ? { [className]: true }
                        : undefined;
                    const addition = {
                        class: classVal
                    };
                    return addToData(e, addition);
                }
                exports.addGhostClass = addGhostClass;
                /**
 * Removes the given attribute from the VNode
 * @param {VNode} node the VNode
 * @param {string} attributeName the name of the attribute
 * @return {VNode} a new VNode without the attribute
 */
                function removeAttribute(node, attributeName) {
                    if (!node.data || !node.data.attrs) {
                        return node;
                    }
                    return Object.assign({}, node, {
                        data: Object.assign({}, node.data, {
                            attrs: Object.keys(node.data.attrs)
                                .filter(k => k !== attributeName)
                                .map(k => ({ [k]: node.data.attrs[k] }))
                                .reduce(
                                    (acc, curr) => Object.assign(acc, curr),
                                    {}
                                )
                        })
                    });
                }
                exports.removeAttribute = removeAttribute;
                /**
 * Adds the given additions safely to the VNode
 * @param {VNode} node the VNode to add the additions on
 * @param {any} addition the new additions
 * @return {VNode} the newly created VNode
 */
                function addToData(node, additions) {
                    const hasData = node.data !== undefined;
                    const key = Object.keys(additions)[0];
                    const a = Object.assign(
                        {},
                        hasData ? { [key]: node.data[key] } : {},
                        additions
                    );
                    const data = Object.assign({}, node.data, a);
                    return Object.assign({}, node, {
                        data: data
                    });
                }
                exports.addToData = addToData;
                /**
 * Calculates the intersection of two elements
 * @param {Element} e1 the first element
 * @param {Element} e2 the first element
 * @return {Intersection} the intersection or undefined if there is no intersecton
 */
                function getIntersection(e1, e2) {
                    const c1 = e1.getBoundingClientRect();
                    const c2 = e2.getBoundingClientRect();
                    const intersection = {
                        xmin: Math.max(c1.left, c2.left),
                        ymin: Math.max(c1.top, c2.top),
                        xmax: Math.min(c1.right, c2.right),
                        ymax: Math.min(c1.bottom, c2.bottom)
                    };
                    return intersection;
                }
                exports.getIntersection = getIntersection;
                /**
 * Calculates the area of the given rectangle
 */
                function getArea(intersection) {
                    return (
                        (intersection.xmax - intersection.xmin) *
                        (intersection.ymax - intersection.ymin)
                    );
                }
                exports.getArea = getArea;
            },
            { 'snabbdom-selector': 123 }
        ],
        7: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                const xstream_1 = require('xstream');
                const delay_1 = require('xstream/extra/delay');
                const adapt_1 = require('@cycle/run/lib/adapt');
                const helpers_1 = require('./helpers');
                const eventHandlers_1 = require('./eventHandlers');
                function augmentEvent(ev) {
                    const touch = ev.touches[0];
                    ev.clientX = touch.clientX;
                    ev.clientY = touch.clientY;
                    return ev;
                }
                function augmentStartDistance(ev, startX, startY) {
                    ev.distX = ev.clientX - startX;
                    ev.distY = ev.clientY - startY;
                    return ev;
                }
                function moreThanOneChild(node) {
                    return !node.children || node.children.length > 1;
                }
                function notMoreThanOneChild(node) {
                    return !moreThanOneChild(node);
                }
                /**
 * Can be composed with a Stream of VNodes to make them sortable via drag&drop
 * @param {DOMSource} dom The preselected root VNode of the sortable, also indicates the area in which the ghost can be dragged
 * @param {SortableOptions} options  @see {SortableOptions}
 * @return {Transform<VNode, VNode>} A function to be composed with a view VNode stream
 */
                function makeSortable(dom, options) {
                    return sortable => {
                        const dom$ = xstream_1.default
                            .fromObservable(sortable)
                            .remember();
                        const moreThanOneChild$ = dom$.filter(moreThanOneChild);
                        const notMoreThanOneChild$ = dom$.filter(
                            notMoreThanOneChild
                        );
                        const out$ = xstream_1.default.merge(
                            notMoreThanOneChild$,
                            moreThanOneChild$
                                .map(helpers_1.addKeys)
                                .map(node => {
                                    const defaults = helpers_1.applyDefaults(
                                        options || {},
                                        node
                                    );
                                    const down$ = xstream_1.default.merge(
                                        xstream_1.default.fromObservable(
                                            dom
                                                .select(defaults.handle)
                                                .events('mousedown')
                                        ),
                                        xstream_1.default
                                            .fromObservable(
                                                dom
                                                    .select(defaults.handle)
                                                    .events('touchstart')
                                            )
                                            .map(augmentEvent)
                                    );
                                    const up$ = xstream_1.default.merge(
                                        xstream_1.default.fromObservable(
                                            dom
                                                .select('body')
                                                .events('mouseleave')
                                        ),
                                        xstream_1.default.fromObservable(
                                            dom.select('body').events('mouseup')
                                        ),
                                        xstream_1.default.fromObservable(
                                            dom
                                                .select(defaults.handle)
                                                .events('touchend')
                                        )
                                    );
                                    const move$ = xstream_1.default.merge(
                                        xstream_1.default.fromObservable(
                                            dom
                                                .select('body')
                                                .events('mousemove')
                                        ),
                                        xstream_1.default
                                            .fromObservable(
                                                dom
                                                    .select(defaults.handle)
                                                    .events('touchmove')
                                            )
                                            .map(augmentEvent)
                                    );
                                    const mousedown$ = down$
                                        .map(ev =>
                                            xstream_1.default
                                                .of(ev)
                                                .compose(
                                                    delay_1.default(
                                                        defaults.selectionDelay
                                                    )
                                                )
                                                .endWhen(
                                                    xstream_1.default.merge(
                                                        up$,
                                                        move$
                                                    )
                                                )
                                        )
                                        .flatten();
                                    const mouseup$ = mousedown$
                                        .map(_ => up$.take(1))
                                        .flatten();
                                    const mousemove$ = mousedown$
                                        .map(start => {
                                            return move$
                                                .map(ev =>
                                                    augmentStartDistance(
                                                        ev,
                                                        start.clientX,
                                                        start.clientY
                                                    )
                                                )
                                                .endWhen(mouseup$);
                                        })
                                        .flatten();
                                    const event$ = xstream_1.default.merge(
                                        mousedown$,
                                        mouseup$,
                                        mousemove$
                                    );
                                    return event$.fold(
                                        (acc, curr) =>
                                            eventHandlers_1.handleEvent(
                                                acc,
                                                curr,
                                                defaults
                                            ),
                                        node
                                    );
                                })
                                .flatten()
                        );
                        return adapt_1.adapt(out$);
                    };
                }
                exports.makeSortable = makeSortable;
                /**
 * Returns a stream of swapped indices
 * @param {DOMSource} dom a DOMSource containing the sortable
 * @param {string} parentSelector a valid CSS selector for the sortable parent (not the items)
 * @return {Stream<EventDetails>} an object containing the new positions @see EventDetails
 */
                function getUpdateEvent(dom, parentSelector) {
                    return adapt_1.adapt(
                        xstream_1.default
                            .fromObservable(
                                dom.select(parentSelector).events('updateOrder')
                            )
                            .compose(delay_1.default(10)) //Allow mouseup to execute properly
                            .map(ev => ev.detail)
                    );
                }
                exports.getUpdateEvent = getUpdateEvent;
            },
            {
                './eventHandlers': 2,
                './helpers': 6,
                '@cycle/run/lib/adapt': 28,
                xstream: 146,
                'xstream/extra/delay': 145
            }
        ],
        8: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                var xstream_1 = require('xstream');
                var adapt_1 = require('@cycle/run/lib/adapt');
                var fromEvent_1 = require('./fromEvent');
                var BodyDOMSource = (function() {
                    function BodyDOMSource(_name) {
                        this._name = _name;
                    }
                    BodyDOMSource.prototype.select = function(selector) {
                        // This functionality is still undefined/undecided.
                        return this;
                    };
                    BodyDOMSource.prototype.elements = function() {
                        var out = adapt_1.adapt(
                            xstream_1.default.of(document.body)
                        );
                        out._isCycleSource = this._name;
                        return out;
                    };
                    BodyDOMSource.prototype.events = function(
                        eventType,
                        options
                    ) {
                        if (options === void 0) {
                            options = {};
                        }
                        var stream;
                        stream = fromEvent_1.fromEvent(
                            document.body,
                            eventType,
                            options.useCapture,
                            options.preventDefault
                        );
                        var out = adapt_1.adapt(stream);
                        out._isCycleSource = this._name;
                        return out;
                    };
                    return BodyDOMSource;
                })();
                exports.BodyDOMSource = BodyDOMSource;
            },
            { './fromEvent': 16, '@cycle/run/lib/adapt': 28, xstream: 146 }
        ],
        9: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                var xstream_1 = require('xstream');
                var adapt_1 = require('@cycle/run/lib/adapt');
                var fromEvent_1 = require('./fromEvent');
                var DocumentDOMSource = (function() {
                    function DocumentDOMSource(_name) {
                        this._name = _name;
                    }
                    DocumentDOMSource.prototype.select = function(selector) {
                        // This functionality is still undefined/undecided.
                        return this;
                    };
                    DocumentDOMSource.prototype.elements = function() {
                        var out = adapt_1.adapt(xstream_1.default.of(document));
                        out._isCycleSource = this._name;
                        return out;
                    };
                    DocumentDOMSource.prototype.events = function(
                        eventType,
                        options
                    ) {
                        if (options === void 0) {
                            options = {};
                        }
                        var stream;
                        stream = fromEvent_1.fromEvent(
                            document,
                            eventType,
                            options.useCapture,
                            options.preventDefault
                        );
                        var out = adapt_1.adapt(stream);
                        out._isCycleSource = this._name;
                        return out;
                    };
                    return DocumentDOMSource;
                })();
                exports.DocumentDOMSource = DocumentDOMSource;
            },
            { './fromEvent': 16, '@cycle/run/lib/adapt': 28, xstream: 146 }
        ],
        10: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                var ScopeChecker_1 = require('./ScopeChecker');
                var utils_1 = require('./utils');
                var matchesSelector_1 = require('./matchesSelector');
                function toElArray(input) {
                    return Array.prototype.slice.call(input);
                }
                var ElementFinder = (function() {
                    function ElementFinder(namespace, isolateModule) {
                        this.namespace = namespace;
                        this.isolateModule = isolateModule;
                    }
                    ElementFinder.prototype.call = function(rootElement) {
                        var namespace = this.namespace;
                        var selector = utils_1.getSelectors(namespace);
                        if (!selector) {
                            return rootElement;
                        }
                        var fullScope = utils_1.getFullScope(namespace);
                        var scopeChecker = new ScopeChecker_1.ScopeChecker(
                            fullScope,
                            this.isolateModule
                        );
                        var topNode = fullScope
                            ? this.isolateModule.getElement(fullScope) ||
                              rootElement
                            : rootElement;
                        var topNodeMatchesSelector =
                            !!fullScope &&
                            !!selector &&
                            matchesSelector_1.matchesSelector(
                                topNode,
                                selector
                            );
                        return toElArray(topNode.querySelectorAll(selector))
                            .filter(
                                scopeChecker.isDirectlyInScope,
                                scopeChecker
                            )
                            .concat(topNodeMatchesSelector ? [topNode] : []);
                    };
                    return ElementFinder;
                })();
                exports.ElementFinder = ElementFinder;
            },
            { './ScopeChecker': 14, './matchesSelector': 21, './utils': 25 }
        ],
        11: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                var xstream_1 = require('xstream');
                var ScopeChecker_1 = require('./ScopeChecker');
                var utils_1 = require('./utils');
                var matchesSelector_1 = require('./matchesSelector');
                /**
 * Finds (with binary search) index of the destination that id equal to searchId
 * among the destinations in the given array.
 */
                function indexOf(arr, searchId) {
                    var minIndex = 0;
                    var maxIndex = arr.length - 1;
                    var currentIndex;
                    var current;
                    while (minIndex <= maxIndex) {
                        currentIndex = ((minIndex + maxIndex) / 2) | 0; // tslint:disable-line:no-bitwise
                        current = arr[currentIndex];
                        var currentId = current.id;
                        if (currentId < searchId) {
                            minIndex = currentIndex + 1;
                        } else if (currentId > searchId) {
                            maxIndex = currentIndex - 1;
                        } else {
                            return currentIndex;
                        }
                    }
                    return -1;
                }
                /**
 * Manages "Event delegation", by connecting an origin with multiple
 * destinations.
 *
 * Attaches a DOM event listener to the DOM element called the "origin",
 * and delegates events to "destinations", which are subjects as outputs
 * for the DOMSource. Simulates bubbling or capturing, with regards to
 * isolation boundaries too.
 */
                var EventDelegator = (function() {
                    function EventDelegator(
                        origin,
                        eventType,
                        useCapture,
                        isolateModule,
                        preventDefault
                    ) {
                        if (preventDefault === void 0) {
                            preventDefault = false;
                        }
                        var _this = this;
                        this.origin = origin;
                        this.eventType = eventType;
                        this.useCapture = useCapture;
                        this.isolateModule = isolateModule;
                        this.preventDefault = preventDefault;
                        this.destinations = [];
                        this._lastId = 0;
                        if (preventDefault) {
                            if (useCapture) {
                                this.listener = function(ev) {
                                    ev.preventDefault();
                                    _this.capture(ev);
                                };
                            } else {
                                this.listener = function(ev) {
                                    ev.preventDefault();
                                    _this.bubble(ev);
                                };
                            }
                        } else {
                            if (useCapture) {
                                this.listener = function(ev) {
                                    return _this.capture(ev);
                                };
                            } else {
                                this.listener = function(ev) {
                                    return _this.bubble(ev);
                                };
                            }
                        }
                        origin.addEventListener(
                            eventType,
                            this.listener,
                            useCapture
                        );
                    }
                    EventDelegator.prototype.updateOrigin = function(
                        newOrigin
                    ) {
                        this.origin.removeEventListener(
                            this.eventType,
                            this.listener,
                            this.useCapture
                        );
                        newOrigin.addEventListener(
                            this.eventType,
                            this.listener,
                            this.useCapture
                        );
                        this.origin = newOrigin;
                    };
                    /**
     * Creates a *new* destination given the namespace and returns the subject
     * representing the destination of events. Is not referentially transparent,
     * will always return a different output for the same input.
     */
                    EventDelegator.prototype.createDestination = function(
                        namespace
                    ) {
                        var _this = this;
                        var id = this._lastId++;
                        var selector = utils_1.getSelectors(namespace);
                        var scopeChecker = new ScopeChecker_1.ScopeChecker(
                            utils_1.getFullScope(namespace),
                            this.isolateModule
                        );
                        var subject = xstream_1.default.create({
                            start: function() {},
                            stop: function() {
                                if ('requestIdleCallback' in window) {
                                    requestIdleCallback(function() {
                                        _this.removeDestination(id);
                                    });
                                } else {
                                    _this.removeDestination(id);
                                }
                            }
                        });
                        var destination = {
                            id: id,
                            selector: selector,
                            scopeChecker: scopeChecker,
                            subject: subject
                        };
                        this.destinations.push(destination);
                        return subject;
                    };
                    /**
     * Removes the destination that has the given id.
     */
                    EventDelegator.prototype.removeDestination = function(id) {
                        var i = indexOf(this.destinations, id);
                        i >= 0 && this.destinations.splice(i, 1); // tslint:disable-line:no-unused-expression
                    };
                    EventDelegator.prototype.capture = function(ev) {
                        var n = this.destinations.length;
                        for (var i = 0; i < n; i++) {
                            var dest = this.destinations[i];
                            if (
                                matchesSelector_1.matchesSelector(
                                    ev.target,
                                    dest.selector
                                )
                            ) {
                                dest.subject._n(ev);
                            }
                        }
                    };
                    EventDelegator.prototype.bubble = function(rawEvent) {
                        var origin = this.origin;
                        if (!origin.contains(rawEvent.currentTarget)) {
                            return;
                        }
                        var roof = origin.parentElement;
                        var ev = this.patchEvent(rawEvent);
                        for (
                            var el = ev.target;
                            el && el !== roof;
                            el = el.parentElement
                        ) {
                            if (!origin.contains(el)) {
                                ev.stopPropagation();
                            }
                            if (ev.propagationHasBeenStopped) {
                                return;
                            }
                            this.matchEventAgainstDestinations(el, ev);
                        }
                    };
                    EventDelegator.prototype.patchEvent = function(event) {
                        var pEvent = event;
                        pEvent.propagationHasBeenStopped = false;
                        var oldStopPropagation = pEvent.stopPropagation;
                        pEvent.stopPropagation = function stopPropagation() {
                            oldStopPropagation.call(this);
                            this.propagationHasBeenStopped = true;
                        };
                        return pEvent;
                    };
                    EventDelegator.prototype.matchEventAgainstDestinations = function(
                        el,
                        ev
                    ) {
                        var n = this.destinations.length;
                        for (var i = 0; i < n; i++) {
                            var dest = this.destinations[i];
                            if (!dest.scopeChecker.isDirectlyInScope(el)) {
                                continue;
                            }
                            if (
                                matchesSelector_1.matchesSelector(
                                    el,
                                    dest.selector
                                )
                            ) {
                                this.mutateEventCurrentTarget(ev, el);
                                dest.subject._n(ev);
                            }
                        }
                    };
                    EventDelegator.prototype.mutateEventCurrentTarget = function(
                        event,
                        currentTargetElement
                    ) {
                        try {
                            Object.defineProperty(event, 'currentTarget', {
                                value: currentTargetElement,
                                configurable: true
                            });
                        } catch (err) {
                            console.log('please use event.ownerTarget');
                        }
                        event.ownerTarget = currentTargetElement;
                    };
                    return EventDelegator;
                })();
                exports.EventDelegator = EventDelegator;
            },
            {
                './ScopeChecker': 14,
                './matchesSelector': 21,
                './utils': 25,
                xstream: 146
            }
        ],
        12: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                var MapPolyfill = require('es6-map');
                var IsolateModule = (function() {
                    function IsolateModule() {
                        this.elementsByFullScope = new MapPolyfill();
                        this.delegatorsByFullScope = new MapPolyfill();
                        this.fullScopesBeingUpdated = [];
                        this.vnodesBeingRemoved = [];
                    }
                    IsolateModule.prototype.cleanupVNode = function(_a) {
                        var data = _a.data,
                            elm = _a.elm;
                        var fullScope = (data || {}).isolate || '';
                        var isCurrentElm =
                            this.elementsByFullScope.get(fullScope) === elm;
                        var isScopeBeingUpdated =
                            this.fullScopesBeingUpdated.indexOf(fullScope) >= 0;
                        if (fullScope && isCurrentElm && !isScopeBeingUpdated) {
                            this.elementsByFullScope.delete(fullScope);
                            this.delegatorsByFullScope.delete(fullScope);
                        }
                    };
                    IsolateModule.prototype.getElement = function(fullScope) {
                        return this.elementsByFullScope.get(fullScope);
                    };
                    IsolateModule.prototype.getFullScope = function(elm) {
                        var iterator = this.elementsByFullScope.entries();
                        for (
                            var result = iterator.next();
                            !!result.value;
                            result = iterator.next()
                        ) {
                            var _a = result.value,
                                fullScope = _a[0],
                                element = _a[1];
                            if (elm === element) {
                                return fullScope;
                            }
                        }
                        return '';
                    };
                    IsolateModule.prototype.addEventDelegator = function(
                        fullScope,
                        eventDelegator
                    ) {
                        var delegators = this.delegatorsByFullScope.get(
                            fullScope
                        );
                        if (!delegators) {
                            delegators = [];
                            this.delegatorsByFullScope.set(
                                fullScope,
                                delegators
                            );
                        }
                        delegators[delegators.length] = eventDelegator;
                    };
                    IsolateModule.prototype.reset = function() {
                        this.elementsByFullScope.clear();
                        this.delegatorsByFullScope.clear();
                        this.fullScopesBeingUpdated = [];
                    };
                    IsolateModule.prototype.createModule = function() {
                        var self = this;
                        return {
                            create: function(oldVNode, vNode) {
                                var _a = oldVNode.data,
                                    oldData = _a === void 0 ? {} : _a;
                                var elm = vNode.elm,
                                    _b = vNode.data,
                                    data = _b === void 0 ? {} : _b;
                                var oldFullScope = oldData.isolate || '';
                                var fullScope = data.isolate || '';
                                // Update data structures with the newly-created element
                                if (fullScope) {
                                    self.fullScopesBeingUpdated.push(fullScope);
                                    if (oldFullScope) {
                                        self.elementsByFullScope.delete(
                                            oldFullScope
                                        );
                                    }
                                    self.elementsByFullScope.set(
                                        fullScope,
                                        elm
                                    );
                                    // Update delegators for this scope
                                    var delegators = self.delegatorsByFullScope.get(
                                        fullScope
                                    );
                                    if (delegators) {
                                        var len = delegators.length;
                                        for (var i = 0; i < len; ++i) {
                                            delegators[i].updateOrigin(elm);
                                        }
                                    }
                                }
                                if (oldFullScope && !fullScope) {
                                    self.elementsByFullScope.delete(fullScope);
                                }
                            },
                            update: function(oldVNode, vNode) {
                                var _a = oldVNode.data,
                                    oldData = _a === void 0 ? {} : _a;
                                var elm = vNode.elm,
                                    _b = vNode.data,
                                    data = _b === void 0 ? {} : _b;
                                var oldFullScope = oldData.isolate || '';
                                var fullScope = data.isolate || '';
                                // Same element, but different scope, so update the data structures
                                if (fullScope && fullScope !== oldFullScope) {
                                    if (oldFullScope) {
                                        self.elementsByFullScope.delete(
                                            oldFullScope
                                        );
                                    }
                                    self.elementsByFullScope.set(
                                        fullScope,
                                        elm
                                    );
                                    var delegators = self.delegatorsByFullScope.get(
                                        oldFullScope
                                    );
                                    if (delegators) {
                                        self.delegatorsByFullScope.delete(
                                            oldFullScope
                                        );
                                        self.delegatorsByFullScope.set(
                                            fullScope,
                                            delegators
                                        );
                                    }
                                }
                                // Same element, but lost the scope, so update the data structures
                                if (oldFullScope && !fullScope) {
                                    self.elementsByFullScope.delete(
                                        oldFullScope
                                    );
                                    self.delegatorsByFullScope.delete(
                                        oldFullScope
                                    );
                                }
                            },
                            destroy: function(vNode) {
                                self.vnodesBeingRemoved.push(vNode);
                            },
                            remove: function(vNode, cb) {
                                self.vnodesBeingRemoved.push(vNode);
                                cb();
                            },
                            post: function() {
                                var vnodesBeingRemoved =
                                    self.vnodesBeingRemoved;
                                for (
                                    var i = vnodesBeingRemoved.length - 1;
                                    i >= 0;
                                    i--
                                ) {
                                    self.cleanupVNode(vnodesBeingRemoved[i]);
                                }
                                self.vnodesBeingRemoved = [];
                                self.fullScopesBeingUpdated = [];
                            }
                        };
                    };
                    return IsolateModule;
                })();
                exports.IsolateModule = IsolateModule;
            },
            { 'es6-map': 87 }
        ],
        13: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                var adapt_1 = require('@cycle/run/lib/adapt');
                var DocumentDOMSource_1 = require('./DocumentDOMSource');
                var BodyDOMSource_1 = require('./BodyDOMSource');
                var ElementFinder_1 = require('./ElementFinder');
                var fromEvent_1 = require('./fromEvent');
                var isolate_1 = require('./isolate');
                var EventDelegator_1 = require('./EventDelegator');
                var utils_1 = require('./utils');
                var eventTypesThatDontBubble = [
                    'blur',
                    'canplay',
                    'canplaythrough',
                    'change',
                    'durationchange',
                    'emptied',
                    'ended',
                    'focus',
                    'load',
                    'loadeddata',
                    'loadedmetadata',
                    'mouseenter',
                    'mouseleave',
                    'pause',
                    'play',
                    'playing',
                    'ratechange',
                    'reset',
                    'scroll',
                    'seeked',
                    'seeking',
                    'stalled',
                    'submit',
                    'suspend',
                    'timeupdate',
                    'unload',
                    'volumechange',
                    'waiting'
                ];
                function determineUseCapture(eventType, options) {
                    var result = false;
                    if (typeof options.useCapture === 'boolean') {
                        result = options.useCapture;
                    }
                    if (eventTypesThatDontBubble.indexOf(eventType) !== -1) {
                        result = true;
                    }
                    return result;
                }
                function filterBasedOnIsolation(domSource, fullScope) {
                    return function filterBasedOnIsolationOperator(
                        rootElement$
                    ) {
                        var initialState = {
                            wasIsolated: false,
                            shouldPass: false,
                            element: null
                        };
                        return rootElement$
                            .fold(function checkIfShouldPass(state, element) {
                                var isIsolated = !!domSource._isolateModule.getElement(
                                    fullScope
                                );
                                state.shouldPass =
                                    isIsolated && !state.wasIsolated;
                                state.wasIsolated = isIsolated;
                                state.element = element;
                                return state;
                            }, initialState)
                            .drop(1)
                            .filter(function(s) {
                                return s.shouldPass;
                            })
                            .map(function(s) {
                                return s.element;
                            });
                    };
                }
                var MainDOMSource = (function() {
                    function MainDOMSource(
                        _rootElement$,
                        _sanitation$,
                        _namespace,
                        _isolateModule,
                        _delegators,
                        _name
                    ) {
                        if (_namespace === void 0) {
                            _namespace = [];
                        }
                        var _this = this;
                        this._rootElement$ = _rootElement$;
                        this._sanitation$ = _sanitation$;
                        this._namespace = _namespace;
                        this._isolateModule = _isolateModule;
                        this._delegators = _delegators;
                        this._name = _name;
                        this.isolateSource = isolate_1.isolateSource;
                        this.isolateSink = function(sink, scope) {
                            if (scope === ':root') {
                                return sink;
                            } else if (utils_1.isClassOrId(scope)) {
                                return isolate_1.siblingIsolateSink(
                                    sink,
                                    scope
                                );
                            } else {
                                var prevFullScope = utils_1.getFullScope(
                                    _this._namespace
                                );
                                var nextFullScope = [prevFullScope, scope]
                                    .filter(function(x) {
                                        return !!x;
                                    })
                                    .join('-');
                                return isolate_1.totalIsolateSink(
                                    sink,
                                    nextFullScope
                                );
                            }
                        };
                    }
                    MainDOMSource.prototype.elements = function() {
                        var output$;
                        if (this._namespace.length === 0) {
                            output$ = this._rootElement$;
                        } else {
                            var elementFinder_1 = new ElementFinder_1.ElementFinder(
                                this._namespace,
                                this._isolateModule
                            );
                            output$ = this._rootElement$.map(function(el) {
                                return elementFinder_1.call(el);
                            });
                        }
                        var out = adapt_1.adapt(output$.remember());
                        out._isCycleSource = this._name;
                        return out;
                    };
                    Object.defineProperty(
                        MainDOMSource.prototype,
                        'namespace',
                        {
                            get: function() {
                                return this._namespace;
                            },
                            enumerable: true,
                            configurable: true
                        }
                    );
                    MainDOMSource.prototype.select = function(selector) {
                        if (typeof selector !== 'string') {
                            throw new Error(
                                "DOM driver's select() expects the argument to be a " +
                                    'string as a CSS selector'
                            );
                        }
                        if (selector === 'document') {
                            return new DocumentDOMSource_1.DocumentDOMSource(
                                this._name
                            );
                        }
                        if (selector === 'body') {
                            return new BodyDOMSource_1.BodyDOMSource(
                                this._name
                            );
                        }
                        var trimmedSelector = selector.trim();
                        var childNamespace =
                            trimmedSelector === ':root'
                                ? this._namespace
                                : this._namespace.concat(trimmedSelector);
                        return new MainDOMSource(
                            this._rootElement$,
                            this._sanitation$,
                            childNamespace,
                            this._isolateModule,
                            this._delegators,
                            this._name
                        );
                    };
                    MainDOMSource.prototype.events = function(
                        eventType,
                        options
                    ) {
                        if (options === void 0) {
                            options = {};
                        }
                        if (typeof eventType !== 'string') {
                            throw new Error(
                                "DOM driver's events() expects argument to be a " +
                                    'string representing the event type to listen for.'
                            );
                        }
                        var useCapture = determineUseCapture(
                            eventType,
                            options
                        );
                        var namespace = this._namespace;
                        var fullScope = utils_1.getFullScope(namespace);
                        var keyParts = [eventType, useCapture];
                        if (fullScope) {
                            keyParts.push(fullScope);
                        }
                        var key = keyParts.join('~');
                        var domSource = this;
                        var rootElement$;
                        if (fullScope) {
                            rootElement$ = this._rootElement$.compose(
                                filterBasedOnIsolation(domSource, fullScope)
                            );
                        } else {
                            rootElement$ = this._rootElement$.take(2);
                        }
                        var event$ = rootElement$
                            .map(function setupEventDelegatorOnTopElement(
                                rootElement
                            ) {
                                // Event listener just for the root element
                                if (!namespace || namespace.length === 0) {
                                    return fromEvent_1.fromEvent(
                                        rootElement,
                                        eventType,
                                        useCapture,
                                        options.preventDefault
                                    );
                                }
                                // Event listener on the origin element as an EventDelegator
                                var delegators = domSource._delegators;
                                var origin =
                                    domSource._isolateModule.getElement(
                                        fullScope
                                    ) || rootElement;
                                var delegator;
                                if (delegators.has(key)) {
                                    delegator = delegators.get(key);
                                    delegator.updateOrigin(origin);
                                } else {
                                    delegator = new EventDelegator_1.EventDelegator(
                                        origin,
                                        eventType,
                                        useCapture,
                                        domSource._isolateModule,
                                        options.preventDefault
                                    );
                                    delegators.set(key, delegator);
                                }
                                if (fullScope) {
                                    domSource._isolateModule.addEventDelegator(
                                        fullScope,
                                        delegator
                                    );
                                }
                                var subject = delegator.createDestination(
                                    namespace
                                );
                                return subject;
                            })
                            .flatten();
                        var out = adapt_1.adapt(event$);
                        out._isCycleSource = domSource._name;
                        return out;
                    };
                    MainDOMSource.prototype.dispose = function() {
                        this._sanitation$.shamefullySendNext(null);
                        this._isolateModule.reset();
                    };
                    return MainDOMSource;
                })();
                exports.MainDOMSource = MainDOMSource;
            },
            {
                './BodyDOMSource': 8,
                './DocumentDOMSource': 9,
                './ElementFinder': 10,
                './EventDelegator': 11,
                './fromEvent': 16,
                './isolate': 19,
                './utils': 25,
                '@cycle/run/lib/adapt': 28
            }
        ],
        14: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                var ScopeChecker = (function() {
                    function ScopeChecker(fullScope, isolateModule) {
                        this.fullScope = fullScope;
                        this.isolateModule = isolateModule;
                    }
                    /**
     * Checks whether the given element is *directly* in the scope of this
     * scope checker. Being contained *indirectly* through other scopes
     * is not valid. This is crucial for implementing parent-child isolation,
     * so that the parent selectors don't search inside a child scope.
     */
                    ScopeChecker.prototype.isDirectlyInScope = function(leaf) {
                        for (var el = leaf; el; el = el.parentElement) {
                            var fullScope = this.isolateModule.getFullScope(el);
                            if (fullScope && fullScope !== this.fullScope) {
                                return false;
                            }
                            if (fullScope) {
                                return true;
                            }
                        }
                        return true;
                    };
                    return ScopeChecker;
                })();
                exports.ScopeChecker = ScopeChecker;
            },
            {}
        ],
        15: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                var vnode_1 = require('snabbdom/vnode');
                var h_1 = require('snabbdom/h');
                var classNameFromVNode_1 = require('snabbdom-selector/lib/commonjs/classNameFromVNode');
                var selectorParser_1 = require('snabbdom-selector/lib/commonjs/selectorParser');
                var utils_1 = require('./utils');
                var VNodeWrapper = (function() {
                    function VNodeWrapper(rootElement) {
                        this.rootElement = rootElement;
                    }
                    VNodeWrapper.prototype.call = function(vnode) {
                        if (utils_1.isDocFrag(this.rootElement)) {
                            return this.wrapDocFrag(
                                vnode === null ? [] : [vnode]
                            );
                        }
                        if (vnode === null) {
                            return this.wrap([]);
                        }
                        var _a = selectorParser_1.selectorParser(vnode),
                            selTagName = _a.tagName,
                            selId = _a.id;
                        var vNodeClassName = classNameFromVNode_1.classNameFromVNode(
                            vnode
                        );
                        var vNodeData = vnode.data || {};
                        var vNodeDataProps = vNodeData.props || {};
                        var _b = vNodeDataProps.id,
                            vNodeId = _b === void 0 ? selId : _b;
                        var isVNodeAndRootElementIdentical =
                            typeof vNodeId === 'string' &&
                            vNodeId.toUpperCase() ===
                                this.rootElement.id.toUpperCase() &&
                            selTagName.toUpperCase() ===
                                this.rootElement.tagName.toUpperCase() &&
                            vNodeClassName.toUpperCase() ===
                                this.rootElement.className.toUpperCase();
                        if (isVNodeAndRootElementIdentical) {
                            return vnode;
                        }
                        return this.wrap([vnode]);
                    };
                    VNodeWrapper.prototype.wrapDocFrag = function(children) {
                        return vnode_1.vnode(
                            '',
                            {},
                            children,
                            undefined,
                            this.rootElement
                        );
                    };
                    VNodeWrapper.prototype.wrap = function(children) {
                        var _a = this.rootElement,
                            tagName = _a.tagName,
                            id = _a.id,
                            className = _a.className;
                        var selId = id ? '#' + id : '';
                        var selClass = className
                            ? '.' + className.split(' ').join('.')
                            : '';
                        return h_1.h(
                            '' + tagName.toLowerCase() + selId + selClass,
                            {},
                            children
                        );
                    };
                    return VNodeWrapper;
                })();
                exports.VNodeWrapper = VNodeWrapper;
            },
            {
                './utils': 25,
                'snabbdom-selector/lib/commonjs/classNameFromVNode': 26,
                'snabbdom-selector/lib/commonjs/selectorParser': 27,
                'snabbdom/h': 126,
                'snabbdom/vnode': 137
            }
        ],
        16: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                var xstream_1 = require('xstream');
                function fromEvent(
                    element,
                    eventName,
                    useCapture,
                    preventDefault
                ) {
                    if (useCapture === void 0) {
                        useCapture = false;
                    }
                    if (preventDefault === void 0) {
                        preventDefault = false;
                    }
                    return xstream_1.Stream.create({
                        element: element,
                        next: null,
                        start: function start(listener) {
                            if (preventDefault) {
                                this.next = function next(event) {
                                    event.preventDefault();
                                    listener.next(event);
                                };
                            } else {
                                this.next = function next(event) {
                                    listener.next(event);
                                };
                            }
                            this.element.addEventListener(
                                eventName,
                                this.next,
                                useCapture
                            );
                        },
                        stop: function stop() {
                            this.element.removeEventListener(
                                eventName,
                                this.next,
                                useCapture
                            );
                        }
                    });
                }
                exports.fromEvent = fromEvent;
            },
            { xstream: 146 }
        ],
        17: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                // tslint:disable:max-file-line-count
                var h_1 = require('snabbdom/h');
                function isValidString(param) {
                    return typeof param === 'string' && param.length > 0;
                }
                function isSelector(param) {
                    return (
                        isValidString(param) &&
                        (param[0] === '.' || param[0] === '#')
                    );
                }
                function createTagFunction(tagName) {
                    return function hyperscript(a, b, c) {
                        var hasA = typeof a !== 'undefined';
                        var hasB = typeof b !== 'undefined';
                        var hasC = typeof c !== 'undefined';
                        if (isSelector(a)) {
                            if (hasB && hasC) {
                                return h_1.h(tagName + a, b, c);
                            } else if (hasB) {
                                return h_1.h(tagName + a, b);
                            } else {
                                return h_1.h(tagName + a, {});
                            }
                        } else if (hasC) {
                            return h_1.h(tagName + a, b, c);
                        } else if (hasB) {
                            return h_1.h(tagName, a, b);
                        } else if (hasA) {
                            return h_1.h(tagName, a);
                        } else {
                            return h_1.h(tagName, {});
                        }
                    };
                }
                var SVG_TAG_NAMES = [
                    'a',
                    'altGlyph',
                    'altGlyphDef',
                    'altGlyphItem',
                    'animate',
                    'animateColor',
                    'animateMotion',
                    'animateTransform',
                    'circle',
                    'clipPath',
                    'colorProfile',
                    'cursor',
                    'defs',
                    'desc',
                    'ellipse',
                    'feBlend',
                    'feColorMatrix',
                    'feComponentTransfer',
                    'feComposite',
                    'feConvolveMatrix',
                    'feDiffuseLighting',
                    'feDisplacementMap',
                    'feDistantLight',
                    'feFlood',
                    'feFuncA',
                    'feFuncB',
                    'feFuncG',
                    'feFuncR',
                    'feGaussianBlur',
                    'feImage',
                    'feMerge',
                    'feMergeNode',
                    'feMorphology',
                    'feOffset',
                    'fePointLight',
                    'feSpecularLighting',
                    'feSpotlight',
                    'feTile',
                    'feTurbulence',
                    'filter',
                    'font',
                    'fontFace',
                    'fontFaceFormat',
                    'fontFaceName',
                    'fontFaceSrc',
                    'fontFaceUri',
                    'foreignObject',
                    'g',
                    'glyph',
                    'glyphRef',
                    'hkern',
                    'image',
                    'line',
                    'linearGradient',
                    'marker',
                    'mask',
                    'metadata',
                    'missingGlyph',
                    'mpath',
                    'path',
                    'pattern',
                    'polygon',
                    'polyline',
                    'radialGradient',
                    'rect',
                    'script',
                    'set',
                    'stop',
                    'style',
                    'switch',
                    'symbol',
                    'text',
                    'textPath',
                    'title',
                    'tref',
                    'tspan',
                    'use',
                    'view',
                    'vkern'
                ];
                var svg = createTagFunction('svg');
                SVG_TAG_NAMES.forEach(function(tag) {
                    svg[tag] = createTagFunction(tag);
                });
                var TAG_NAMES = [
                    'a',
                    'abbr',
                    'address',
                    'area',
                    'article',
                    'aside',
                    'audio',
                    'b',
                    'base',
                    'bdi',
                    'bdo',
                    'blockquote',
                    'body',
                    'br',
                    'button',
                    'canvas',
                    'caption',
                    'cite',
                    'code',
                    'col',
                    'colgroup',
                    'dd',
                    'del',
                    'dfn',
                    'dir',
                    'div',
                    'dl',
                    'dt',
                    'em',
                    'embed',
                    'fieldset',
                    'figcaption',
                    'figure',
                    'footer',
                    'form',
                    'h1',
                    'h2',
                    'h3',
                    'h4',
                    'h5',
                    'h6',
                    'head',
                    'header',
                    'hgroup',
                    'hr',
                    'html',
                    'i',
                    'iframe',
                    'img',
                    'input',
                    'ins',
                    'kbd',
                    'keygen',
                    'label',
                    'legend',
                    'li',
                    'link',
                    'main',
                    'map',
                    'mark',
                    'menu',
                    'meta',
                    'nav',
                    'noscript',
                    'object',
                    'ol',
                    'optgroup',
                    'option',
                    'p',
                    'param',
                    'pre',
                    'progress',
                    'q',
                    'rp',
                    'rt',
                    'ruby',
                    's',
                    'samp',
                    'script',
                    'section',
                    'select',
                    'small',
                    'source',
                    'span',
                    'strong',
                    'style',
                    'sub',
                    'sup',
                    'table',
                    'tbody',
                    'td',
                    'textarea',
                    'tfoot',
                    'th',
                    'thead',
                    'time',
                    'title',
                    'tr',
                    'u',
                    'ul',
                    'video'
                ];
                var exported = {
                    SVG_TAG_NAMES: SVG_TAG_NAMES,
                    TAG_NAMES: TAG_NAMES,
                    svg: svg,
                    isSelector: isSelector,
                    createTagFunction: createTagFunction
                };
                TAG_NAMES.forEach(function(n) {
                    exported[n] = createTagFunction(n);
                });
                exports.default = exported;
            },
            { 'snabbdom/h': 126 }
        ],
        18: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                var thunk_1 = require('./thunk');
                exports.thunk = thunk_1.thunk;
                var MainDOMSource_1 = require('./MainDOMSource');
                exports.MainDOMSource = MainDOMSource_1.MainDOMSource;
                /**
 * A factory for the DOM driver function.
 *
 * Takes a `container` to define the target on the existing DOM which this
 * driver will operate on, and an `options` object as the second argument. The
 * input to this driver is a stream of virtual DOM objects, or in other words,
 * Snabbdom "VNode" objects. The output of this driver is a "DOMSource": a
 * collection of Observables queried with the methods `select()` and `events()`.
 *
 * `DOMSource.select(selector)` returns a new DOMSource with scope restricted to
 * the element(s) that matches the CSS `selector` given.
 *
 * `DOMSource.events(eventType, options)` returns a stream of events of
 * `eventType` happening on the elements that match the current DOMSource. The
 * event object contains the `ownerTarget` property that behaves exactly like
 * `currentTarget`. The reason for this is that some browsers doesn't allow
 * `currentTarget` property to be mutated, hence a new property is created. The
 * returned stream is an *xstream* Stream if you use `@cycle/xstream-run` to run
 * your app with this driver, or it is an RxJS Observable if you use
 * `@cycle/rxjs-run`, and so forth. The `options` parameter can have the
 * property `useCapture`, which is by default `false`, except it is `true` for
 * event types that do not bubble. Read more here
 * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
 * about the `useCapture` and its purpose.
 * The other option is `preventDefault` that is set to false by default.
 * If set to true, the driver will automatically call `preventDefault()` on every event.
 *
 * `DOMSource.elements()` returns a stream of the DOM element(s) matched by the
 * selectors in the DOMSource. Also, `DOMSource.select(':root').elements()`
 * returns a stream of DOM element corresponding to the root (or container) of
 * the app on the DOM.
 *
 * @param {(String|HTMLElement)} container the DOM selector for the element
 * (or the element itself) to contain the rendering of the VTrees.
 * @param {DOMDriverOptions} options an object with two optional properties:
 *
 *   - `modules: array` overrides `@cycle/dom`'s default Snabbdom modules as
 *     as defined in [`src/modules.ts`](./src/modules.ts).
 *   - `transposition: boolean` enables/disables transposition of inner streams
 *     in the virtual DOM tree.
 * @return {Function} the DOM driver function. The function expects a stream of
 * VNode as input, and outputs the DOMSource object.
 * @function makeDOMDriver
 */
                var makeDOMDriver_1 = require('./makeDOMDriver');
                exports.makeDOMDriver = makeDOMDriver_1.makeDOMDriver;
                /**
 * A factory function to create mocked DOMSource objects, for testing purposes.
 *
 * Takes a `mockConfig` object as argument, and returns
 * a DOMSource that can be given to any Cycle.js app that expects a DOMSource in
 * the sources, for testing.
 *
 * The `mockConfig` parameter is an object specifying selectors, eventTypes and
 * their streams. Example:
 *
 * ```js
 * const domSource = mockDOMSource({
 *   '.foo': {
 *     'click': xs.of({target: {}}),
 *     'mouseover': xs.of({target: {}}),
 *   },
 *   '.bar': {
 *     'scroll': xs.of({target: {}}),
 *     elements: xs.of({tagName: 'div'}),
 *   }
 * });
 *
 * // Usage
 * const click$ = domSource.select('.foo').events('click');
 * const element$ = domSource.select('.bar').elements();
 * ```
 *
 * The mocked DOM Source supports isolation. It has the functions `isolateSink`
 * and `isolateSource` attached to it, and performs simple isolation using
 * classNames. *isolateSink* with scope `foo` will append the class `___foo` to
 * the stream of virtual DOM nodes, and *isolateSource* with scope `foo` will
 * perform a conventional `mockedDOMSource.select('.__foo')` call.
 *
 * @param {Object} mockConfig an object where keys are selector strings
 * and values are objects. Those nested objects have `eventType` strings as keys
 * and values are streams you created.
 * @return {Object} fake DOM source object, with an API containing `select()`
 * and `events()` and `elements()` which can be used just like the DOM Driver's
 * DOMSource.
 *
 * @function mockDOMSource
 */
                var mockDOMSource_1 = require('./mockDOMSource');
                exports.mockDOMSource = mockDOMSource_1.mockDOMSource;
                exports.MockedDOMSource = mockDOMSource_1.MockedDOMSource;
                /**
 * The hyperscript function `h()` is a function to create virtual DOM objects,
 * also known as VNodes. Call
 *
 * ```js
 * h('div.myClass', {style: {color: 'red'}}, [])
 * ```
 *
 * to create a VNode that represents a `DIV` element with className `myClass`,
 * styled with red color, and no children because the `[]` array was passed. The
 * API is `h(tagOrSelector, optionalData, optionalChildrenOrText)`.
 *
 * However, usually you should use "hyperscript helpers", which are shortcut
 * functions based on hyperscript. There is one hyperscript helper function for
 * each DOM tagName, such as `h1()`, `h2()`, `div()`, `span()`, `label()`,
 * `input()`. For instance, the previous example could have been written
 * as:
 *
 * ```js
 * div('.myClass', {style: {color: 'red'}}, [])
 * ```
 *
 * There are also SVG helper functions, which apply the appropriate SVG
 * namespace to the resulting elements. `svg()` function creates the top-most
 * SVG element, and `svg.g`, `svg.polygon`, `svg.circle`, `svg.path` are for
 * SVG-specific child elements. Example:
 *
 * ```js
 * svg({attrs: {width: 150, height: 150}}, [
 *   svg.polygon({
 *     attrs: {
 *       class: 'triangle',
 *       points: '20 0 20 150 150 20'
 *     }
 *   })
 * ])
 * ```
 *
 * @function h
 */
                var h_1 = require('snabbdom/h');
                exports.h = h_1.h;
                var hyperscript_helpers_1 = require('./hyperscript-helpers');
                exports.svg = hyperscript_helpers_1.default.svg;
                exports.a = hyperscript_helpers_1.default.a;
                exports.abbr = hyperscript_helpers_1.default.abbr;
                exports.address = hyperscript_helpers_1.default.address;
                exports.area = hyperscript_helpers_1.default.area;
                exports.article = hyperscript_helpers_1.default.article;
                exports.aside = hyperscript_helpers_1.default.aside;
                exports.audio = hyperscript_helpers_1.default.audio;
                exports.b = hyperscript_helpers_1.default.b;
                exports.base = hyperscript_helpers_1.default.base;
                exports.bdi = hyperscript_helpers_1.default.bdi;
                exports.bdo = hyperscript_helpers_1.default.bdo;
                exports.blockquote = hyperscript_helpers_1.default.blockquote;
                exports.body = hyperscript_helpers_1.default.body;
                exports.br = hyperscript_helpers_1.default.br;
                exports.button = hyperscript_helpers_1.default.button;
                exports.canvas = hyperscript_helpers_1.default.canvas;
                exports.caption = hyperscript_helpers_1.default.caption;
                exports.cite = hyperscript_helpers_1.default.cite;
                exports.code = hyperscript_helpers_1.default.code;
                exports.col = hyperscript_helpers_1.default.col;
                exports.colgroup = hyperscript_helpers_1.default.colgroup;
                exports.dd = hyperscript_helpers_1.default.dd;
                exports.del = hyperscript_helpers_1.default.del;
                exports.dfn = hyperscript_helpers_1.default.dfn;
                exports.dir = hyperscript_helpers_1.default.dir;
                exports.div = hyperscript_helpers_1.default.div;
                exports.dl = hyperscript_helpers_1.default.dl;
                exports.dt = hyperscript_helpers_1.default.dt;
                exports.em = hyperscript_helpers_1.default.em;
                exports.embed = hyperscript_helpers_1.default.embed;
                exports.fieldset = hyperscript_helpers_1.default.fieldset;
                exports.figcaption = hyperscript_helpers_1.default.figcaption;
                exports.figure = hyperscript_helpers_1.default.figure;
                exports.footer = hyperscript_helpers_1.default.footer;
                exports.form = hyperscript_helpers_1.default.form;
                exports.h1 = hyperscript_helpers_1.default.h1;
                exports.h2 = hyperscript_helpers_1.default.h2;
                exports.h3 = hyperscript_helpers_1.default.h3;
                exports.h4 = hyperscript_helpers_1.default.h4;
                exports.h5 = hyperscript_helpers_1.default.h5;
                exports.h6 = hyperscript_helpers_1.default.h6;
                exports.head = hyperscript_helpers_1.default.head;
                exports.header = hyperscript_helpers_1.default.header;
                exports.hgroup = hyperscript_helpers_1.default.hgroup;
                exports.hr = hyperscript_helpers_1.default.hr;
                exports.html = hyperscript_helpers_1.default.html;
                exports.i = hyperscript_helpers_1.default.i;
                exports.iframe = hyperscript_helpers_1.default.iframe;
                exports.img = hyperscript_helpers_1.default.img;
                exports.input = hyperscript_helpers_1.default.input;
                exports.ins = hyperscript_helpers_1.default.ins;
                exports.kbd = hyperscript_helpers_1.default.kbd;
                exports.keygen = hyperscript_helpers_1.default.keygen;
                exports.label = hyperscript_helpers_1.default.label;
                exports.legend = hyperscript_helpers_1.default.legend;
                exports.li = hyperscript_helpers_1.default.li;
                exports.link = hyperscript_helpers_1.default.link;
                exports.main = hyperscript_helpers_1.default.main;
                exports.map = hyperscript_helpers_1.default.map;
                exports.mark = hyperscript_helpers_1.default.mark;
                exports.menu = hyperscript_helpers_1.default.menu;
                exports.meta = hyperscript_helpers_1.default.meta;
                exports.nav = hyperscript_helpers_1.default.nav;
                exports.noscript = hyperscript_helpers_1.default.noscript;
                exports.object = hyperscript_helpers_1.default.object;
                exports.ol = hyperscript_helpers_1.default.ol;
                exports.optgroup = hyperscript_helpers_1.default.optgroup;
                exports.option = hyperscript_helpers_1.default.option;
                exports.p = hyperscript_helpers_1.default.p;
                exports.param = hyperscript_helpers_1.default.param;
                exports.pre = hyperscript_helpers_1.default.pre;
                exports.progress = hyperscript_helpers_1.default.progress;
                exports.q = hyperscript_helpers_1.default.q;
                exports.rp = hyperscript_helpers_1.default.rp;
                exports.rt = hyperscript_helpers_1.default.rt;
                exports.ruby = hyperscript_helpers_1.default.ruby;
                exports.s = hyperscript_helpers_1.default.s;
                exports.samp = hyperscript_helpers_1.default.samp;
                exports.script = hyperscript_helpers_1.default.script;
                exports.section = hyperscript_helpers_1.default.section;
                exports.select = hyperscript_helpers_1.default.select;
                exports.small = hyperscript_helpers_1.default.small;
                exports.source = hyperscript_helpers_1.default.source;
                exports.span = hyperscript_helpers_1.default.span;
                exports.strong = hyperscript_helpers_1.default.strong;
                exports.style = hyperscript_helpers_1.default.style;
                exports.sub = hyperscript_helpers_1.default.sub;
                exports.sup = hyperscript_helpers_1.default.sup;
                exports.table = hyperscript_helpers_1.default.table;
                exports.tbody = hyperscript_helpers_1.default.tbody;
                exports.td = hyperscript_helpers_1.default.td;
                exports.textarea = hyperscript_helpers_1.default.textarea;
                exports.tfoot = hyperscript_helpers_1.default.tfoot;
                exports.th = hyperscript_helpers_1.default.th;
                exports.thead = hyperscript_helpers_1.default.thead;
                exports.title = hyperscript_helpers_1.default.title;
                exports.tr = hyperscript_helpers_1.default.tr;
                exports.u = hyperscript_helpers_1.default.u;
                exports.ul = hyperscript_helpers_1.default.ul;
                exports.video = hyperscript_helpers_1.default.video;
            },
            {
                './MainDOMSource': 13,
                './hyperscript-helpers': 17,
                './makeDOMDriver': 20,
                './mockDOMSource': 22,
                './thunk': 24,
                'snabbdom/h': 126
            }
        ],
        19: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                var vnode_1 = require('snabbdom/vnode');
                var utils_1 = require('./utils');
                function totalIsolateSource(source, scope) {
                    return source.select(utils_1.SCOPE_PREFIX + scope);
                }
                function siblingIsolateSource(source, scope) {
                    return source.select(scope);
                }
                function isolateSource(source, scope) {
                    if (scope === ':root') {
                        return source;
                    } else if (utils_1.isClassOrId(scope)) {
                        return siblingIsolateSource(source, scope);
                    } else {
                        return totalIsolateSource(source, scope);
                    }
                }
                exports.isolateSource = isolateSource;
                function siblingIsolateSink(sink, scope) {
                    return sink.map(function(node) {
                        return node
                            ? vnode_1.vnode(
                                  node.sel + scope,
                                  node.data,
                                  node.children,
                                  node.text,
                                  node.elm
                              )
                            : node;
                    });
                }
                exports.siblingIsolateSink = siblingIsolateSink;
                function totalIsolateSink(sink, fullScope) {
                    return sink.map(function(node) {
                        if (!node) {
                            return node;
                        }
                        // Ignore if already had up-to-date full scope in vnode.data.isolate
                        if (node.data && node.data.isolate) {
                            var isolateData = node.data.isolate;
                            var prevFullScopeNum = isolateData.replace(
                                /(cycle|\-)/g,
                                ''
                            );
                            var fullScopeNum = fullScope.replace(
                                /(cycle|\-)/g,
                                ''
                            );
                            if (
                                isNaN(parseInt(prevFullScopeNum)) ||
                                isNaN(parseInt(fullScopeNum)) ||
                                prevFullScopeNum > fullScopeNum
                            ) {
                                // > is lexicographic string comparison
                                return node;
                            }
                        }
                        // Insert up-to-date full scope in vnode.data.isolate, and also a key if needed
                        node.data = node.data || {};
                        node.data.isolate = fullScope;
                        if (typeof node.key === 'undefined') {
                            node.key = utils_1.SCOPE_PREFIX + fullScope;
                        }
                        return node;
                    });
                }
                exports.totalIsolateSink = totalIsolateSink;
            },
            { './utils': 25, 'snabbdom/vnode': 137 }
        ],
        20: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                var snabbdom_1 = require('snabbdom');
                var xstream_1 = require('xstream');
                var MainDOMSource_1 = require('./MainDOMSource');
                var tovnode_1 = require('snabbdom/tovnode');
                var VNodeWrapper_1 = require('./VNodeWrapper');
                var utils_1 = require('./utils');
                var modules_1 = require('./modules');
                var IsolateModule_1 = require('./IsolateModule');
                var MapPolyfill = require('es6-map');
                function makeDOMDriverInputGuard(modules) {
                    if (!Array.isArray(modules)) {
                        throw new Error(
                            'Optional modules option must be ' +
                                'an array for snabbdom modules'
                        );
                    }
                }
                function domDriverInputGuard(view$) {
                    if (
                        !view$ ||
                        typeof view$.addListener !== 'function' ||
                        typeof view$.fold !== 'function'
                    ) {
                        throw new Error(
                            'The DOM driver function expects as input a Stream of ' +
                                'virtual DOM elements'
                        );
                    }
                }
                function dropCompletion(input) {
                    return xstream_1.default.merge(
                        input,
                        xstream_1.default.never()
                    );
                }
                function unwrapElementFromVNode(vnode) {
                    return vnode.elm;
                }
                function reportSnabbdomError(err) {
                    (console.error || console.log)(err);
                }
                function makeDOMDriver(container, options) {
                    if (!options) {
                        options = {};
                    }
                    var modules = options.modules || modules_1.default;
                    var isolateModule = new IsolateModule_1.IsolateModule();
                    var patch = snabbdom_1.init(
                        [isolateModule.createModule()].concat(modules)
                    );
                    var rootElement =
                        utils_1.getValidNode(container) || document.body;
                    var vnodeWrapper = new VNodeWrapper_1.VNodeWrapper(
                        rootElement
                    );
                    var delegators = new MapPolyfill();
                    makeDOMDriverInputGuard(modules);
                    function DOMDriver(vnode$, name) {
                        if (name === void 0) {
                            name = 'DOM';
                        }
                        domDriverInputGuard(vnode$);
                        var sanitation$ = xstream_1.default.create();
                        var rootElement$ = xstream_1.default
                            .merge(vnode$.endWhen(sanitation$), sanitation$)
                            .map(function(vnode) {
                                return vnodeWrapper.call(vnode);
                            })
                            .fold(patch, tovnode_1.toVNode(rootElement))
                            .drop(1)
                            .map(unwrapElementFromVNode)
                            .compose(dropCompletion) // don't complete this stream
                            .startWith(rootElement);
                        // Start the snabbdom patching, over time
                        var listener = { error: reportSnabbdomError };
                        if (document.readyState === 'loading') {
                            document.addEventListener(
                                'readystatechange',
                                function() {
                                    if (document.readyState === 'interactive') {
                                        rootElement$.addListener(listener);
                                    }
                                }
                            );
                        } else {
                            rootElement$.addListener(listener);
                        }
                        return new MainDOMSource_1.MainDOMSource(
                            rootElement$,
                            sanitation$,
                            [],
                            isolateModule,
                            delegators,
                            name
                        );
                    }
                    return DOMDriver;
                }
                exports.makeDOMDriver = makeDOMDriver;
            },
            {
                './IsolateModule': 12,
                './MainDOMSource': 13,
                './VNodeWrapper': 15,
                './modules': 23,
                './utils': 25,
                'es6-map': 87,
                snabbdom: 134,
                'snabbdom/tovnode': 136,
                xstream: 146
            }
        ],
        21: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                function createMatchesSelector() {
                    var vendor;
                    try {
                        var proto = Element.prototype;
                        vendor =
                            proto.matches ||
                            proto.matchesSelector ||
                            proto.webkitMatchesSelector ||
                            proto.mozMatchesSelector ||
                            proto.msMatchesSelector ||
                            proto.oMatchesSelector;
                    } catch (err) {
                        vendor = null;
                    }
                    return function match(elem, selector) {
                        if (selector.length === 0) {
                            return true;
                        }
                        if (vendor) {
                            return vendor.call(elem, selector);
                        }
                        var nodes = elem.parentNode.querySelectorAll(selector);
                        for (var i = 0; i < nodes.length; i++) {
                            if (nodes[i] === elem) {
                                return true;
                            }
                        }
                        return false;
                    };
                }
                exports.matchesSelector = createMatchesSelector();
            },
            {}
        ],
        22: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                var xstream_1 = require('xstream');
                var adapt_1 = require('@cycle/run/lib/adapt');
                var SCOPE_PREFIX = '___';
                var MockedDOMSource = (function() {
                    function MockedDOMSource(_mockConfig) {
                        this._mockConfig = _mockConfig;
                        if (_mockConfig['elements']) {
                            this._elements = _mockConfig['elements'];
                        } else {
                            this._elements = adapt_1.adapt(
                                xstream_1.default.empty()
                            );
                        }
                    }
                    MockedDOMSource.prototype.elements = function() {
                        var out = this._elements;
                        out._isCycleSource = 'MockedDOM';
                        return out;
                    };
                    MockedDOMSource.prototype.events = function(
                        eventType,
                        options
                    ) {
                        var streamForEventType = this._mockConfig[eventType];
                        var out = adapt_1.adapt(
                            streamForEventType || xstream_1.default.empty()
                        );
                        out._isCycleSource = 'MockedDOM';
                        return out;
                    };
                    MockedDOMSource.prototype.select = function(selector) {
                        var mockConfigForSelector =
                            this._mockConfig[selector] || {};
                        return new MockedDOMSource(mockConfigForSelector);
                    };
                    MockedDOMSource.prototype.isolateSource = function(
                        source,
                        scope
                    ) {
                        return source.select('.' + SCOPE_PREFIX + scope);
                    };
                    MockedDOMSource.prototype.isolateSink = function(
                        sink,
                        scope
                    ) {
                        return sink.map(function(vnode) {
                            if (
                                vnode.sel &&
                                vnode.sel.indexOf(SCOPE_PREFIX + scope) !== -1
                            ) {
                                return vnode;
                            } else {
                                vnode.sel += '.' + SCOPE_PREFIX + scope;
                                return vnode;
                            }
                        });
                    };
                    return MockedDOMSource;
                })();
                exports.MockedDOMSource = MockedDOMSource;
                function mockDOMSource(mockConfig) {
                    return new MockedDOMSource(mockConfig);
                }
                exports.mockDOMSource = mockDOMSource;
            },
            { '@cycle/run/lib/adapt': 28, xstream: 146 }
        ],
        23: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                var class_1 = require('snabbdom/modules/class');
                exports.ClassModule = class_1.default;
                var props_1 = require('snabbdom/modules/props');
                exports.PropsModule = props_1.default;
                var attributes_1 = require('snabbdom/modules/attributes');
                exports.AttrsModule = attributes_1.default;
                var style_1 = require('snabbdom/modules/style');
                exports.StyleModule = style_1.default;
                var dataset_1 = require('snabbdom/modules/dataset');
                exports.DatasetModule = dataset_1.default;
                var modules = [
                    style_1.default,
                    class_1.default,
                    props_1.default,
                    attributes_1.default,
                    dataset_1.default
                ];
                exports.default = modules;
            },
            {
                'snabbdom/modules/attributes': 129,
                'snabbdom/modules/class': 130,
                'snabbdom/modules/dataset': 131,
                'snabbdom/modules/props': 132,
                'snabbdom/modules/style': 133
            }
        ],
        24: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                var h_1 = require('snabbdom/h');
                function copyToThunk(vnode, thunkVNode) {
                    thunkVNode.elm = vnode.elm;
                    vnode.data.fn = thunkVNode.data.fn;
                    vnode.data.args = thunkVNode.data.args;
                    vnode.data.isolate = thunkVNode.data.isolate;
                    thunkVNode.data = vnode.data;
                    thunkVNode.children = vnode.children;
                    thunkVNode.text = vnode.text;
                    thunkVNode.elm = vnode.elm;
                }
                function init(thunkVNode) {
                    var cur = thunkVNode.data;
                    var vnode = cur.fn.apply(undefined, cur.args);
                    copyToThunk(vnode, thunkVNode);
                }
                function prepatch(oldVnode, thunkVNode) {
                    var old = oldVnode.data,
                        cur = thunkVNode.data;
                    var i;
                    var oldArgs = old.args,
                        args = cur.args;
                    if (old.fn !== cur.fn || oldArgs.length !== args.length) {
                        copyToThunk(cur.fn.apply(undefined, args), thunkVNode);
                    }
                    for (i = 0; i < args.length; ++i) {
                        if (oldArgs[i] !== args[i]) {
                            copyToThunk(
                                cur.fn.apply(undefined, args),
                                thunkVNode
                            );
                            return;
                        }
                    }
                    copyToThunk(oldVnode, thunkVNode);
                }
                function thunk(sel, key, fn, args) {
                    if (args === undefined) {
                        args = fn;
                        fn = key;
                        key = undefined;
                    }
                    return h_1.h(sel, {
                        key: key,
                        hook: { init: init, prepatch: prepatch },
                        fn: fn,
                        args: args
                    });
                }
                exports.thunk = thunk;
                exports.default = thunk;
            },
            { 'snabbdom/h': 126 }
        ],
        25: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                function isValidNode(obj) {
                    var ELEM_TYPE = 1;
                    var FRAG_TYPE = 11;
                    return typeof HTMLElement === 'object'
                        ? obj instanceof HTMLElement ||
                              obj instanceof DocumentFragment
                        : obj &&
                              typeof obj === 'object' &&
                              obj !== null &&
                              (obj.nodeType === ELEM_TYPE ||
                                  obj.nodeType === FRAG_TYPE) &&
                              typeof obj.nodeName === 'string';
                }
                function isClassOrId(str) {
                    return str.length > 1 && (str[0] === '.' || str[0] === '#');
                }
                exports.isClassOrId = isClassOrId;
                function isDocFrag(el) {
                    return el.nodeType === 11;
                }
                exports.isDocFrag = isDocFrag;
                exports.SCOPE_PREFIX = '$$CYCLEDOM$$-';
                function getValidNode(selectors) {
                    var domElement =
                        typeof selectors === 'string'
                            ? document.querySelector(selectors)
                            : selectors;
                    if (typeof selectors === 'string' && domElement === null) {
                        throw new Error(
                            'Cannot render into unknown element `' +
                                selectors +
                                '`'
                        );
                    } else if (!isValidNode(domElement)) {
                        throw new Error(
                            'Given container is not a DOM element neither a ' +
                                'selector string.'
                        );
                    }
                    return domElement;
                }
                exports.getValidNode = getValidNode;
                /**
 * The full scope of a namespace is the "absolute path" of scopes from
 * parent to child. This is extracted from the namespace, filter only for
 * scopes in the namespace.
 */
                function getFullScope(namespace) {
                    return namespace
                        .filter(function(c) {
                            return c.indexOf(exports.SCOPE_PREFIX) > -1;
                        })
                        .map(function(c) {
                            return c.replace(exports.SCOPE_PREFIX, '');
                        })
                        .join('-');
                }
                exports.getFullScope = getFullScope;
                function getSelectors(namespace) {
                    return namespace
                        .filter(function(c) {
                            return c.indexOf(exports.SCOPE_PREFIX) === -1;
                        })
                        .join(' ');
                }
                exports.getSelectors = getSelectors;
            },
            {}
        ],
        26: [
            function(require, module, exports) {
                'use strict';
                var selectorParser_1 = require('./selectorParser');
                function classNameFromVNode(vNode) {
                    var _a = selectorParser_1.selectorParser(vNode).className,
                        cn = _a === void 0 ? '' : _a;
                    if (!vNode.data) {
                        return cn;
                    }
                    var _b = vNode.data,
                        dataClass = _b.class,
                        props = _b.props;
                    if (dataClass) {
                        var c = Object.keys(dataClass).filter(function(cl) {
                            return dataClass[cl];
                        });
                        cn += ' ' + c.join(' ');
                    }
                    if (props && props.className) {
                        cn += ' ' + props.className;
                    }
                    return cn && cn.trim();
                }
                exports.classNameFromVNode = classNameFromVNode;
            },
            { './selectorParser': 27 }
        ],
        27: [
            function(require, module, exports) {
                'use strict';
                function selectorParser(node) {
                    if (!node.sel) {
                        return {
                            tagName: '',
                            id: '',
                            className: ''
                        };
                    }
                    var sel = node.sel;
                    var hashIdx = sel.indexOf('#');
                    var dotIdx = sel.indexOf('.', hashIdx);
                    var hash = hashIdx > 0 ? hashIdx : sel.length;
                    var dot = dotIdx > 0 ? dotIdx : sel.length;
                    var tagName =
                        hashIdx !== -1 || dotIdx !== -1
                            ? sel.slice(0, Math.min(hash, dot))
                            : sel;
                    var id = hash < dot ? sel.slice(hash + 1, dot) : void 0;
                    var className =
                        dotIdx > 0
                            ? sel.slice(dot + 1).replace(/\./g, ' ')
                            : void 0;
                    return {
                        tagName: tagName,
                        id: id,
                        className: className
                    };
                }
                exports.selectorParser = selectorParser;
            },
            {}
        ],
        28: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                var adaptStream = function(x) {
                    return x;
                };
                function setAdapt(f) {
                    adaptStream = f;
                }
                exports.setAdapt = setAdapt;
                function adapt(stream) {
                    return adaptStream(stream);
                }
                exports.adapt = adapt;
            },
            {}
        ],
        29: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                var xstream_1 = require('xstream');
                var adapt_1 = require('./adapt');
                function logToConsoleError(err) {
                    var target = err.stack || err;
                    if (console && console.error) {
                        console.error(target);
                    } else if (console && console.log) {
                        console.log(target);
                    }
                }
                function makeSinkProxies(drivers) {
                    var sinkProxies = {};
                    for (var name_1 in drivers) {
                        if (drivers.hasOwnProperty(name_1)) {
                            sinkProxies[
                                name_1
                            ] = xstream_1.default.createWithMemory();
                        }
                    }
                    return sinkProxies;
                }
                function callDrivers(drivers, sinkProxies) {
                    var sources = {};
                    for (var name_2 in drivers) {
                        if (drivers.hasOwnProperty(name_2)) {
                            sources[name_2] = drivers[name_2](
                                sinkProxies[name_2],
                                name_2
                            );
                            if (
                                sources[name_2] &&
                                typeof sources[name_2] === 'object'
                            ) {
                                sources[name_2]._isCycleSource = name_2;
                            }
                        }
                    }
                    return sources;
                }
                // NOTE: this will mutate `sources`.
                function adaptSources(sources) {
                    for (var name_3 in sources) {
                        if (
                            sources.hasOwnProperty(name_3) &&
                            sources[name_3] &&
                            typeof sources[name_3]['shamefullySendNext'] ===
                                'function'
                        ) {
                            sources[name_3] = adapt_1.adapt(sources[name_3]);
                        }
                    }
                    return sources;
                }
                function replicateMany(sinks, sinkProxies) {
                    var sinkNames = Object.keys(sinks).filter(function(name) {
                        return !!sinkProxies[name];
                    });
                    var buffers = {};
                    var replicators = {};
                    sinkNames.forEach(function(name) {
                        buffers[name] = { _n: [], _e: [] };
                        replicators[name] = {
                            next: function(x) {
                                return buffers[name]._n.push(x);
                            },
                            error: function(err) {
                                return buffers[name]._e.push(err);
                            },
                            complete: function() {}
                        };
                    });
                    var subscriptions = sinkNames.map(function(name) {
                        return xstream_1.default
                            .fromObservable(sinks[name])
                            .subscribe(replicators[name]);
                    });
                    sinkNames.forEach(function(name) {
                        var listener = sinkProxies[name];
                        var next = function(x) {
                            listener._n(x);
                        };
                        var error = function(err) {
                            logToConsoleError(err);
                            listener._e(err);
                        };
                        buffers[name]._n.forEach(next);
                        buffers[name]._e.forEach(error);
                        replicators[name].next = next;
                        replicators[name].error = error;
                        // because sink.subscribe(replicator) had mutated replicator to add
                        // _n, _e, _c, we must also update these:
                        replicators[name]._n = next;
                        replicators[name]._e = error;
                    });
                    buffers = null; // free up for GC
                    return function disposeReplication() {
                        subscriptions.forEach(function(s) {
                            return s.unsubscribe();
                        });
                        sinkNames.forEach(function(name) {
                            return sinkProxies[name]._c();
                        });
                    };
                }
                function disposeSources(sources) {
                    for (var k in sources) {
                        if (
                            sources.hasOwnProperty(k) &&
                            sources[k] &&
                            sources[k].dispose
                        ) {
                            sources[k].dispose();
                        }
                    }
                }
                function isObjectEmpty(obj) {
                    return Object.keys(obj).length === 0;
                }
                /**
 * A function that prepares the Cycle application to be executed. Takes a `main`
 * function and prepares to circularly connects it to the given collection of
 * driver functions. As an output, `setup()` returns an object with three
 * properties: `sources`, `sinks` and `run`. Only when `run()` is called will
 * the application actually execute. Refer to the documentation of `run()` for
 * more details.
 *
 * **Example:**
 * ```js
 * import {setup} from '@cycle/run';
 * const {sources, sinks, run} = setup(main, drivers);
 * // ...
 * const dispose = run(); // Executes the application
 * // ...
 * dispose();
 * ```
 *
 * @param {Function} main a function that takes `sources` as input and outputs
 * `sinks`.
 * @param {Object} drivers an object where keys are driver names and values
 * are driver functions.
 * @return {Object} an object with three properties: `sources`, `sinks` and
 * `run`. `sources` is the collection of driver sources, `sinks` is the
 * collection of driver sinks, these can be used for debugging or testing. `run`
 * is the function that once called will execute the application.
 * @function setup
 */
                function setup(main, drivers) {
                    if (typeof main !== 'function') {
                        throw new Error(
                            "First argument given to Cycle must be the 'main' " +
                                'function.'
                        );
                    }
                    if (typeof drivers !== 'object' || drivers === null) {
                        throw new Error(
                            'Second argument given to Cycle must be an object ' +
                                'with driver functions as properties.'
                        );
                    }
                    if (isObjectEmpty(drivers)) {
                        throw new Error(
                            'Second argument given to Cycle must be an object ' +
                                'with at least one driver function declared as a property.'
                        );
                    }
                    var sinkProxies = makeSinkProxies(drivers);
                    var sources = callDrivers(drivers, sinkProxies);
                    var adaptedSources = adaptSources(sources);
                    var sinks = main(adaptedSources);
                    if (typeof window !== 'undefined') {
                        window.Cyclejs = window.Cyclejs || {};
                        window.Cyclejs.sinks = sinks;
                    }
                    function _run() {
                        var disposeReplication = replicateMany(
                            sinks,
                            sinkProxies
                        );
                        return function dispose() {
                            disposeSources(sources);
                            disposeReplication();
                        };
                    }
                    return { sinks: sinks, sources: sources, run: _run };
                }
                exports.setup = setup;
                /**
 * Takes a `main` function and circularly connects it to the given collection
 * of driver functions.
 *
 * **Example:**
 * ```js
 * import run from '@cycle/run';
 * const dispose = run(main, drivers);
 * // ...
 * dispose();
 * ```
 *
 * The `main` function expects a collection of "source" streams (returned from
 * drivers) as input, and should return a collection of "sink" streams (to be
 * given to drivers). A "collection of streams" is a JavaScript object where
 * keys match the driver names registered by the `drivers` object, and values
 * are the streams. Refer to the documentation of each driver to see more
 * details on what types of sources it outputs and sinks it receives.
 *
 * @param {Function} main a function that takes `sources` as input and outputs
 * `sinks`.
 * @param {Object} drivers an object where keys are driver names and values
 * are driver functions.
 * @return {Function} a dispose function, used to terminate the execution of the
 * Cycle.js program, cleaning up resources used.
 * @function run
 */
                function run(main, drivers) {
                    var program = setup(main, drivers);
                    if (
                        typeof window !== 'undefined' &&
                        window['CyclejsDevTool_startGraphSerializer']
                    ) {
                        window['CyclejsDevTool_startGraphSerializer'](
                            program.sinks
                        );
                    }
                    return program.run();
                }
                exports.run = run;
                exports.default = run;
            },
            { './adapt': 28, xstream: 30 }
        ],
        30: [
            function(require, module, exports) {
                'use strict';
                var __extends =
                    (this && this.__extends) ||
                    function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                        function __() {
                            this.constructor = d;
                        }
                        d.prototype =
                            b === null
                                ? Object.create(b)
                                : ((__.prototype = b.prototype), new __());
                    };
                var symbol_observable_1 = require('symbol-observable');
                var NO = {};
                exports.NO = NO;
                function noop() {}
                function cp(a) {
                    var l = a.length;
                    var b = Array(l);
                    for (var i = 0; i < l; ++i) b[i] = a[i];
                    return b;
                }
                function and(f1, f2) {
                    return function andFn(t) {
                        return f1(t) && f2(t);
                    };
                }
                function _try(c, t, u) {
                    try {
                        return c.f(t);
                    } catch (e) {
                        u._e(e);
                        return NO;
                    }
                }
                var NO_IL = {
                    _n: noop,
                    _e: noop,
                    _c: noop
                };
                exports.NO_IL = NO_IL;
                // mutates the input
                function internalizeProducer(producer) {
                    producer._start = function _start(il) {
                        il.next = il._n;
                        il.error = il._e;
                        il.complete = il._c;
                        this.start(il);
                    };
                    producer._stop = producer.stop;
                }
                var StreamSub = (function() {
                    function StreamSub(_stream, _listener) {
                        this._stream = _stream;
                        this._listener = _listener;
                    }
                    StreamSub.prototype.unsubscribe = function() {
                        this._stream.removeListener(this._listener);
                    };
                    return StreamSub;
                })();
                var Observer = (function() {
                    function Observer(_listener) {
                        this._listener = _listener;
                    }
                    Observer.prototype.next = function(value) {
                        this._listener._n(value);
                    };
                    Observer.prototype.error = function(err) {
                        this._listener._e(err);
                    };
                    Observer.prototype.complete = function() {
                        this._listener._c();
                    };
                    return Observer;
                })();
                var FromObservable = (function() {
                    function FromObservable(observable) {
                        this.type = 'fromObservable';
                        this.ins = observable;
                        this.active = false;
                    }
                    FromObservable.prototype._start = function(out) {
                        this.out = out;
                        this.active = true;
                        this._sub = this.ins.subscribe(new Observer(out));
                        if (!this.active) this._sub.unsubscribe();
                    };
                    FromObservable.prototype._stop = function() {
                        if (this._sub) this._sub.unsubscribe();
                        this.active = false;
                    };
                    return FromObservable;
                })();
                var Merge = (function() {
                    function Merge(insArr) {
                        this.type = 'merge';
                        this.insArr = insArr;
                        this.out = NO;
                        this.ac = 0;
                    }
                    Merge.prototype._start = function(out) {
                        this.out = out;
                        var s = this.insArr;
                        var L = s.length;
                        this.ac = L;
                        for (var i = 0; i < L; i++) s[i]._add(this);
                    };
                    Merge.prototype._stop = function() {
                        var s = this.insArr;
                        var L = s.length;
                        for (var i = 0; i < L; i++) s[i]._remove(this);
                        this.out = NO;
                    };
                    Merge.prototype._n = function(t) {
                        var u = this.out;
                        if (u === NO) return;
                        u._n(t);
                    };
                    Merge.prototype._e = function(err) {
                        var u = this.out;
                        if (u === NO) return;
                        u._e(err);
                    };
                    Merge.prototype._c = function() {
                        if (--this.ac <= 0) {
                            var u = this.out;
                            if (u === NO) return;
                            u._c();
                        }
                    };
                    return Merge;
                })();
                var CombineListener = (function() {
                    function CombineListener(i, out, p) {
                        this.i = i;
                        this.out = out;
                        this.p = p;
                        p.ils.push(this);
                    }
                    CombineListener.prototype._n = function(t) {
                        var p = this.p,
                            out = this.out;
                        if (out === NO) return;
                        if (p.up(t, this.i)) {
                            var a = p.vals;
                            var l = a.length;
                            var b = Array(l);
                            for (var i = 0; i < l; ++i) b[i] = a[i];
                            out._n(b);
                        }
                    };
                    CombineListener.prototype._e = function(err) {
                        var out = this.out;
                        if (out === NO) return;
                        out._e(err);
                    };
                    CombineListener.prototype._c = function() {
                        var p = this.p;
                        if (p.out === NO) return;
                        if (--p.Nc === 0) p.out._c();
                    };
                    return CombineListener;
                })();
                var Combine = (function() {
                    function Combine(insArr) {
                        this.type = 'combine';
                        this.insArr = insArr;
                        this.out = NO;
                        this.ils = [];
                        this.Nc = this.Nn = 0;
                        this.vals = [];
                    }
                    Combine.prototype.up = function(t, i) {
                        var v = this.vals[i];
                        var Nn = !this.Nn ? 0 : v === NO ? --this.Nn : this.Nn;
                        this.vals[i] = t;
                        return Nn === 0;
                    };
                    Combine.prototype._start = function(out) {
                        this.out = out;
                        var s = this.insArr;
                        var n = (this.Nc = this.Nn = s.length);
                        var vals = (this.vals = new Array(n));
                        if (n === 0) {
                            out._n([]);
                            out._c();
                        } else {
                            for (var i = 0; i < n; i++) {
                                vals[i] = NO;
                                s[i]._add(new CombineListener(i, out, this));
                            }
                        }
                    };
                    Combine.prototype._stop = function() {
                        var s = this.insArr;
                        var n = s.length;
                        var ils = this.ils;
                        for (var i = 0; i < n; i++) s[i]._remove(ils[i]);
                        this.out = NO;
                        this.ils = [];
                        this.vals = [];
                    };
                    return Combine;
                })();
                var FromArray = (function() {
                    function FromArray(a) {
                        this.type = 'fromArray';
                        this.a = a;
                    }
                    FromArray.prototype._start = function(out) {
                        var a = this.a;
                        for (var i = 0, n = a.length; i < n; i++) out._n(a[i]);
                        out._c();
                    };
                    FromArray.prototype._stop = function() {};
                    return FromArray;
                })();
                var FromPromise = (function() {
                    function FromPromise(p) {
                        this.type = 'fromPromise';
                        this.on = false;
                        this.p = p;
                    }
                    FromPromise.prototype._start = function(out) {
                        var prod = this;
                        this.on = true;
                        this.p
                            .then(
                                function(v) {
                                    if (prod.on) {
                                        out._n(v);
                                        out._c();
                                    }
                                },
                                function(e) {
                                    out._e(e);
                                }
                            )
                            .then(noop, function(err) {
                                setTimeout(function() {
                                    throw err;
                                });
                            });
                    };
                    FromPromise.prototype._stop = function() {
                        this.on = false;
                    };
                    return FromPromise;
                })();
                var Periodic = (function() {
                    function Periodic(period) {
                        this.type = 'periodic';
                        this.period = period;
                        this.intervalID = -1;
                        this.i = 0;
                    }
                    Periodic.prototype._start = function(out) {
                        var self = this;
                        function intervalHandler() {
                            out._n(self.i++);
                        }
                        this.intervalID = setInterval(
                            intervalHandler,
                            this.period
                        );
                    };
                    Periodic.prototype._stop = function() {
                        if (this.intervalID !== -1)
                            clearInterval(this.intervalID);
                        this.intervalID = -1;
                        this.i = 0;
                    };
                    return Periodic;
                })();
                var Debug = (function() {
                    function Debug(ins, arg) {
                        this.type = 'debug';
                        this.ins = ins;
                        this.out = NO;
                        this.s = noop;
                        this.l = '';
                        if (typeof arg === 'string') this.l = arg;
                        else if (typeof arg === 'function') this.s = arg;
                    }
                    Debug.prototype._start = function(out) {
                        this.out = out;
                        this.ins._add(this);
                    };
                    Debug.prototype._stop = function() {
                        this.ins._remove(this);
                        this.out = NO;
                    };
                    Debug.prototype._n = function(t) {
                        var u = this.out;
                        if (u === NO) return;
                        var s = this.s,
                            l = this.l;
                        if (s !== noop) {
                            try {
                                s(t);
                            } catch (e) {
                                u._e(e);
                            }
                        } else if (l) console.log(l + ':', t);
                        else console.log(t);
                        u._n(t);
                    };
                    Debug.prototype._e = function(err) {
                        var u = this.out;
                        if (u === NO) return;
                        u._e(err);
                    };
                    Debug.prototype._c = function() {
                        var u = this.out;
                        if (u === NO) return;
                        u._c();
                    };
                    return Debug;
                })();
                var Drop = (function() {
                    function Drop(max, ins) {
                        this.type = 'drop';
                        this.ins = ins;
                        this.out = NO;
                        this.max = max;
                        this.dropped = 0;
                    }
                    Drop.prototype._start = function(out) {
                        this.out = out;
                        this.dropped = 0;
                        this.ins._add(this);
                    };
                    Drop.prototype._stop = function() {
                        this.ins._remove(this);
                        this.out = NO;
                    };
                    Drop.prototype._n = function(t) {
                        var u = this.out;
                        if (u === NO) return;
                        if (this.dropped++ >= this.max) u._n(t);
                    };
                    Drop.prototype._e = function(err) {
                        var u = this.out;
                        if (u === NO) return;
                        u._e(err);
                    };
                    Drop.prototype._c = function() {
                        var u = this.out;
                        if (u === NO) return;
                        u._c();
                    };
                    return Drop;
                })();
                var EndWhenListener = (function() {
                    function EndWhenListener(out, op) {
                        this.out = out;
                        this.op = op;
                    }
                    EndWhenListener.prototype._n = function() {
                        this.op.end();
                    };
                    EndWhenListener.prototype._e = function(err) {
                        this.out._e(err);
                    };
                    EndWhenListener.prototype._c = function() {
                        this.op.end();
                    };
                    return EndWhenListener;
                })();
                var EndWhen = (function() {
                    function EndWhen(o, ins) {
                        this.type = 'endWhen';
                        this.ins = ins;
                        this.out = NO;
                        this.o = o;
                        this.oil = NO_IL;
                    }
                    EndWhen.prototype._start = function(out) {
                        this.out = out;
                        this.o._add(
                            (this.oil = new EndWhenListener(out, this))
                        );
                        this.ins._add(this);
                    };
                    EndWhen.prototype._stop = function() {
                        this.ins._remove(this);
                        this.o._remove(this.oil);
                        this.out = NO;
                        this.oil = NO_IL;
                    };
                    EndWhen.prototype.end = function() {
                        var u = this.out;
                        if (u === NO) return;
                        u._c();
                    };
                    EndWhen.prototype._n = function(t) {
                        var u = this.out;
                        if (u === NO) return;
                        u._n(t);
                    };
                    EndWhen.prototype._e = function(err) {
                        var u = this.out;
                        if (u === NO) return;
                        u._e(err);
                    };
                    EndWhen.prototype._c = function() {
                        this.end();
                    };
                    return EndWhen;
                })();
                var Filter = (function() {
                    function Filter(passes, ins) {
                        this.type = 'filter';
                        this.ins = ins;
                        this.out = NO;
                        this.f = passes;
                    }
                    Filter.prototype._start = function(out) {
                        this.out = out;
                        this.ins._add(this);
                    };
                    Filter.prototype._stop = function() {
                        this.ins._remove(this);
                        this.out = NO;
                    };
                    Filter.prototype._n = function(t) {
                        var u = this.out;
                        if (u === NO) return;
                        var r = _try(this, t, u);
                        if (r === NO || !r) return;
                        u._n(t);
                    };
                    Filter.prototype._e = function(err) {
                        var u = this.out;
                        if (u === NO) return;
                        u._e(err);
                    };
                    Filter.prototype._c = function() {
                        var u = this.out;
                        if (u === NO) return;
                        u._c();
                    };
                    return Filter;
                })();
                var FlattenListener = (function() {
                    function FlattenListener(out, op) {
                        this.out = out;
                        this.op = op;
                    }
                    FlattenListener.prototype._n = function(t) {
                        this.out._n(t);
                    };
                    FlattenListener.prototype._e = function(err) {
                        this.out._e(err);
                    };
                    FlattenListener.prototype._c = function() {
                        this.op.inner = NO;
                        this.op.less();
                    };
                    return FlattenListener;
                })();
                var Flatten = (function() {
                    function Flatten(ins) {
                        this.type = 'flatten';
                        this.ins = ins;
                        this.out = NO;
                        this.open = true;
                        this.inner = NO;
                        this.il = NO_IL;
                    }
                    Flatten.prototype._start = function(out) {
                        this.out = out;
                        this.open = true;
                        this.inner = NO;
                        this.il = NO_IL;
                        this.ins._add(this);
                    };
                    Flatten.prototype._stop = function() {
                        this.ins._remove(this);
                        if (this.inner !== NO) this.inner._remove(this.il);
                        this.out = NO;
                        this.open = true;
                        this.inner = NO;
                        this.il = NO_IL;
                    };
                    Flatten.prototype.less = function() {
                        var u = this.out;
                        if (u === NO) return;
                        if (!this.open && this.inner === NO) u._c();
                    };
                    Flatten.prototype._n = function(s) {
                        var u = this.out;
                        if (u === NO) return;
                        var _a = this,
                            inner = _a.inner,
                            il = _a.il;
                        if (inner !== NO && il !== NO_IL) inner._remove(il);
                        (this.inner = s)._add(
                            (this.il = new FlattenListener(u, this))
                        );
                    };
                    Flatten.prototype._e = function(err) {
                        var u = this.out;
                        if (u === NO) return;
                        u._e(err);
                    };
                    Flatten.prototype._c = function() {
                        this.open = false;
                        this.less();
                    };
                    return Flatten;
                })();
                var Fold = (function() {
                    function Fold(f, seed, ins) {
                        var _this = this;
                        this.type = 'fold';
                        this.ins = ins;
                        this.out = NO;
                        this.f = function(t) {
                            return f(_this.acc, t);
                        };
                        this.acc = this.seed = seed;
                    }
                    Fold.prototype._start = function(out) {
                        this.out = out;
                        this.acc = this.seed;
                        out._n(this.acc);
                        this.ins._add(this);
                    };
                    Fold.prototype._stop = function() {
                        this.ins._remove(this);
                        this.out = NO;
                        this.acc = this.seed;
                    };
                    Fold.prototype._n = function(t) {
                        var u = this.out;
                        if (u === NO) return;
                        var r = _try(this, t, u);
                        if (r === NO) return;
                        u._n((this.acc = r));
                    };
                    Fold.prototype._e = function(err) {
                        var u = this.out;
                        if (u === NO) return;
                        u._e(err);
                    };
                    Fold.prototype._c = function() {
                        var u = this.out;
                        if (u === NO) return;
                        u._c();
                    };
                    return Fold;
                })();
                var Last = (function() {
                    function Last(ins) {
                        this.type = 'last';
                        this.ins = ins;
                        this.out = NO;
                        this.has = false;
                        this.val = NO;
                    }
                    Last.prototype._start = function(out) {
                        this.out = out;
                        this.has = false;
                        this.ins._add(this);
                    };
                    Last.prototype._stop = function() {
                        this.ins._remove(this);
                        this.out = NO;
                        this.val = NO;
                    };
                    Last.prototype._n = function(t) {
                        this.has = true;
                        this.val = t;
                    };
                    Last.prototype._e = function(err) {
                        var u = this.out;
                        if (u === NO) return;
                        u._e(err);
                    };
                    Last.prototype._c = function() {
                        var u = this.out;
                        if (u === NO) return;
                        if (this.has) {
                            u._n(this.val);
                            u._c();
                        } else
                            u._e(
                                new Error(
                                    'last() failed because input stream completed'
                                )
                            );
                    };
                    return Last;
                })();
                var MapOp = (function() {
                    function MapOp(project, ins) {
                        this.type = 'map';
                        this.ins = ins;
                        this.out = NO;
                        this.f = project;
                    }
                    MapOp.prototype._start = function(out) {
                        this.out = out;
                        this.ins._add(this);
                    };
                    MapOp.prototype._stop = function() {
                        this.ins._remove(this);
                        this.out = NO;
                    };
                    MapOp.prototype._n = function(t) {
                        var u = this.out;
                        if (u === NO) return;
                        var r = _try(this, t, u);
                        if (r === NO) return;
                        u._n(r);
                    };
                    MapOp.prototype._e = function(err) {
                        var u = this.out;
                        if (u === NO) return;
                        u._e(err);
                    };
                    MapOp.prototype._c = function() {
                        var u = this.out;
                        if (u === NO) return;
                        u._c();
                    };
                    return MapOp;
                })();
                var Remember = (function() {
                    function Remember(ins) {
                        this.type = 'remember';
                        this.ins = ins;
                        this.out = NO;
                    }
                    Remember.prototype._start = function(out) {
                        this.out = out;
                        this.ins._add(out);
                    };
                    Remember.prototype._stop = function() {
                        this.ins._remove(this.out);
                        this.out = NO;
                    };
                    return Remember;
                })();
                var ReplaceError = (function() {
                    function ReplaceError(replacer, ins) {
                        this.type = 'replaceError';
                        this.ins = ins;
                        this.out = NO;
                        this.f = replacer;
                    }
                    ReplaceError.prototype._start = function(out) {
                        this.out = out;
                        this.ins._add(this);
                    };
                    ReplaceError.prototype._stop = function() {
                        this.ins._remove(this);
                        this.out = NO;
                    };
                    ReplaceError.prototype._n = function(t) {
                        var u = this.out;
                        if (u === NO) return;
                        u._n(t);
                    };
                    ReplaceError.prototype._e = function(err) {
                        var u = this.out;
                        if (u === NO) return;
                        try {
                            this.ins._remove(this);
                            (this.ins = this.f(err))._add(this);
                        } catch (e) {
                            u._e(e);
                        }
                    };
                    ReplaceError.prototype._c = function() {
                        var u = this.out;
                        if (u === NO) return;
                        u._c();
                    };
                    return ReplaceError;
                })();
                var StartWith = (function() {
                    function StartWith(ins, val) {
                        this.type = 'startWith';
                        this.ins = ins;
                        this.out = NO;
                        this.val = val;
                    }
                    StartWith.prototype._start = function(out) {
                        this.out = out;
                        this.out._n(this.val);
                        this.ins._add(out);
                    };
                    StartWith.prototype._stop = function() {
                        this.ins._remove(this.out);
                        this.out = NO;
                    };
                    return StartWith;
                })();
                var Take = (function() {
                    function Take(max, ins) {
                        this.type = 'take';
                        this.ins = ins;
                        this.out = NO;
                        this.max = max;
                        this.taken = 0;
                    }
                    Take.prototype._start = function(out) {
                        this.out = out;
                        this.taken = 0;
                        if (this.max <= 0) out._c();
                        else this.ins._add(this);
                    };
                    Take.prototype._stop = function() {
                        this.ins._remove(this);
                        this.out = NO;
                    };
                    Take.prototype._n = function(t) {
                        var u = this.out;
                        if (u === NO) return;
                        var m = ++this.taken;
                        if (m < this.max) u._n(t);
                        else if (m === this.max) {
                            u._n(t);
                            u._c();
                        }
                    };
                    Take.prototype._e = function(err) {
                        var u = this.out;
                        if (u === NO) return;
                        u._e(err);
                    };
                    Take.prototype._c = function() {
                        var u = this.out;
                        if (u === NO) return;
                        u._c();
                    };
                    return Take;
                })();
                var Stream = (function() {
                    function Stream(producer) {
                        this._prod = producer || NO;
                        this._ils = [];
                        this._stopID = NO;
                        this._dl = NO;
                        this._d = false;
                        this._target = NO;
                        this._err = NO;
                    }
                    Stream.prototype._n = function(t) {
                        var a = this._ils;
                        var L = a.length;
                        if (this._d) this._dl._n(t);
                        if (L == 1) a[0]._n(t);
                        else if (L == 0) return;
                        else {
                            var b = cp(a);
                            for (var i = 0; i < L; i++) b[i]._n(t);
                        }
                    };
                    Stream.prototype._e = function(err) {
                        if (this._err !== NO) return;
                        this._err = err;
                        var a = this._ils;
                        var L = a.length;
                        this._x();
                        if (this._d) this._dl._e(err);
                        if (L == 1) a[0]._e(err);
                        else if (L == 0) return;
                        else {
                            var b = cp(a);
                            for (var i = 0; i < L; i++) b[i]._e(err);
                        }
                        if (!this._d && L == 0) throw this._err;
                    };
                    Stream.prototype._c = function() {
                        var a = this._ils;
                        var L = a.length;
                        this._x();
                        if (this._d) this._dl._c();
                        if (L == 1) a[0]._c();
                        else if (L == 0) return;
                        else {
                            var b = cp(a);
                            for (var i = 0; i < L; i++) b[i]._c();
                        }
                    };
                    Stream.prototype._x = function() {
                        if (this._ils.length === 0) return;
                        if (this._prod !== NO) this._prod._stop();
                        this._err = NO;
                        this._ils = [];
                    };
                    Stream.prototype._stopNow = function() {
                        // WARNING: code that calls this method should
                        // first check if this._prod is valid (not `NO`)
                        this._prod._stop();
                        this._err = NO;
                        this._stopID = NO;
                    };
                    Stream.prototype._add = function(il) {
                        var ta = this._target;
                        if (ta !== NO) return ta._add(il);
                        var a = this._ils;
                        a.push(il);
                        if (a.length > 1) return;
                        if (this._stopID !== NO) {
                            clearTimeout(this._stopID);
                            this._stopID = NO;
                        } else {
                            var p = this._prod;
                            if (p !== NO) p._start(this);
                        }
                    };
                    Stream.prototype._remove = function(il) {
                        var _this = this;
                        var ta = this._target;
                        if (ta !== NO) return ta._remove(il);
                        var a = this._ils;
                        var i = a.indexOf(il);
                        if (i > -1) {
                            a.splice(i, 1);
                            if (this._prod !== NO && a.length <= 0) {
                                this._err = NO;
                                this._stopID = setTimeout(function() {
                                    return _this._stopNow();
                                });
                            } else if (a.length === 1) {
                                this._pruneCycles();
                            }
                        }
                    };
                    // If all paths stemming from `this` stream eventually end at `this`
                    // stream, then we remove the single listener of `this` stream, to
                    // force it to end its execution and dispose resources. This method
                    // assumes as a precondition that this._ils has just one listener.
                    Stream.prototype._pruneCycles = function() {
                        if (this._hasNoSinks(this, []))
                            this._remove(this._ils[0]);
                    };
                    // Checks whether *there is no* path starting from `x` that leads to an end
                    // listener (sink) in the stream graph, following edges A->B where B is a
                    // listener of A. This means these paths constitute a cycle somehow. Is given
                    // a trace of all visited nodes so far.
                    Stream.prototype._hasNoSinks = function(x, trace) {
                        if (trace.indexOf(x) !== -1) return true;
                        else if (x.out === this) return true;
                        else if (x.out && x.out !== NO)
                            return this._hasNoSinks(x.out, trace.concat(x));
                        else if (x._ils) {
                            for (var i = 0, N = x._ils.length; i < N; i++)
                                if (
                                    !this._hasNoSinks(
                                        x._ils[i],
                                        trace.concat(x)
                                    )
                                )
                                    return false;
                            return true;
                        } else return false;
                    };
                    Stream.prototype.ctor = function() {
                        return this instanceof MemoryStream
                            ? MemoryStream
                            : Stream;
                    };
                    /**
     * Adds a Listener to the Stream.
     *
     * @param {Listener} listener
     */
                    Stream.prototype.addListener = function(listener) {
                        listener._n = listener.next || noop;
                        listener._e = listener.error || noop;
                        listener._c = listener.complete || noop;
                        this._add(listener);
                    };
                    /**
     * Removes a Listener from the Stream, assuming the Listener was added to it.
     *
     * @param {Listener<T>} listener
     */
                    Stream.prototype.removeListener = function(listener) {
                        this._remove(listener);
                    };
                    /**
     * Adds a Listener to the Stream returning a Subscription to remove that
     * listener.
     *
     * @param {Listener} listener
     * @returns {Subscription}
     */
                    Stream.prototype.subscribe = function(listener) {
                        this.addListener(listener);
                        return new StreamSub(this, listener);
                    };
                    /**
     * Add interop between most.js and RxJS 5
     *
     * @returns {Stream}
     */
                    Stream.prototype[symbol_observable_1.default] = function() {
                        return this;
                    };
                    /**
     * Creates a new Stream given a Producer.
     *
     * @factory true
     * @param {Producer} producer An optional Producer that dictates how to
     * start, generate events, and stop the Stream.
     * @return {Stream}
     */
                    Stream.create = function(producer) {
                        if (producer) {
                            if (
                                typeof producer.start !== 'function' ||
                                typeof producer.stop !== 'function'
                            )
                                throw new Error(
                                    'producer requires both start and stop functions'
                                );
                            internalizeProducer(producer); // mutates the input
                        }
                        return new Stream(producer);
                    };
                    /**
     * Creates a new MemoryStream given a Producer.
     *
     * @factory true
     * @param {Producer} producer An optional Producer that dictates how to
     * start, generate events, and stop the Stream.
     * @return {MemoryStream}
     */
                    Stream.createWithMemory = function(producer) {
                        if (producer) internalizeProducer(producer); // mutates the input
                        return new MemoryStream(producer);
                    };
                    /**
     * Creates a Stream that does nothing when started. It never emits any event.
     *
     * Marble diagram:
     *
     * ```text
     *          never
     * -----------------------
     * ```
     *
     * @factory true
     * @return {Stream}
     */
                    Stream.never = function() {
                        return new Stream({ _start: noop, _stop: noop });
                    };
                    /**
     * Creates a Stream that immediately emits the "complete" notification when
     * started, and that's it.
     *
     * Marble diagram:
     *
     * ```text
     * empty
     * -|
     * ```
     *
     * @factory true
     * @return {Stream}
     */
                    Stream.empty = function() {
                        return new Stream({
                            _start: function(il) {
                                il._c();
                            },
                            _stop: noop
                        });
                    };
                    /**
     * Creates a Stream that immediately emits an "error" notification with the
     * value you passed as the `error` argument when the stream starts, and that's
     * it.
     *
     * Marble diagram:
     *
     * ```text
     * throw(X)
     * -X
     * ```
     *
     * @factory true
     * @param error The error event to emit on the created stream.
     * @return {Stream}
     */
                    Stream.throw = function(error) {
                        return new Stream({
                            _start: function(il) {
                                il._e(error);
                            },
                            _stop: noop
                        });
                    };
                    /**
     * Creates a stream from an Array, Promise, or an Observable.
     *
     * @factory true
     * @param {Array|PromiseLike|Observable} input The input to make a stream from.
     * @return {Stream}
     */
                    Stream.from = function(input) {
                        if (
                            typeof input[symbol_observable_1.default] ===
                            'function'
                        )
                            return Stream.fromObservable(input);
                        else if (typeof input.then === 'function')
                            return Stream.fromPromise(input);
                        else if (Array.isArray(input))
                            return Stream.fromArray(input);
                        throw new TypeError(
                            'Type of input to from() must be an Array, Promise, or Observable'
                        );
                    };
                    /**
     * Creates a Stream that immediately emits the arguments that you give to
     * *of*, then completes.
     *
     * Marble diagram:
     *
     * ```text
     * of(1,2,3)
     * 123|
     * ```
     *
     * @factory true
     * @param a The first value you want to emit as an event on the stream.
     * @param b The second value you want to emit as an event on the stream. One
     * or more of these values may be given as arguments.
     * @return {Stream}
     */
                    Stream.of = function() {
                        var items = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            items[_i] = arguments[_i];
                        }
                        return Stream.fromArray(items);
                    };
                    /**
     * Converts an array to a stream. The returned stream will emit synchronously
     * all the items in the array, and then complete.
     *
     * Marble diagram:
     *
     * ```text
     * fromArray([1,2,3])
     * 123|
     * ```
     *
     * @factory true
     * @param {Array} array The array to be converted as a stream.
     * @return {Stream}
     */
                    Stream.fromArray = function(array) {
                        return new Stream(new FromArray(array));
                    };
                    /**
     * Converts a promise to a stream. The returned stream will emit the resolved
     * value of the promise, and then complete. However, if the promise is
     * rejected, the stream will emit the corresponding error.
     *
     * Marble diagram:
     *
     * ```text
     * fromPromise( ----42 )
     * -----------------42|
     * ```
     *
     * @factory true
     * @param {PromiseLike} promise The promise to be converted as a stream.
     * @return {Stream}
     */
                    Stream.fromPromise = function(promise) {
                        return new Stream(new FromPromise(promise));
                    };
                    /**
     * Converts an Observable into a Stream.
     *
     * @factory true
     * @param {any} observable The observable to be converted as a stream.
     * @return {Stream}
     */
                    Stream.fromObservable = function(obs) {
                        if (obs.endWhen) return obs;
                        return new Stream(new FromObservable(obs));
                    };
                    /**
     * Creates a stream that periodically emits incremental numbers, every
     * `period` milliseconds.
     *
     * Marble diagram:
     *
     * ```text
     *     periodic(1000)
     * ---0---1---2---3---4---...
     * ```
     *
     * @factory true
     * @param {number} period The interval in milliseconds to use as a rate of
     * emission.
     * @return {Stream}
     */
                    Stream.periodic = function(period) {
                        return new Stream(new Periodic(period));
                    };
                    Stream.prototype._map = function(project) {
                        return new (this.ctor())(new MapOp(project, this));
                    };
                    /**
     * Transforms each event from the input Stream through a `project` function,
     * to get a Stream that emits those transformed events.
     *
     * Marble diagram:
     *
     * ```text
     * --1---3--5-----7------
     *    map(i => i * 10)
     * --10--30-50----70-----
     * ```
     *
     * @param {Function} project A function of type `(t: T) => U` that takes event
     * `t` of type `T` from the input Stream and produces an event of type `U`, to
     * be emitted on the output Stream.
     * @return {Stream}
     */
                    Stream.prototype.map = function(project) {
                        return this._map(project);
                    };
                    /**
     * It's like `map`, but transforms each input event to always the same
     * constant value on the output Stream.
     *
     * Marble diagram:
     *
     * ```text
     * --1---3--5-----7-----
     *       mapTo(10)
     * --10--10-10----10----
     * ```
     *
     * @param projectedValue A value to emit on the output Stream whenever the
     * input Stream emits any value.
     * @return {Stream}
     */
                    Stream.prototype.mapTo = function(projectedValue) {
                        var s = this.map(function() {
                            return projectedValue;
                        });
                        var op = s._prod;
                        op.type = 'mapTo';
                        return s;
                    };
                    /**
     * Only allows events that pass the test given by the `passes` argument.
     *
     * Each event from the input stream is given to the `passes` function. If the
     * function returns `true`, the event is forwarded to the output stream,
     * otherwise it is ignored and not forwarded.
     *
     * Marble diagram:
     *
     * ```text
     * --1---2--3-----4-----5---6--7-8--
     *     filter(i => i % 2 === 0)
     * ------2--------4---------6----8--
     * ```
     *
     * @param {Function} passes A function of type `(t: T) +> boolean` that takes
     * an event from the input stream and checks if it passes, by returning a
     * boolean.
     * @return {Stream}
     */
                    Stream.prototype.filter = function(passes) {
                        var p = this._prod;
                        if (p instanceof Filter)
                            return new Stream(
                                new Filter(and(p.f, passes), p.ins)
                            );
                        return new Stream(new Filter(passes, this));
                    };
                    /**
     * Lets the first `amount` many events from the input stream pass to the
     * output stream, then makes the output stream complete.
     *
     * Marble diagram:
     *
     * ```text
     * --a---b--c----d---e--
     *    take(3)
     * --a---b--c|
     * ```
     *
     * @param {number} amount How many events to allow from the input stream
     * before completing the output stream.
     * @return {Stream}
     */
                    Stream.prototype.take = function(amount) {
                        return new (this.ctor())(new Take(amount, this));
                    };
                    /**
     * Ignores the first `amount` many events from the input stream, and then
     * after that starts forwarding events from the input stream to the output
     * stream.
     *
     * Marble diagram:
     *
     * ```text
     * --a---b--c----d---e--
     *       drop(3)
     * --------------d---e--
     * ```
     *
     * @param {number} amount How many events to ignore from the input stream
     * before forwarding all events from the input stream to the output stream.
     * @return {Stream}
     */
                    Stream.prototype.drop = function(amount) {
                        return new Stream(new Drop(amount, this));
                    };
                    /**
     * When the input stream completes, the output stream will emit the last event
     * emitted by the input stream, and then will also complete.
     *
     * Marble diagram:
     *
     * ```text
     * --a---b--c--d----|
     *       last()
     * -----------------d|
     * ```
     *
     * @return {Stream}
     */
                    Stream.prototype.last = function() {
                        return new Stream(new Last(this));
                    };
                    /**
     * Prepends the given `initial` value to the sequence of events emitted by the
     * input stream. The returned stream is a MemoryStream, which means it is
     * already `remember()`'d.
     *
     * Marble diagram:
     *
     * ```text
     * ---1---2-----3---
     *   startWith(0)
     * 0--1---2-----3---
     * ```
     *
     * @param initial The value or event to prepend.
     * @return {MemoryStream}
     */
                    Stream.prototype.startWith = function(initial) {
                        return new MemoryStream(new StartWith(this, initial));
                    };
                    /**
     * Uses another stream to determine when to complete the current stream.
     *
     * When the given `other` stream emits an event or completes, the output
     * stream will complete. Before that happens, the output stream will behaves
     * like the input stream.
     *
     * Marble diagram:
     *
     * ```text
     * ---1---2-----3--4----5----6---
     *   endWhen( --------a--b--| )
     * ---1---2-----3--4--|
     * ```
     *
     * @param other Some other stream that is used to know when should the output
     * stream of this operator complete.
     * @return {Stream}
     */
                    Stream.prototype.endWhen = function(other) {
                        return new (this.ctor())(new EndWhen(other, this));
                    };
                    /**
     * "Folds" the stream onto itself.
     *
     * Combines events from the past throughout
     * the entire execution of the input stream, allowing you to accumulate them
     * together. It's essentially like `Array.prototype.reduce`. The returned
     * stream is a MemoryStream, which means it is already `remember()`'d.
     *
     * The output stream starts by emitting the `seed` which you give as argument.
     * Then, when an event happens on the input stream, it is combined with that
     * seed value through the `accumulate` function, and the output value is
     * emitted on the output stream. `fold` remembers that output value as `acc`
     * ("accumulator"), and then when a new input event `t` happens, `acc` will be
     * combined with that to produce the new `acc` and so forth.
     *
     * Marble diagram:
     *
     * ```text
     * ------1-----1--2----1----1------
     *   fold((acc, x) => acc + x, 3)
     * 3-----4-----5--7----8----9------
     * ```
     *
     * @param {Function} accumulate A function of type `(acc: R, t: T) => R` that
     * takes the previous accumulated value `acc` and the incoming event from the
     * input stream and produces the new accumulated value.
     * @param seed The initial accumulated value, of type `R`.
     * @return {MemoryStream}
     */
                    Stream.prototype.fold = function(accumulate, seed) {
                        return new MemoryStream(
                            new Fold(accumulate, seed, this)
                        );
                    };
                    /**
     * Replaces an error with another stream.
     *
     * When (and if) an error happens on the input stream, instead of forwarding
     * that error to the output stream, *replaceError* will call the `replace`
     * function which returns the stream that the output stream will replicate.
     * And, in case that new stream also emits an error, `replace` will be called
     * again to get another stream to start replicating.
     *
     * Marble diagram:
     *
     * ```text
     * --1---2-----3--4-----X
     *   replaceError( () => --10--| )
     * --1---2-----3--4--------10--|
     * ```
     *
     * @param {Function} replace A function of type `(err) => Stream` that takes
     * the error that occurred on the input stream or on the previous replacement
     * stream and returns a new stream. The output stream will behave like the
     * stream that this function returns.
     * @return {Stream}
     */
                    Stream.prototype.replaceError = function(replace) {
                        return new (this.ctor())(
                            new ReplaceError(replace, this)
                        );
                    };
                    /**
     * Flattens a "stream of streams", handling only one nested stream at a time
     * (no concurrency).
     *
     * If the input stream is a stream that emits streams, then this operator will
     * return an output stream which is a flat stream: emits regular events. The
     * flattening happens without concurrency. It works like this: when the input
     * stream emits a nested stream, *flatten* will start imitating that nested
     * one. However, as soon as the next nested stream is emitted on the input
     * stream, *flatten* will forget the previous nested one it was imitating, and
     * will start imitating the new nested one.
     *
     * Marble diagram:
     *
     * ```text
     * --+--------+---------------
     *   \        \
     *    \       ----1----2---3--
     *    --a--b----c----d--------
     *           flatten
     * -----a--b------1----2---3--
     * ```
     *
     * @return {Stream}
     */
                    Stream.prototype.flatten = function() {
                        var p = this._prod;
                        return new Stream(new Flatten(this));
                    };
                    /**
     * Passes the input stream to a custom operator, to produce an output stream.
     *
     * *compose* is a handy way of using an existing function in a chained style.
     * Instead of writing `outStream = f(inStream)` you can write
     * `outStream = inStream.compose(f)`.
     *
     * @param {function} operator A function that takes a stream as input and
     * returns a stream as well.
     * @return {Stream}
     */
                    Stream.prototype.compose = function(operator) {
                        return operator(this);
                    };
                    /**
     * Returns an output stream that behaves like the input stream, but also
     * remembers the most recent event that happens on the input stream, so that a
     * newly added listener will immediately receive that memorised event.
     *
     * @return {MemoryStream}
     */
                    Stream.prototype.remember = function() {
                        return new MemoryStream(new Remember(this));
                    };
                    /**
     * Returns an output stream that identically behaves like the input stream,
     * but also runs a `spy` function for each event, to help you debug your app.
     *
     * *debug* takes a `spy` function as argument, and runs that for each event
     * happening on the input stream. If you don't provide the `spy` argument,
     * then *debug* will just `console.log` each event. This helps you to
     * understand the flow of events through some operator chain.
     *
     * Please note that if the output stream has no listeners, then it will not
     * start, which means `spy` will never run because no actual event happens in
     * that case.
     *
     * Marble diagram:
     *
     * ```text
     * --1----2-----3-----4--
     *         debug
     * --1----2-----3-----4--
     * ```
     *
     * @param {function} labelOrSpy A string to use as the label when printing
     * debug information on the console, or a 'spy' function that takes an event
     * as argument, and does not need to return anything.
     * @return {Stream}
     */
                    Stream.prototype.debug = function(labelOrSpy) {
                        return new (this.ctor())(new Debug(this, labelOrSpy));
                    };
                    /**
     * *imitate* changes this current Stream to emit the same events that the
     * `other` given Stream does. This method returns nothing.
     *
     * This method exists to allow one thing: **circular dependency of streams**.
     * For instance, let's imagine that for some reason you need to create a
     * circular dependency where stream `first$` depends on stream `second$`
     * which in turn depends on `first$`:
     *
     * <!-- skip-example -->
     * ```js
     * import delay from 'xstream/extra/delay'
     *
     * var first$ = second$.map(x => x * 10).take(3);
     * var second$ = first$.map(x => x + 1).startWith(1).compose(delay(100));
     * ```
     *
     * However, that is invalid JavaScript, because `second$` is undefined
     * on the first line. This is how *imitate* can help solve it:
     *
     * ```js
     * import delay from 'xstream/extra/delay'
     *
     * var secondProxy$ = xs.create();
     * var first$ = secondProxy$.map(x => x * 10).take(3);
     * var second$ = first$.map(x => x + 1).startWith(1).compose(delay(100));
     * secondProxy$.imitate(second$);
     * ```
     *
     * We create `secondProxy$` before the others, so it can be used in the
     * declaration of `first$`. Then, after both `first$` and `second$` are
     * defined, we hook `secondProxy$` with `second$` with `imitate()` to tell
     * that they are "the same". `imitate` will not trigger the start of any
     * stream, it just binds `secondProxy$` and `second$` together.
     *
     * The following is an example where `imitate()` is important in Cycle.js
     * applications. A parent component contains some child components. A child
     * has an action stream which is given to the parent to define its state:
     *
     * <!-- skip-example -->
     * ```js
     * const childActionProxy$ = xs.create();
     * const parent = Parent({...sources, childAction$: childActionProxy$});
     * const childAction$ = parent.state$.map(s => s.child.action$).flatten();
     * childActionProxy$.imitate(childAction$);
     * ```
     *
     * Note, though, that **`imitate()` does not support MemoryStreams**. If we
     * would attempt to imitate a MemoryStream in a circular dependency, we would
     * either get a race condition (where the symptom would be "nothing happens")
     * or an infinite cyclic emission of values. It's useful to think about
     * MemoryStreams as cells in a spreadsheet. It doesn't make any sense to
     * define a spreadsheet cell `A1` with a formula that depends on `B1` and
     * cell `B1` defined with a formula that depends on `A1`.
     *
     * If you find yourself wanting to use `imitate()` with a
     * MemoryStream, you should rework your code around `imitate()` to use a
     * Stream instead. Look for the stream in the circular dependency that
     * represents an event stream, and that would be a candidate for creating a
     * proxy Stream which then imitates the target Stream.
     *
     * @param {Stream} target The other stream to imitate on the current one. Must
     * not be a MemoryStream.
     */
                    Stream.prototype.imitate = function(target) {
                        if (target instanceof MemoryStream)
                            throw new Error(
                                'A MemoryStream was given to imitate(), but it only ' +
                                    'supports a Stream. Read more about this restriction here: ' +
                                    'https://github.com/staltz/xstream#faq'
                            );
                        this._target = target;
                        for (
                            var ils = this._ils, N = ils.length, i = 0;
                            i < N;
                            i++
                        )
                            target._add(ils[i]);
                        this._ils = [];
                    };
                    /**
     * Forces the Stream to emit the given value to its listeners.
     *
     * As the name indicates, if you use this, you are most likely doing something
     * The Wrong Way. Please try to understand the reactive way before using this
     * method. Use it only when you know what you are doing.
     *
     * @param value The "next" value you want to broadcast to all listeners of
     * this Stream.
     */
                    Stream.prototype.shamefullySendNext = function(value) {
                        this._n(value);
                    };
                    /**
     * Forces the Stream to emit the given error to its listeners.
     *
     * As the name indicates, if you use this, you are most likely doing something
     * The Wrong Way. Please try to understand the reactive way before using this
     * method. Use it only when you know what you are doing.
     *
     * @param {any} error The error you want to broadcast to all the listeners of
     * this Stream.
     */
                    Stream.prototype.shamefullySendError = function(error) {
                        this._e(error);
                    };
                    /**
     * Forces the Stream to emit the "completed" event to its listeners.
     *
     * As the name indicates, if you use this, you are most likely doing something
     * The Wrong Way. Please try to understand the reactive way before using this
     * method. Use it only when you know what you are doing.
     */
                    Stream.prototype.shamefullySendComplete = function() {
                        this._c();
                    };
                    /**
     * Adds a "debug" listener to the stream. There can only be one debug
     * listener, that's why this is 'setDebugListener'. To remove the debug
     * listener, just call setDebugListener(null).
     *
     * A debug listener is like any other listener. The only difference is that a
     * debug listener is "stealthy": its presence/absence does not trigger the
     * start/stop of the stream (or the producer inside the stream). This is
     * useful so you can inspect what is going on without changing the behavior
     * of the program. If you have an idle stream and you add a normal listener to
     * it, the stream will start executing. But if you set a debug listener on an
     * idle stream, it won't start executing (not until the first normal listener
     * is added).
     *
     * As the name indicates, we don't recommend using this method to build app
     * logic. In fact, in most cases the debug operator works just fine. Only use
     * this one if you know what you're doing.
     *
     * @param {Listener<T>} listener
     */
                    Stream.prototype.setDebugListener = function(listener) {
                        if (!listener) {
                            this._d = false;
                            this._dl = NO;
                        } else {
                            this._d = true;
                            listener._n = listener.next || noop;
                            listener._e = listener.error || noop;
                            listener._c = listener.complete || noop;
                            this._dl = listener;
                        }
                    };
                    return Stream;
                })();
                /**
 * Blends multiple streams together, emitting events from all of them
 * concurrently.
 *
 * *merge* takes multiple streams as arguments, and creates a stream that
 * behaves like each of the argument streams, in parallel.
 *
 * Marble diagram:
 *
 * ```text
 * --1----2-----3--------4---
 * ----a-----b----c---d------
 *            merge
 * --1-a--2--b--3-c---d--4---
 * ```
 *
 * @factory true
 * @param {Stream} stream1 A stream to merge together with other streams.
 * @param {Stream} stream2 A stream to merge together with other streams. Two
 * or more streams may be given as arguments.
 * @return {Stream}
 */
                Stream.merge = function merge() {
                    var streams = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        streams[_i] = arguments[_i];
                    }
                    return new Stream(new Merge(streams));
                };
                /**
 * Combines multiple input streams together to return a stream whose events
 * are arrays that collect the latest events from each input stream.
 *
 * *combine* internally remembers the most recent event from each of the input
 * streams. When any of the input streams emits an event, that event together
 * with all the other saved events are combined into an array. That array will
 * be emitted on the output stream. It's essentially a way of joining together
 * the events from multiple streams.
 *
 * Marble diagram:
 *
 * ```text
 * --1----2-----3--------4---
 * ----a-----b-----c--d------
 *          combine
 * ----1a-2a-2b-3b-3c-3d-4d--
 * ```
 *
 * Note: to minimize garbage collection, *combine* uses the same array
 * instance for each emission.  If you need to compare emissions over time,
 * cache the values with `map` first:
 *
 * ```js
 * import pairwise from 'xstream/extra/pairwise'
 *
 * const stream1 = xs.of(1);
 * const stream2 = xs.of(2);
 *
 * xs.combine(stream1, stream2).map(
 *   combinedEmissions => ([ ...combinedEmissions ])
 * ).compose(pairwise)
 * ```
 *
 * @factory true
 * @param {Stream} stream1 A stream to combine together with other streams.
 * @param {Stream} stream2 A stream to combine together with other streams.
 * Multiple streams, not just two, may be given as arguments.
 * @return {Stream}
 */
                Stream.combine = function combine() {
                    var streams = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        streams[_i] = arguments[_i];
                    }
                    return new Stream(new Combine(streams));
                };
                exports.Stream = Stream;
                var MemoryStream = (function(_super) {
                    __extends(MemoryStream, _super);
                    function MemoryStream(producer) {
                        var _this = _super.call(this, producer) || this;
                        _this._has = false;
                        return _this;
                    }
                    MemoryStream.prototype._n = function(x) {
                        this._v = x;
                        this._has = true;
                        _super.prototype._n.call(this, x);
                    };
                    MemoryStream.prototype._add = function(il) {
                        var ta = this._target;
                        if (ta !== NO) return ta._add(il);
                        var a = this._ils;
                        a.push(il);
                        if (a.length > 1) {
                            if (this._has) il._n(this._v);
                            return;
                        }
                        if (this._stopID !== NO) {
                            if (this._has) il._n(this._v);
                            clearTimeout(this._stopID);
                            this._stopID = NO;
                        } else if (this._has) il._n(this._v);
                        else {
                            var p = this._prod;
                            if (p !== NO) p._start(this);
                        }
                    };
                    MemoryStream.prototype._stopNow = function() {
                        this._has = false;
                        _super.prototype._stopNow.call(this);
                    };
                    MemoryStream.prototype._x = function() {
                        this._has = false;
                        _super.prototype._x.call(this);
                    };
                    MemoryStream.prototype.map = function(project) {
                        return this._map(project);
                    };
                    MemoryStream.prototype.mapTo = function(projectedValue) {
                        return _super.prototype.mapTo.call(
                            this,
                            projectedValue
                        );
                    };
                    MemoryStream.prototype.take = function(amount) {
                        return _super.prototype.take.call(this, amount);
                    };
                    MemoryStream.prototype.endWhen = function(other) {
                        return _super.prototype.endWhen.call(this, other);
                    };
                    MemoryStream.prototype.replaceError = function(replace) {
                        return _super.prototype.replaceError.call(
                            this,
                            replace
                        );
                    };
                    MemoryStream.prototype.remember = function() {
                        return this;
                    };
                    MemoryStream.prototype.debug = function(labelOrSpy) {
                        return _super.prototype.debug.call(this, labelOrSpy);
                    };
                    return MemoryStream;
                })(Stream);
                exports.MemoryStream = MemoryStream;
                Object.defineProperty(exports, '__esModule', { value: true });
                exports.default = Stream;
            },
            { 'symbol-observable': 140 }
        ],
        31: [
            function(require, module, exports) {
                'use strict';

                exports.byteLength = byteLength;
                exports.toByteArray = toByteArray;
                exports.fromByteArray = fromByteArray;

                var lookup = [];
                var revLookup = [];
                var Arr =
                    typeof Uint8Array !== 'undefined' ? Uint8Array : Array;

                var code =
                    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                for (var i = 0, len = code.length; i < len; ++i) {
                    lookup[i] = code[i];
                    revLookup[code.charCodeAt(i)] = i;
                }

                revLookup['-'.charCodeAt(0)] = 62;
                revLookup['_'.charCodeAt(0)] = 63;

                function placeHoldersCount(b64) {
                    var len = b64.length;
                    if (len % 4 > 0) {
                        throw new Error(
                            'Invalid string. Length must be a multiple of 4'
                        );
                    }

                    // the number of equal signs (place holders)
                    // if there are two placeholders, than the two characters before it
                    // represent one byte
                    // if there is only one, then the three characters before it represent 2 bytes
                    // this is just a cheap hack to not do indexOf twice
                    return b64[len - 2] === '='
                        ? 2
                        : b64[len - 1] === '=' ? 1 : 0;
                }

                function byteLength(b64) {
                    // base64 is 4/3 + up to two characters of the original data
                    return b64.length * 3 / 4 - placeHoldersCount(b64);
                }

                function toByteArray(b64) {
                    var i, l, tmp, placeHolders, arr;
                    var len = b64.length;
                    placeHolders = placeHoldersCount(b64);

                    arr = new Arr(len * 3 / 4 - placeHolders);

                    // if there are placeholders, only get up to the last complete 4 chars
                    l = placeHolders > 0 ? len - 4 : len;

                    var L = 0;

                    for (i = 0; i < l; i += 4) {
                        tmp =
                            (revLookup[b64.charCodeAt(i)] << 18) |
                            (revLookup[b64.charCodeAt(i + 1)] << 12) |
                            (revLookup[b64.charCodeAt(i + 2)] << 6) |
                            revLookup[b64.charCodeAt(i + 3)];
                        arr[L++] = (tmp >> 16) & 0xff;
                        arr[L++] = (tmp >> 8) & 0xff;
                        arr[L++] = tmp & 0xff;
                    }

                    if (placeHolders === 2) {
                        tmp =
                            (revLookup[b64.charCodeAt(i)] << 2) |
                            (revLookup[b64.charCodeAt(i + 1)] >> 4);
                        arr[L++] = tmp & 0xff;
                    } else if (placeHolders === 1) {
                        tmp =
                            (revLookup[b64.charCodeAt(i)] << 10) |
                            (revLookup[b64.charCodeAt(i + 1)] << 4) |
                            (revLookup[b64.charCodeAt(i + 2)] >> 2);
                        arr[L++] = (tmp >> 8) & 0xff;
                        arr[L++] = tmp & 0xff;
                    }

                    return arr;
                }

                function tripletToBase64(num) {
                    return (
                        lookup[(num >> 18) & 0x3f] +
                        lookup[(num >> 12) & 0x3f] +
                        lookup[(num >> 6) & 0x3f] +
                        lookup[num & 0x3f]
                    );
                }

                function encodeChunk(uint8, start, end) {
                    var tmp;
                    var output = [];
                    for (var i = start; i < end; i += 3) {
                        tmp =
                            (uint8[i] << 16) +
                            (uint8[i + 1] << 8) +
                            uint8[i + 2];
                        output.push(tripletToBase64(tmp));
                    }
                    return output.join('');
                }

                function fromByteArray(uint8) {
                    var tmp;
                    var len = uint8.length;
                    var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
                    var output = '';
                    var parts = [];
                    var maxChunkLength = 16383; // must be multiple of 3

                    // go through the array every three bytes, we'll deal with trailing stuff later
                    for (
                        var i = 0, len2 = len - extraBytes;
                        i < len2;
                        i += maxChunkLength
                    ) {
                        parts.push(
                            encodeChunk(
                                uint8,
                                i,
                                i + maxChunkLength > len2
                                    ? len2
                                    : i + maxChunkLength
                            )
                        );
                    }

                    // pad the end with zeros, but make sure to not forget the extra bytes
                    if (extraBytes === 1) {
                        tmp = uint8[len - 1];
                        output += lookup[tmp >> 2];
                        output += lookup[(tmp << 4) & 0x3f];
                        output += '==';
                    } else if (extraBytes === 2) {
                        tmp = (uint8[len - 2] << 8) + uint8[len - 1];
                        output += lookup[tmp >> 10];
                        output += lookup[(tmp >> 4) & 0x3f];
                        output += lookup[(tmp << 2) & 0x3f];
                        output += '=';
                    }

                    parts.push(output);

                    return parts.join('');
                }
            },
            {}
        ],
        32: [function(require, module, exports) {}, {}],
        33: [
            function(require, module, exports) {
                /*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
                /* eslint-disable no-proto */

                'use strict';

                var base64 = require('base64-js');
                var ieee754 = require('ieee754');

                exports.Buffer = Buffer;
                exports.SlowBuffer = SlowBuffer;
                exports.INSPECT_MAX_BYTES = 50;

                var K_MAX_LENGTH = 0x7fffffff;
                exports.kMaxLength = K_MAX_LENGTH;

                /**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
                Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();

                if (
                    !Buffer.TYPED_ARRAY_SUPPORT &&
                    typeof console !== 'undefined' &&
                    typeof console.error === 'function'
                ) {
                    console.error(
                        'This browser lacks typed array (Uint8Array) support which is required by ' +
                            '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
                    );
                }

                function typedArraySupport() {
                    // Can typed array instances can be augmented?
                    try {
                        var arr = new Uint8Array(1);
                        arr.__proto__ = {
                            __proto__: Uint8Array.prototype,
                            foo: function() {
                                return 42;
                            }
                        };
                        return arr.foo() === 42;
                    } catch (e) {
                        return false;
                    }
                }

                function createBuffer(length) {
                    if (length > K_MAX_LENGTH) {
                        throw new RangeError('Invalid typed array length');
                    }
                    // Return an augmented `Uint8Array` instance
                    var buf = new Uint8Array(length);
                    buf.__proto__ = Buffer.prototype;
                    return buf;
                }

                /**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

                function Buffer(arg, encodingOrOffset, length) {
                    // Common case.
                    if (typeof arg === 'number') {
                        if (typeof encodingOrOffset === 'string') {
                            throw new Error(
                                'If encoding is specified then the first argument must be a string'
                            );
                        }
                        return allocUnsafe(arg);
                    }
                    return from(arg, encodingOrOffset, length);
                }

                // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
                if (
                    typeof Symbol !== 'undefined' &&
                    Symbol.species &&
                    Buffer[Symbol.species] === Buffer
                ) {
                    Object.defineProperty(Buffer, Symbol.species, {
                        value: null,
                        configurable: true,
                        enumerable: false,
                        writable: false
                    });
                }

                Buffer.poolSize = 8192; // not used by this implementation

                function from(value, encodingOrOffset, length) {
                    if (typeof value === 'number') {
                        throw new TypeError(
                            '"value" argument must not be a number'
                        );
                    }

                    if (isArrayBuffer(value)) {
                        return fromArrayBuffer(value, encodingOrOffset, length);
                    }

                    if (typeof value === 'string') {
                        return fromString(value, encodingOrOffset);
                    }

                    return fromObject(value);
                }

                /**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
                Buffer.from = function(value, encodingOrOffset, length) {
                    return from(value, encodingOrOffset, length);
                };

                // Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
                // https://github.com/feross/buffer/pull/148
                Buffer.prototype.__proto__ = Uint8Array.prototype;
                Buffer.__proto__ = Uint8Array;

                function assertSize(size) {
                    if (typeof size !== 'number') {
                        throw new TypeError('"size" argument must be a number');
                    } else if (size < 0) {
                        throw new RangeError(
                            '"size" argument must not be negative'
                        );
                    }
                }

                function alloc(size, fill, encoding) {
                    assertSize(size);
                    if (size <= 0) {
                        return createBuffer(size);
                    }
                    if (fill !== undefined) {
                        // Only pay attention to encoding if it's a string. This
                        // prevents accidentally sending in a number that would
                        // be interpretted as a start offset.
                        return typeof encoding === 'string'
                            ? createBuffer(size).fill(fill, encoding)
                            : createBuffer(size).fill(fill);
                    }
                    return createBuffer(size);
                }

                /**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
                Buffer.alloc = function(size, fill, encoding) {
                    return alloc(size, fill, encoding);
                };

                function allocUnsafe(size) {
                    assertSize(size);
                    return createBuffer(size < 0 ? 0 : checked(size) | 0);
                }

                /**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
                Buffer.allocUnsafe = function(size) {
                    return allocUnsafe(size);
                };
                /**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
                Buffer.allocUnsafeSlow = function(size) {
                    return allocUnsafe(size);
                };

                function fromString(string, encoding) {
                    if (typeof encoding !== 'string' || encoding === '') {
                        encoding = 'utf8';
                    }

                    if (!Buffer.isEncoding(encoding)) {
                        throw new TypeError(
                            '"encoding" must be a valid string encoding'
                        );
                    }

                    var length = byteLength(string, encoding) | 0;
                    var buf = createBuffer(length);

                    var actual = buf.write(string, encoding);

                    if (actual !== length) {
                        // Writing a hex string, for example, that contains invalid characters will
                        // cause everything after the first invalid character to be ignored. (e.g.
                        // 'abxxcd' will be treated as 'ab')
                        buf = buf.slice(0, actual);
                    }

                    return buf;
                }

                function fromArrayLike(array) {
                    var length =
                        array.length < 0 ? 0 : checked(array.length) | 0;
                    var buf = createBuffer(length);
                    for (var i = 0; i < length; i += 1) {
                        buf[i] = array[i] & 255;
                    }
                    return buf;
                }

                function fromArrayBuffer(array, byteOffset, length) {
                    if (byteOffset < 0 || array.byteLength < byteOffset) {
                        throw new RangeError("'offset' is out of bounds");
                    }

                    if (array.byteLength < byteOffset + (length || 0)) {
                        throw new RangeError("'length' is out of bounds");
                    }

                    var buf;
                    if (byteOffset === undefined && length === undefined) {
                        buf = new Uint8Array(array);
                    } else if (length === undefined) {
                        buf = new Uint8Array(array, byteOffset);
                    } else {
                        buf = new Uint8Array(array, byteOffset, length);
                    }

                    // Return an augmented `Uint8Array` instance
                    buf.__proto__ = Buffer.prototype;
                    return buf;
                }

                function fromObject(obj) {
                    if (Buffer.isBuffer(obj)) {
                        var len = checked(obj.length) | 0;
                        var buf = createBuffer(len);

                        if (buf.length === 0) {
                            return buf;
                        }

                        obj.copy(buf, 0, 0, len);
                        return buf;
                    }

                    if (obj) {
                        if (isArrayBufferView(obj) || 'length' in obj) {
                            if (
                                typeof obj.length !== 'number' ||
                                numberIsNaN(obj.length)
                            ) {
                                return createBuffer(0);
                            }
                            return fromArrayLike(obj);
                        }

                        if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
                            return fromArrayLike(obj.data);
                        }
                    }

                    throw new TypeError(
                        'First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.'
                    );
                }

                function checked(length) {
                    // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
                    // length is NaN (which is otherwise coerced to zero.)
                    if (length >= K_MAX_LENGTH) {
                        throw new RangeError(
                            'Attempt to allocate Buffer larger than maximum ' +
                                'size: 0x' +
                                K_MAX_LENGTH.toString(16) +
                                ' bytes'
                        );
                    }
                    return length | 0;
                }

                function SlowBuffer(length) {
                    if (+length != length) {
                        // eslint-disable-line eqeqeq
                        length = 0;
                    }
                    return Buffer.alloc(+length);
                }

                Buffer.isBuffer = function isBuffer(b) {
                    return b != null && b._isBuffer === true;
                };

                Buffer.compare = function compare(a, b) {
                    if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
                        throw new TypeError('Arguments must be Buffers');
                    }

                    if (a === b) return 0;

                    var x = a.length;
                    var y = b.length;

                    for (var i = 0, len = Math.min(x, y); i < len; ++i) {
                        if (a[i] !== b[i]) {
                            x = a[i];
                            y = b[i];
                            break;
                        }
                    }

                    if (x < y) return -1;
                    if (y < x) return 1;
                    return 0;
                };

                Buffer.isEncoding = function isEncoding(encoding) {
                    switch (String(encoding).toLowerCase()) {
                        case 'hex':
                        case 'utf8':
                        case 'utf-8':
                        case 'ascii':
                        case 'latin1':
                        case 'binary':
                        case 'base64':
                        case 'ucs2':
                        case 'ucs-2':
                        case 'utf16le':
                        case 'utf-16le':
                            return true;
                        default:
                            return false;
                    }
                };

                Buffer.concat = function concat(list, length) {
                    if (!Array.isArray(list)) {
                        throw new TypeError(
                            '"list" argument must be an Array of Buffers'
                        );
                    }

                    if (list.length === 0) {
                        return Buffer.alloc(0);
                    }

                    var i;
                    if (length === undefined) {
                        length = 0;
                        for (i = 0; i < list.length; ++i) {
                            length += list[i].length;
                        }
                    }

                    var buffer = Buffer.allocUnsafe(length);
                    var pos = 0;
                    for (i = 0; i < list.length; ++i) {
                        var buf = list[i];
                        if (!Buffer.isBuffer(buf)) {
                            throw new TypeError(
                                '"list" argument must be an Array of Buffers'
                            );
                        }
                        buf.copy(buffer, pos);
                        pos += buf.length;
                    }
                    return buffer;
                };

                function byteLength(string, encoding) {
                    if (Buffer.isBuffer(string)) {
                        return string.length;
                    }
                    if (isArrayBufferView(string) || isArrayBuffer(string)) {
                        return string.byteLength;
                    }
                    if (typeof string !== 'string') {
                        string = '' + string;
                    }

                    var len = string.length;
                    if (len === 0) return 0;

                    // Use a for loop to avoid recursion
                    var loweredCase = false;
                    for (;;) {
                        switch (encoding) {
                            case 'ascii':
                            case 'latin1':
                            case 'binary':
                                return len;
                            case 'utf8':
                            case 'utf-8':
                            case undefined:
                                return utf8ToBytes(string).length;
                            case 'ucs2':
                            case 'ucs-2':
                            case 'utf16le':
                            case 'utf-16le':
                                return len * 2;
                            case 'hex':
                                return len >>> 1;
                            case 'base64':
                                return base64ToBytes(string).length;
                            default:
                                if (loweredCase)
                                    return utf8ToBytes(string).length; // assume utf8
                                encoding = ('' + encoding).toLowerCase();
                                loweredCase = true;
                        }
                    }
                }
                Buffer.byteLength = byteLength;

                function slowToString(encoding, start, end) {
                    var loweredCase = false;

                    // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
                    // property of a typed array.

                    // This behaves neither like String nor Uint8Array in that we set start/end
                    // to their upper/lower bounds if the value passed is out of range.
                    // undefined is handled specially as per ECMA-262 6th Edition,
                    // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
                    if (start === undefined || start < 0) {
                        start = 0;
                    }
                    // Return early if start > this.length. Done here to prevent potential uint32
                    // coercion fail below.
                    if (start > this.length) {
                        return '';
                    }

                    if (end === undefined || end > this.length) {
                        end = this.length;
                    }

                    if (end <= 0) {
                        return '';
                    }

                    // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
                    end >>>= 0;
                    start >>>= 0;

                    if (end <= start) {
                        return '';
                    }

                    if (!encoding) encoding = 'utf8';

                    while (true) {
                        switch (encoding) {
                            case 'hex':
                                return hexSlice(this, start, end);

                            case 'utf8':
                            case 'utf-8':
                                return utf8Slice(this, start, end);

                            case 'ascii':
                                return asciiSlice(this, start, end);

                            case 'latin1':
                            case 'binary':
                                return latin1Slice(this, start, end);

                            case 'base64':
                                return base64Slice(this, start, end);

                            case 'ucs2':
                            case 'ucs-2':
                            case 'utf16le':
                            case 'utf-16le':
                                return utf16leSlice(this, start, end);

                            default:
                                if (loweredCase)
                                    throw new TypeError(
                                        'Unknown encoding: ' + encoding
                                    );
                                encoding = (encoding + '').toLowerCase();
                                loweredCase = true;
                        }
                    }
                }

                // This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
                // to detect a Buffer instance. It's not possible to use `instanceof Buffer`
                // reliably in a browserify context because there could be multiple different
                // copies of the 'buffer' package in use. This method works even for Buffer
                // instances that were created from another copy of the `buffer` package.
                // See: https://github.com/feross/buffer/issues/154
                Buffer.prototype._isBuffer = true;

                function swap(b, n, m) {
                    var i = b[n];
                    b[n] = b[m];
                    b[m] = i;
                }

                Buffer.prototype.swap16 = function swap16() {
                    var len = this.length;
                    if (len % 2 !== 0) {
                        throw new RangeError(
                            'Buffer size must be a multiple of 16-bits'
                        );
                    }
                    for (var i = 0; i < len; i += 2) {
                        swap(this, i, i + 1);
                    }
                    return this;
                };

                Buffer.prototype.swap32 = function swap32() {
                    var len = this.length;
                    if (len % 4 !== 0) {
                        throw new RangeError(
                            'Buffer size must be a multiple of 32-bits'
                        );
                    }
                    for (var i = 0; i < len; i += 4) {
                        swap(this, i, i + 3);
                        swap(this, i + 1, i + 2);
                    }
                    return this;
                };

                Buffer.prototype.swap64 = function swap64() {
                    var len = this.length;
                    if (len % 8 !== 0) {
                        throw new RangeError(
                            'Buffer size must be a multiple of 64-bits'
                        );
                    }
                    for (var i = 0; i < len; i += 8) {
                        swap(this, i, i + 7);
                        swap(this, i + 1, i + 6);
                        swap(this, i + 2, i + 5);
                        swap(this, i + 3, i + 4);
                    }
                    return this;
                };

                Buffer.prototype.toString = function toString() {
                    var length = this.length;
                    if (length === 0) return '';
                    if (arguments.length === 0)
                        return utf8Slice(this, 0, length);
                    return slowToString.apply(this, arguments);
                };

                Buffer.prototype.equals = function equals(b) {
                    if (!Buffer.isBuffer(b))
                        throw new TypeError('Argument must be a Buffer');
                    if (this === b) return true;
                    return Buffer.compare(this, b) === 0;
                };

                Buffer.prototype.inspect = function inspect() {
                    var str = '';
                    var max = exports.INSPECT_MAX_BYTES;
                    if (this.length > 0) {
                        str = this.toString('hex', 0, max)
                            .match(/.{2}/g)
                            .join(' ');
                        if (this.length > max) str += ' ... ';
                    }
                    return '<Buffer ' + str + '>';
                };

                Buffer.prototype.compare = function compare(
                    target,
                    start,
                    end,
                    thisStart,
                    thisEnd
                ) {
                    if (!Buffer.isBuffer(target)) {
                        throw new TypeError('Argument must be a Buffer');
                    }

                    if (start === undefined) {
                        start = 0;
                    }
                    if (end === undefined) {
                        end = target ? target.length : 0;
                    }
                    if (thisStart === undefined) {
                        thisStart = 0;
                    }
                    if (thisEnd === undefined) {
                        thisEnd = this.length;
                    }

                    if (
                        start < 0 ||
                        end > target.length ||
                        thisStart < 0 ||
                        thisEnd > this.length
                    ) {
                        throw new RangeError('out of range index');
                    }

                    if (thisStart >= thisEnd && start >= end) {
                        return 0;
                    }
                    if (thisStart >= thisEnd) {
                        return -1;
                    }
                    if (start >= end) {
                        return 1;
                    }

                    start >>>= 0;
                    end >>>= 0;
                    thisStart >>>= 0;
                    thisEnd >>>= 0;

                    if (this === target) return 0;

                    var x = thisEnd - thisStart;
                    var y = end - start;
                    var len = Math.min(x, y);

                    var thisCopy = this.slice(thisStart, thisEnd);
                    var targetCopy = target.slice(start, end);

                    for (var i = 0; i < len; ++i) {
                        if (thisCopy[i] !== targetCopy[i]) {
                            x = thisCopy[i];
                            y = targetCopy[i];
                            break;
                        }
                    }

                    if (x < y) return -1;
                    if (y < x) return 1;
                    return 0;
                };

                // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
                // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
                //
                // Arguments:
                // - buffer - a Buffer to search
                // - val - a string, Buffer, or number
                // - byteOffset - an index into `buffer`; will be clamped to an int32
                // - encoding - an optional encoding, relevant is val is a string
                // - dir - true for indexOf, false for lastIndexOf
                function bidirectionalIndexOf(
                    buffer,
                    val,
                    byteOffset,
                    encoding,
                    dir
                ) {
                    // Empty buffer means no match
                    if (buffer.length === 0) return -1;

                    // Normalize byteOffset
                    if (typeof byteOffset === 'string') {
                        encoding = byteOffset;
                        byteOffset = 0;
                    } else if (byteOffset > 0x7fffffff) {
                        byteOffset = 0x7fffffff;
                    } else if (byteOffset < -0x80000000) {
                        byteOffset = -0x80000000;
                    }
                    byteOffset = +byteOffset; // Coerce to Number.
                    if (numberIsNaN(byteOffset)) {
                        // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
                        byteOffset = dir ? 0 : buffer.length - 1;
                    }

                    // Normalize byteOffset: negative offsets start from the end of the buffer
                    if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
                    if (byteOffset >= buffer.length) {
                        if (dir) return -1;
                        else byteOffset = buffer.length - 1;
                    } else if (byteOffset < 0) {
                        if (dir) byteOffset = 0;
                        else return -1;
                    }

                    // Normalize val
                    if (typeof val === 'string') {
                        val = Buffer.from(val, encoding);
                    }

                    // Finally, search either indexOf (if dir is true) or lastIndexOf
                    if (Buffer.isBuffer(val)) {
                        // Special case: looking for empty string/buffer always fails
                        if (val.length === 0) {
                            return -1;
                        }
                        return arrayIndexOf(
                            buffer,
                            val,
                            byteOffset,
                            encoding,
                            dir
                        );
                    } else if (typeof val === 'number') {
                        val = val & 0xff; // Search for a byte value [0-255]
                        if (
                            typeof Uint8Array.prototype.indexOf === 'function'
                        ) {
                            if (dir) {
                                return Uint8Array.prototype.indexOf.call(
                                    buffer,
                                    val,
                                    byteOffset
                                );
                            } else {
                                return Uint8Array.prototype.lastIndexOf.call(
                                    buffer,
                                    val,
                                    byteOffset
                                );
                            }
                        }
                        return arrayIndexOf(
                            buffer,
                            [val],
                            byteOffset,
                            encoding,
                            dir
                        );
                    }

                    throw new TypeError('val must be string, number or Buffer');
                }

                function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
                    var indexSize = 1;
                    var arrLength = arr.length;
                    var valLength = val.length;

                    if (encoding !== undefined) {
                        encoding = String(encoding).toLowerCase();
                        if (
                            encoding === 'ucs2' ||
                            encoding === 'ucs-2' ||
                            encoding === 'utf16le' ||
                            encoding === 'utf-16le'
                        ) {
                            if (arr.length < 2 || val.length < 2) {
                                return -1;
                            }
                            indexSize = 2;
                            arrLength /= 2;
                            valLength /= 2;
                            byteOffset /= 2;
                        }
                    }

                    function read(buf, i) {
                        if (indexSize === 1) {
                            return buf[i];
                        } else {
                            return buf.readUInt16BE(i * indexSize);
                        }
                    }

                    var i;
                    if (dir) {
                        var foundIndex = -1;
                        for (i = byteOffset; i < arrLength; i++) {
                            if (
                                read(arr, i) ===
                                read(
                                    val,
                                    foundIndex === -1 ? 0 : i - foundIndex
                                )
                            ) {
                                if (foundIndex === -1) foundIndex = i;
                                if (i - foundIndex + 1 === valLength)
                                    return foundIndex * indexSize;
                            } else {
                                if (foundIndex !== -1) i -= i - foundIndex;
                                foundIndex = -1;
                            }
                        }
                    } else {
                        if (byteOffset + valLength > arrLength)
                            byteOffset = arrLength - valLength;
                        for (i = byteOffset; i >= 0; i--) {
                            var found = true;
                            for (var j = 0; j < valLength; j++) {
                                if (read(arr, i + j) !== read(val, j)) {
                                    found = false;
                                    break;
                                }
                            }
                            if (found) return i;
                        }
                    }

                    return -1;
                }

                Buffer.prototype.includes = function includes(
                    val,
                    byteOffset,
                    encoding
                ) {
                    return this.indexOf(val, byteOffset, encoding) !== -1;
                };

                Buffer.prototype.indexOf = function indexOf(
                    val,
                    byteOffset,
                    encoding
                ) {
                    return bidirectionalIndexOf(
                        this,
                        val,
                        byteOffset,
                        encoding,
                        true
                    );
                };

                Buffer.prototype.lastIndexOf = function lastIndexOf(
                    val,
                    byteOffset,
                    encoding
                ) {
                    return bidirectionalIndexOf(
                        this,
                        val,
                        byteOffset,
                        encoding,
                        false
                    );
                };

                function hexWrite(buf, string, offset, length) {
                    offset = Number(offset) || 0;
                    var remaining = buf.length - offset;
                    if (!length) {
                        length = remaining;
                    } else {
                        length = Number(length);
                        if (length > remaining) {
                            length = remaining;
                        }
                    }

                    // must be an even number of digits
                    var strLen = string.length;
                    if (strLen % 2 !== 0)
                        throw new TypeError('Invalid hex string');

                    if (length > strLen / 2) {
                        length = strLen / 2;
                    }
                    for (var i = 0; i < length; ++i) {
                        var parsed = parseInt(string.substr(i * 2, 2), 16);
                        if (numberIsNaN(parsed)) return i;
                        buf[offset + i] = parsed;
                    }
                    return i;
                }

                function utf8Write(buf, string, offset, length) {
                    return blitBuffer(
                        utf8ToBytes(string, buf.length - offset),
                        buf,
                        offset,
                        length
                    );
                }

                function asciiWrite(buf, string, offset, length) {
                    return blitBuffer(
                        asciiToBytes(string),
                        buf,
                        offset,
                        length
                    );
                }

                function latin1Write(buf, string, offset, length) {
                    return asciiWrite(buf, string, offset, length);
                }

                function base64Write(buf, string, offset, length) {
                    return blitBuffer(
                        base64ToBytes(string),
                        buf,
                        offset,
                        length
                    );
                }

                function ucs2Write(buf, string, offset, length) {
                    return blitBuffer(
                        utf16leToBytes(string, buf.length - offset),
                        buf,
                        offset,
                        length
                    );
                }

                Buffer.prototype.write = function write(
                    string,
                    offset,
                    length,
                    encoding
                ) {
                    // Buffer#write(string)
                    if (offset === undefined) {
                        encoding = 'utf8';
                        length = this.length;
                        offset = 0;
                        // Buffer#write(string, encoding)
                    } else if (
                        length === undefined &&
                        typeof offset === 'string'
                    ) {
                        encoding = offset;
                        length = this.length;
                        offset = 0;
                        // Buffer#write(string, offset[, length][, encoding])
                    } else if (isFinite(offset)) {
                        offset = offset >>> 0;
                        if (isFinite(length)) {
                            length = length >>> 0;
                            if (encoding === undefined) encoding = 'utf8';
                        } else {
                            encoding = length;
                            length = undefined;
                        }
                    } else {
                        throw new Error(
                            'Buffer.write(string, encoding, offset[, length]) is no longer supported'
                        );
                    }

                    var remaining = this.length - offset;
                    if (length === undefined || length > remaining)
                        length = remaining;

                    if (
                        (string.length > 0 && (length < 0 || offset < 0)) ||
                        offset > this.length
                    ) {
                        throw new RangeError(
                            'Attempt to write outside buffer bounds'
                        );
                    }

                    if (!encoding) encoding = 'utf8';

                    var loweredCase = false;
                    for (;;) {
                        switch (encoding) {
                            case 'hex':
                                return hexWrite(this, string, offset, length);

                            case 'utf8':
                            case 'utf-8':
                                return utf8Write(this, string, offset, length);

                            case 'ascii':
                                return asciiWrite(this, string, offset, length);

                            case 'latin1':
                            case 'binary':
                                return latin1Write(
                                    this,
                                    string,
                                    offset,
                                    length
                                );

                            case 'base64':
                                // Warning: maxLength not taken into account in base64Write
                                return base64Write(
                                    this,
                                    string,
                                    offset,
                                    length
                                );

                            case 'ucs2':
                            case 'ucs-2':
                            case 'utf16le':
                            case 'utf-16le':
                                return ucs2Write(this, string, offset, length);

                            default:
                                if (loweredCase)
                                    throw new TypeError(
                                        'Unknown encoding: ' + encoding
                                    );
                                encoding = ('' + encoding).toLowerCase();
                                loweredCase = true;
                        }
                    }
                };

                Buffer.prototype.toJSON = function toJSON() {
                    return {
                        type: 'Buffer',
                        data: Array.prototype.slice.call(this._arr || this, 0)
                    };
                };

                function base64Slice(buf, start, end) {
                    if (start === 0 && end === buf.length) {
                        return base64.fromByteArray(buf);
                    } else {
                        return base64.fromByteArray(buf.slice(start, end));
                    }
                }

                function utf8Slice(buf, start, end) {
                    end = Math.min(buf.length, end);
                    var res = [];

                    var i = start;
                    while (i < end) {
                        var firstByte = buf[i];
                        var codePoint = null;
                        var bytesPerSequence =
                            firstByte > 0xef
                                ? 4
                                : firstByte > 0xdf
                                  ? 3
                                  : firstByte > 0xbf ? 2 : 1;

                        if (i + bytesPerSequence <= end) {
                            var secondByte,
                                thirdByte,
                                fourthByte,
                                tempCodePoint;

                            switch (bytesPerSequence) {
                                case 1:
                                    if (firstByte < 0x80) {
                                        codePoint = firstByte;
                                    }
                                    break;
                                case 2:
                                    secondByte = buf[i + 1];
                                    if ((secondByte & 0xc0) === 0x80) {
                                        tempCodePoint =
                                            ((firstByte & 0x1f) << 0x6) |
                                            (secondByte & 0x3f);
                                        if (tempCodePoint > 0x7f) {
                                            codePoint = tempCodePoint;
                                        }
                                    }
                                    break;
                                case 3:
                                    secondByte = buf[i + 1];
                                    thirdByte = buf[i + 2];
                                    if (
                                        (secondByte & 0xc0) === 0x80 &&
                                        (thirdByte & 0xc0) === 0x80
                                    ) {
                                        tempCodePoint =
                                            ((firstByte & 0xf) << 0xc) |
                                            ((secondByte & 0x3f) << 0x6) |
                                            (thirdByte & 0x3f);
                                        if (
                                            tempCodePoint > 0x7ff &&
                                            (tempCodePoint < 0xd800 ||
                                                tempCodePoint > 0xdfff)
                                        ) {
                                            codePoint = tempCodePoint;
                                        }
                                    }
                                    break;
                                case 4:
                                    secondByte = buf[i + 1];
                                    thirdByte = buf[i + 2];
                                    fourthByte = buf[i + 3];
                                    if (
                                        (secondByte & 0xc0) === 0x80 &&
                                        (thirdByte & 0xc0) === 0x80 &&
                                        (fourthByte & 0xc0) === 0x80
                                    ) {
                                        tempCodePoint =
                                            ((firstByte & 0xf) << 0x12) |
                                            ((secondByte & 0x3f) << 0xc) |
                                            ((thirdByte & 0x3f) << 0x6) |
                                            (fourthByte & 0x3f);
                                        if (
                                            tempCodePoint > 0xffff &&
                                            tempCodePoint < 0x110000
                                        ) {
                                            codePoint = tempCodePoint;
                                        }
                                    }
                            }
                        }

                        if (codePoint === null) {
                            // we did not generate a valid codePoint so insert a
                            // replacement char (U+FFFD) and advance only 1 byte
                            codePoint = 0xfffd;
                            bytesPerSequence = 1;
                        } else if (codePoint > 0xffff) {
                            // encode to utf16 (surrogate pair dance)
                            codePoint -= 0x10000;
                            res.push(((codePoint >>> 10) & 0x3ff) | 0xd800);
                            codePoint = 0xdc00 | (codePoint & 0x3ff);
                        }

                        res.push(codePoint);
                        i += bytesPerSequence;
                    }

                    return decodeCodePointsArray(res);
                }

                // Based on http://stackoverflow.com/a/22747272/680742, the browser with
                // the lowest limit is Chrome, with 0x10000 args.
                // We go 1 magnitude less, for safety
                var MAX_ARGUMENTS_LENGTH = 0x1000;

                function decodeCodePointsArray(codePoints) {
                    var len = codePoints.length;
                    if (len <= MAX_ARGUMENTS_LENGTH) {
                        return String.fromCharCode.apply(String, codePoints); // avoid extra slice()
                    }

                    // Decode in chunks to avoid "call stack size exceeded".
                    var res = '';
                    var i = 0;
                    while (i < len) {
                        res += String.fromCharCode.apply(
                            String,
                            codePoints.slice(i, (i += MAX_ARGUMENTS_LENGTH))
                        );
                    }
                    return res;
                }

                function asciiSlice(buf, start, end) {
                    var ret = '';
                    end = Math.min(buf.length, end);

                    for (var i = start; i < end; ++i) {
                        ret += String.fromCharCode(buf[i] & 0x7f);
                    }
                    return ret;
                }

                function latin1Slice(buf, start, end) {
                    var ret = '';
                    end = Math.min(buf.length, end);

                    for (var i = start; i < end; ++i) {
                        ret += String.fromCharCode(buf[i]);
                    }
                    return ret;
                }

                function hexSlice(buf, start, end) {
                    var len = buf.length;

                    if (!start || start < 0) start = 0;
                    if (!end || end < 0 || end > len) end = len;

                    var out = '';
                    for (var i = start; i < end; ++i) {
                        out += toHex(buf[i]);
                    }
                    return out;
                }

                function utf16leSlice(buf, start, end) {
                    var bytes = buf.slice(start, end);
                    var res = '';
                    for (var i = 0; i < bytes.length; i += 2) {
                        res += String.fromCharCode(
                            bytes[i] + bytes[i + 1] * 256
                        );
                    }
                    return res;
                }

                Buffer.prototype.slice = function slice(start, end) {
                    var len = this.length;
                    start = ~~start;
                    end = end === undefined ? len : ~~end;

                    if (start < 0) {
                        start += len;
                        if (start < 0) start = 0;
                    } else if (start > len) {
                        start = len;
                    }

                    if (end < 0) {
                        end += len;
                        if (end < 0) end = 0;
                    } else if (end > len) {
                        end = len;
                    }

                    if (end < start) end = start;

                    var newBuf = this.subarray(start, end);
                    // Return an augmented `Uint8Array` instance
                    newBuf.__proto__ = Buffer.prototype;
                    return newBuf;
                };

                /*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
                function checkOffset(offset, ext, length) {
                    if (offset % 1 !== 0 || offset < 0)
                        throw new RangeError('offset is not uint');
                    if (offset + ext > length)
                        throw new RangeError(
                            'Trying to access beyond buffer length'
                        );
                }

                Buffer.prototype.readUIntLE = function readUIntLE(
                    offset,
                    byteLength,
                    noAssert
                ) {
                    offset = offset >>> 0;
                    byteLength = byteLength >>> 0;
                    if (!noAssert) checkOffset(offset, byteLength, this.length);

                    var val = this[offset];
                    var mul = 1;
                    var i = 0;
                    while (++i < byteLength && (mul *= 0x100)) {
                        val += this[offset + i] * mul;
                    }

                    return val;
                };

                Buffer.prototype.readUIntBE = function readUIntBE(
                    offset,
                    byteLength,
                    noAssert
                ) {
                    offset = offset >>> 0;
                    byteLength = byteLength >>> 0;
                    if (!noAssert) {
                        checkOffset(offset, byteLength, this.length);
                    }

                    var val = this[offset + --byteLength];
                    var mul = 1;
                    while (byteLength > 0 && (mul *= 0x100)) {
                        val += this[offset + --byteLength] * mul;
                    }

                    return val;
                };

                Buffer.prototype.readUInt8 = function readUInt8(
                    offset,
                    noAssert
                ) {
                    offset = offset >>> 0;
                    if (!noAssert) checkOffset(offset, 1, this.length);
                    return this[offset];
                };

                Buffer.prototype.readUInt16LE = function readUInt16LE(
                    offset,
                    noAssert
                ) {
                    offset = offset >>> 0;
                    if (!noAssert) checkOffset(offset, 2, this.length);
                    return this[offset] | (this[offset + 1] << 8);
                };

                Buffer.prototype.readUInt16BE = function readUInt16BE(
                    offset,
                    noAssert
                ) {
                    offset = offset >>> 0;
                    if (!noAssert) checkOffset(offset, 2, this.length);
                    return (this[offset] << 8) | this[offset + 1];
                };

                Buffer.prototype.readUInt32LE = function readUInt32LE(
                    offset,
                    noAssert
                ) {
                    offset = offset >>> 0;
                    if (!noAssert) checkOffset(offset, 4, this.length);

                    return (
                        (this[offset] |
                            (this[offset + 1] << 8) |
                            (this[offset + 2] << 16)) +
                        this[offset + 3] * 0x1000000
                    );
                };

                Buffer.prototype.readUInt32BE = function readUInt32BE(
                    offset,
                    noAssert
                ) {
                    offset = offset >>> 0;
                    if (!noAssert) checkOffset(offset, 4, this.length);

                    return (
                        this[offset] * 0x1000000 +
                        ((this[offset + 1] << 16) |
                            (this[offset + 2] << 8) |
                            this[offset + 3])
                    );
                };

                Buffer.prototype.readIntLE = function readIntLE(
                    offset,
                    byteLength,
                    noAssert
                ) {
                    offset = offset >>> 0;
                    byteLength = byteLength >>> 0;
                    if (!noAssert) checkOffset(offset, byteLength, this.length);

                    var val = this[offset];
                    var mul = 1;
                    var i = 0;
                    while (++i < byteLength && (mul *= 0x100)) {
                        val += this[offset + i] * mul;
                    }
                    mul *= 0x80;

                    if (val >= mul) val -= Math.pow(2, 8 * byteLength);

                    return val;
                };

                Buffer.prototype.readIntBE = function readIntBE(
                    offset,
                    byteLength,
                    noAssert
                ) {
                    offset = offset >>> 0;
                    byteLength = byteLength >>> 0;
                    if (!noAssert) checkOffset(offset, byteLength, this.length);

                    var i = byteLength;
                    var mul = 1;
                    var val = this[offset + --i];
                    while (i > 0 && (mul *= 0x100)) {
                        val += this[offset + --i] * mul;
                    }
                    mul *= 0x80;

                    if (val >= mul) val -= Math.pow(2, 8 * byteLength);

                    return val;
                };

                Buffer.prototype.readInt8 = function readInt8(
                    offset,
                    noAssert
                ) {
                    offset = offset >>> 0;
                    if (!noAssert) checkOffset(offset, 1, this.length);
                    if (!(this[offset] & 0x80)) return this[offset];
                    return (0xff - this[offset] + 1) * -1;
                };

                Buffer.prototype.readInt16LE = function readInt16LE(
                    offset,
                    noAssert
                ) {
                    offset = offset >>> 0;
                    if (!noAssert) checkOffset(offset, 2, this.length);
                    var val = this[offset] | (this[offset + 1] << 8);
                    return val & 0x8000 ? val | 0xffff0000 : val;
                };

                Buffer.prototype.readInt16BE = function readInt16BE(
                    offset,
                    noAssert
                ) {
                    offset = offset >>> 0;
                    if (!noAssert) checkOffset(offset, 2, this.length);
                    var val = this[offset + 1] | (this[offset] << 8);
                    return val & 0x8000 ? val | 0xffff0000 : val;
                };

                Buffer.prototype.readInt32LE = function readInt32LE(
                    offset,
                    noAssert
                ) {
                    offset = offset >>> 0;
                    if (!noAssert) checkOffset(offset, 4, this.length);

                    return (
                        this[offset] |
                        (this[offset + 1] << 8) |
                        (this[offset + 2] << 16) |
                        (this[offset + 3] << 24)
                    );
                };

                Buffer.prototype.readInt32BE = function readInt32BE(
                    offset,
                    noAssert
                ) {
                    offset = offset >>> 0;
                    if (!noAssert) checkOffset(offset, 4, this.length);

                    return (
                        (this[offset] << 24) |
                        (this[offset + 1] << 16) |
                        (this[offset + 2] << 8) |
                        this[offset + 3]
                    );
                };

                Buffer.prototype.readFloatLE = function readFloatLE(
                    offset,
                    noAssert
                ) {
                    offset = offset >>> 0;
                    if (!noAssert) checkOffset(offset, 4, this.length);
                    return ieee754.read(this, offset, true, 23, 4);
                };

                Buffer.prototype.readFloatBE = function readFloatBE(
                    offset,
                    noAssert
                ) {
                    offset = offset >>> 0;
                    if (!noAssert) checkOffset(offset, 4, this.length);
                    return ieee754.read(this, offset, false, 23, 4);
                };

                Buffer.prototype.readDoubleLE = function readDoubleLE(
                    offset,
                    noAssert
                ) {
                    offset = offset >>> 0;
                    if (!noAssert) checkOffset(offset, 8, this.length);
                    return ieee754.read(this, offset, true, 52, 8);
                };

                Buffer.prototype.readDoubleBE = function readDoubleBE(
                    offset,
                    noAssert
                ) {
                    offset = offset >>> 0;
                    if (!noAssert) checkOffset(offset, 8, this.length);
                    return ieee754.read(this, offset, false, 52, 8);
                };

                function checkInt(buf, value, offset, ext, max, min) {
                    if (!Buffer.isBuffer(buf))
                        throw new TypeError(
                            '"buffer" argument must be a Buffer instance'
                        );
                    if (value > max || value < min)
                        throw new RangeError(
                            '"value" argument is out of bounds'
                        );
                    if (offset + ext > buf.length)
                        throw new RangeError('Index out of range');
                }

                Buffer.prototype.writeUIntLE = function writeUIntLE(
                    value,
                    offset,
                    byteLength,
                    noAssert
                ) {
                    value = +value;
                    offset = offset >>> 0;
                    byteLength = byteLength >>> 0;
                    if (!noAssert) {
                        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
                        checkInt(this, value, offset, byteLength, maxBytes, 0);
                    }

                    var mul = 1;
                    var i = 0;
                    this[offset] = value & 0xff;
                    while (++i < byteLength && (mul *= 0x100)) {
                        this[offset + i] = (value / mul) & 0xff;
                    }

                    return offset + byteLength;
                };

                Buffer.prototype.writeUIntBE = function writeUIntBE(
                    value,
                    offset,
                    byteLength,
                    noAssert
                ) {
                    value = +value;
                    offset = offset >>> 0;
                    byteLength = byteLength >>> 0;
                    if (!noAssert) {
                        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
                        checkInt(this, value, offset, byteLength, maxBytes, 0);
                    }

                    var i = byteLength - 1;
                    var mul = 1;
                    this[offset + i] = value & 0xff;
                    while (--i >= 0 && (mul *= 0x100)) {
                        this[offset + i] = (value / mul) & 0xff;
                    }

                    return offset + byteLength;
                };

                Buffer.prototype.writeUInt8 = function writeUInt8(
                    value,
                    offset,
                    noAssert
                ) {
                    value = +value;
                    offset = offset >>> 0;
                    if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
                    this[offset] = value & 0xff;
                    return offset + 1;
                };

                Buffer.prototype.writeUInt16LE = function writeUInt16LE(
                    value,
                    offset,
                    noAssert
                ) {
                    value = +value;
                    offset = offset >>> 0;
                    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
                    this[offset] = value & 0xff;
                    this[offset + 1] = value >>> 8;
                    return offset + 2;
                };

                Buffer.prototype.writeUInt16BE = function writeUInt16BE(
                    value,
                    offset,
                    noAssert
                ) {
                    value = +value;
                    offset = offset >>> 0;
                    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
                    this[offset] = value >>> 8;
                    this[offset + 1] = value & 0xff;
                    return offset + 2;
                };

                Buffer.prototype.writeUInt32LE = function writeUInt32LE(
                    value,
                    offset,
                    noAssert
                ) {
                    value = +value;
                    offset = offset >>> 0;
                    if (!noAssert)
                        checkInt(this, value, offset, 4, 0xffffffff, 0);
                    this[offset + 3] = value >>> 24;
                    this[offset + 2] = value >>> 16;
                    this[offset + 1] = value >>> 8;
                    this[offset] = value & 0xff;
                    return offset + 4;
                };

                Buffer.prototype.writeUInt32BE = function writeUInt32BE(
                    value,
                    offset,
                    noAssert
                ) {
                    value = +value;
                    offset = offset >>> 0;
                    if (!noAssert)
                        checkInt(this, value, offset, 4, 0xffffffff, 0);
                    this[offset] = value >>> 24;
                    this[offset + 1] = value >>> 16;
                    this[offset + 2] = value >>> 8;
                    this[offset + 3] = value & 0xff;
                    return offset + 4;
                };

                Buffer.prototype.writeIntLE = function writeIntLE(
                    value,
                    offset,
                    byteLength,
                    noAssert
                ) {
                    value = +value;
                    offset = offset >>> 0;
                    if (!noAssert) {
                        var limit = Math.pow(2, 8 * byteLength - 1);

                        checkInt(
                            this,
                            value,
                            offset,
                            byteLength,
                            limit - 1,
                            -limit
                        );
                    }

                    var i = 0;
                    var mul = 1;
                    var sub = 0;
                    this[offset] = value & 0xff;
                    while (++i < byteLength && (mul *= 0x100)) {
                        if (
                            value < 0 &&
                            sub === 0 &&
                            this[offset + i - 1] !== 0
                        ) {
                            sub = 1;
                        }
                        this[offset + i] = (((value / mul) >> 0) - sub) & 0xff;
                    }

                    return offset + byteLength;
                };

                Buffer.prototype.writeIntBE = function writeIntBE(
                    value,
                    offset,
                    byteLength,
                    noAssert
                ) {
                    value = +value;
                    offset = offset >>> 0;
                    if (!noAssert) {
                        var limit = Math.pow(2, 8 * byteLength - 1);

                        checkInt(
                            this,
                            value,
                            offset,
                            byteLength,
                            limit - 1,
                            -limit
                        );
                    }

                    var i = byteLength - 1;
                    var mul = 1;
                    var sub = 0;
                    this[offset + i] = value & 0xff;
                    while (--i >= 0 && (mul *= 0x100)) {
                        if (
                            value < 0 &&
                            sub === 0 &&
                            this[offset + i + 1] !== 0
                        ) {
                            sub = 1;
                        }
                        this[offset + i] = (((value / mul) >> 0) - sub) & 0xff;
                    }

                    return offset + byteLength;
                };

                Buffer.prototype.writeInt8 = function writeInt8(
                    value,
                    offset,
                    noAssert
                ) {
                    value = +value;
                    offset = offset >>> 0;
                    if (!noAssert)
                        checkInt(this, value, offset, 1, 0x7f, -0x80);
                    if (value < 0) value = 0xff + value + 1;
                    this[offset] = value & 0xff;
                    return offset + 1;
                };

                Buffer.prototype.writeInt16LE = function writeInt16LE(
                    value,
                    offset,
                    noAssert
                ) {
                    value = +value;
                    offset = offset >>> 0;
                    if (!noAssert)
                        checkInt(this, value, offset, 2, 0x7fff, -0x8000);
                    this[offset] = value & 0xff;
                    this[offset + 1] = value >>> 8;
                    return offset + 2;
                };

                Buffer.prototype.writeInt16BE = function writeInt16BE(
                    value,
                    offset,
                    noAssert
                ) {
                    value = +value;
                    offset = offset >>> 0;
                    if (!noAssert)
                        checkInt(this, value, offset, 2, 0x7fff, -0x8000);
                    this[offset] = value >>> 8;
                    this[offset + 1] = value & 0xff;
                    return offset + 2;
                };

                Buffer.prototype.writeInt32LE = function writeInt32LE(
                    value,
                    offset,
                    noAssert
                ) {
                    value = +value;
                    offset = offset >>> 0;
                    if (!noAssert)
                        checkInt(
                            this,
                            value,
                            offset,
                            4,
                            0x7fffffff,
                            -0x80000000
                        );
                    this[offset] = value & 0xff;
                    this[offset + 1] = value >>> 8;
                    this[offset + 2] = value >>> 16;
                    this[offset + 3] = value >>> 24;
                    return offset + 4;
                };

                Buffer.prototype.writeInt32BE = function writeInt32BE(
                    value,
                    offset,
                    noAssert
                ) {
                    value = +value;
                    offset = offset >>> 0;
                    if (!noAssert)
                        checkInt(
                            this,
                            value,
                            offset,
                            4,
                            0x7fffffff,
                            -0x80000000
                        );
                    if (value < 0) value = 0xffffffff + value + 1;
                    this[offset] = value >>> 24;
                    this[offset + 1] = value >>> 16;
                    this[offset + 2] = value >>> 8;
                    this[offset + 3] = value & 0xff;
                    return offset + 4;
                };

                function checkIEEE754(buf, value, offset, ext, max, min) {
                    if (offset + ext > buf.length)
                        throw new RangeError('Index out of range');
                    if (offset < 0) throw new RangeError('Index out of range');
                }

                function writeFloat(
                    buf,
                    value,
                    offset,
                    littleEndian,
                    noAssert
                ) {
                    value = +value;
                    offset = offset >>> 0;
                    if (!noAssert) {
                        checkIEEE754(
                            buf,
                            value,
                            offset,
                            4,
                            3.4028234663852886e38,
                            -3.4028234663852886e38
                        );
                    }
                    ieee754.write(buf, value, offset, littleEndian, 23, 4);
                    return offset + 4;
                }

                Buffer.prototype.writeFloatLE = function writeFloatLE(
                    value,
                    offset,
                    noAssert
                ) {
                    return writeFloat(this, value, offset, true, noAssert);
                };

                Buffer.prototype.writeFloatBE = function writeFloatBE(
                    value,
                    offset,
                    noAssert
                ) {
                    return writeFloat(this, value, offset, false, noAssert);
                };

                function writeDouble(
                    buf,
                    value,
                    offset,
                    littleEndian,
                    noAssert
                ) {
                    value = +value;
                    offset = offset >>> 0;
                    if (!noAssert) {
                        checkIEEE754(
                            buf,
                            value,
                            offset,
                            8,
                            1.7976931348623157e308,
                            -1.7976931348623157e308
                        );
                    }
                    ieee754.write(buf, value, offset, littleEndian, 52, 8);
                    return offset + 8;
                }

                Buffer.prototype.writeDoubleLE = function writeDoubleLE(
                    value,
                    offset,
                    noAssert
                ) {
                    return writeDouble(this, value, offset, true, noAssert);
                };

                Buffer.prototype.writeDoubleBE = function writeDoubleBE(
                    value,
                    offset,
                    noAssert
                ) {
                    return writeDouble(this, value, offset, false, noAssert);
                };

                // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
                Buffer.prototype.copy = function copy(
                    target,
                    targetStart,
                    start,
                    end
                ) {
                    if (!start) start = 0;
                    if (!end && end !== 0) end = this.length;
                    if (targetStart >= target.length)
                        targetStart = target.length;
                    if (!targetStart) targetStart = 0;
                    if (end > 0 && end < start) end = start;

                    // Copy 0 bytes; we're done
                    if (end === start) return 0;
                    if (target.length === 0 || this.length === 0) return 0;

                    // Fatal error conditions
                    if (targetStart < 0) {
                        throw new RangeError('targetStart out of bounds');
                    }
                    if (start < 0 || start >= this.length)
                        throw new RangeError('sourceStart out of bounds');
                    if (end < 0)
                        throw new RangeError('sourceEnd out of bounds');

                    // Are we oob?
                    if (end > this.length) end = this.length;
                    if (target.length - targetStart < end - start) {
                        end = target.length - targetStart + start;
                    }

                    var len = end - start;
                    var i;

                    if (
                        this === target &&
                        start < targetStart &&
                        targetStart < end
                    ) {
                        // descending copy from end
                        for (i = len - 1; i >= 0; --i) {
                            target[i + targetStart] = this[i + start];
                        }
                    } else if (len < 1000) {
                        // ascending copy from start
                        for (i = 0; i < len; ++i) {
                            target[i + targetStart] = this[i + start];
                        }
                    } else {
                        Uint8Array.prototype.set.call(
                            target,
                            this.subarray(start, start + len),
                            targetStart
                        );
                    }

                    return len;
                };

                // Usage:
                //    buffer.fill(number[, offset[, end]])
                //    buffer.fill(buffer[, offset[, end]])
                //    buffer.fill(string[, offset[, end]][, encoding])
                Buffer.prototype.fill = function fill(
                    val,
                    start,
                    end,
                    encoding
                ) {
                    // Handle string cases:
                    if (typeof val === 'string') {
                        if (typeof start === 'string') {
                            encoding = start;
                            start = 0;
                            end = this.length;
                        } else if (typeof end === 'string') {
                            encoding = end;
                            end = this.length;
                        }
                        if (val.length === 1) {
                            var code = val.charCodeAt(0);
                            if (code < 256) {
                                val = code;
                            }
                        }
                        if (
                            encoding !== undefined &&
                            typeof encoding !== 'string'
                        ) {
                            throw new TypeError('encoding must be a string');
                        }
                        if (
                            typeof encoding === 'string' &&
                            !Buffer.isEncoding(encoding)
                        ) {
                            throw new TypeError(
                                'Unknown encoding: ' + encoding
                            );
                        }
                    } else if (typeof val === 'number') {
                        val = val & 255;
                    }

                    // Invalid ranges are not set to a default, so can range check early.
                    if (start < 0 || this.length < start || this.length < end) {
                        throw new RangeError('Out of range index');
                    }

                    if (end <= start) {
                        return this;
                    }

                    start = start >>> 0;
                    end = end === undefined ? this.length : end >>> 0;

                    if (!val) val = 0;

                    var i;
                    if (typeof val === 'number') {
                        for (i = start; i < end; ++i) {
                            this[i] = val;
                        }
                    } else {
                        var bytes = Buffer.isBuffer(val)
                            ? val
                            : new Buffer(val, encoding);
                        var len = bytes.length;
                        for (i = 0; i < end - start; ++i) {
                            this[i + start] = bytes[i % len];
                        }
                    }

                    return this;
                };

                // HELPER FUNCTIONS
                // ================

                var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;

                function base64clean(str) {
                    // Node strips out invalid characters like \n and \t from the string, base64-js does not
                    str = str.trim().replace(INVALID_BASE64_RE, '');
                    // Node converts strings with length < 2 to ''
                    if (str.length < 2) return '';
                    // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
                    while (str.length % 4 !== 0) {
                        str = str + '=';
                    }
                    return str;
                }

                function toHex(n) {
                    if (n < 16) return '0' + n.toString(16);
                    return n.toString(16);
                }

                function utf8ToBytes(string, units) {
                    units = units || Infinity;
                    var codePoint;
                    var length = string.length;
                    var leadSurrogate = null;
                    var bytes = [];

                    for (var i = 0; i < length; ++i) {
                        codePoint = string.charCodeAt(i);

                        // is surrogate component
                        if (codePoint > 0xd7ff && codePoint < 0xe000) {
                            // last char was a lead
                            if (!leadSurrogate) {
                                // no lead yet
                                if (codePoint > 0xdbff) {
                                    // unexpected trail
                                    if ((units -= 3) > -1)
                                        bytes.push(0xef, 0xbf, 0xbd);
                                    continue;
                                } else if (i + 1 === length) {
                                    // unpaired lead
                                    if ((units -= 3) > -1)
                                        bytes.push(0xef, 0xbf, 0xbd);
                                    continue;
                                }

                                // valid lead
                                leadSurrogate = codePoint;

                                continue;
                            }

                            // 2 leads in a row
                            if (codePoint < 0xdc00) {
                                if ((units -= 3) > -1)
                                    bytes.push(0xef, 0xbf, 0xbd);
                                leadSurrogate = codePoint;
                                continue;
                            }

                            // valid surrogate pair
                            codePoint =
                                (((leadSurrogate - 0xd800) << 10) |
                                    (codePoint - 0xdc00)) +
                                0x10000;
                        } else if (leadSurrogate) {
                            // valid bmp char, but last char was a lead
                            if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
                        }

                        leadSurrogate = null;

                        // encode utf8
                        if (codePoint < 0x80) {
                            if ((units -= 1) < 0) break;
                            bytes.push(codePoint);
                        } else if (codePoint < 0x800) {
                            if ((units -= 2) < 0) break;
                            bytes.push(
                                (codePoint >> 0x6) | 0xc0,
                                (codePoint & 0x3f) | 0x80
                            );
                        } else if (codePoint < 0x10000) {
                            if ((units -= 3) < 0) break;
                            bytes.push(
                                (codePoint >> 0xc) | 0xe0,
                                ((codePoint >> 0x6) & 0x3f) | 0x80,
                                (codePoint & 0x3f) | 0x80
                            );
                        } else if (codePoint < 0x110000) {
                            if ((units -= 4) < 0) break;
                            bytes.push(
                                (codePoint >> 0x12) | 0xf0,
                                ((codePoint >> 0xc) & 0x3f) | 0x80,
                                ((codePoint >> 0x6) & 0x3f) | 0x80,
                                (codePoint & 0x3f) | 0x80
                            );
                        } else {
                            throw new Error('Invalid code point');
                        }
                    }

                    return bytes;
                }

                function asciiToBytes(str) {
                    var byteArray = [];
                    for (var i = 0; i < str.length; ++i) {
                        // Node's code seems to be doing this and not & 0x7F..
                        byteArray.push(str.charCodeAt(i) & 0xff);
                    }
                    return byteArray;
                }

                function utf16leToBytes(str, units) {
                    var c, hi, lo;
                    var byteArray = [];
                    for (var i = 0; i < str.length; ++i) {
                        if ((units -= 2) < 0) break;

                        c = str.charCodeAt(i);
                        hi = c >> 8;
                        lo = c % 256;
                        byteArray.push(lo);
                        byteArray.push(hi);
                    }

                    return byteArray;
                }

                function base64ToBytes(str) {
                    return base64.toByteArray(base64clean(str));
                }

                function blitBuffer(src, dst, offset, length) {
                    for (var i = 0; i < length; ++i) {
                        if (i + offset >= dst.length || i >= src.length) break;
                        dst[i + offset] = src[i];
                    }
                    return i;
                }

                // ArrayBuffers from another context (i.e. an iframe) do not pass the `instanceof` check
                // but they should be treated as valid. See: https://github.com/feross/buffer/issues/166
                function isArrayBuffer(obj) {
                    return (
                        obj instanceof ArrayBuffer ||
                        (obj != null &&
                            obj.constructor != null &&
                            obj.constructor.name === 'ArrayBuffer' &&
                            typeof obj.byteLength === 'number')
                    );
                }

                // Node 0.10 supports `ArrayBuffer` but lacks `ArrayBuffer.isView`
                function isArrayBufferView(obj) {
                    return (
                        typeof ArrayBuffer.isView === 'function' &&
                        ArrayBuffer.isView(obj)
                    );
                }

                function numberIsNaN(obj) {
                    return obj !== obj; // eslint-disable-line no-self-compare
                }
            },
            { 'base64-js': 31, ieee754: 100 }
        ],
        34: [
            function(require, module, exports) {
                (function(Buffer) {
                    // Copyright Joyent, Inc. and other Node contributors.
                    //
                    // Permission is hereby granted, free of charge, to any person obtaining a
                    // copy of this software and associated documentation files (the
                    // "Software"), to deal in the Software without restriction, including
                    // without limitation the rights to use, copy, modify, merge, publish,
                    // distribute, sublicense, and/or sell copies of the Software, and to permit
                    // persons to whom the Software is furnished to do so, subject to the
                    // following conditions:
                    //
                    // The above copyright notice and this permission notice shall be included
                    // in all copies or substantial portions of the Software.
                    //
                    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
                    // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
                    // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
                    // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
                    // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
                    // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
                    // USE OR OTHER DEALINGS IN THE SOFTWARE.

                    // NOTE: These type checking functions intentionally don't use `instanceof`
                    // because it is fragile and can be easily faked with `Object.create()`.

                    function isArray(arg) {
                        if (Array.isArray) {
                            return Array.isArray(arg);
                        }
                        return objectToString(arg) === '[object Array]';
                    }
                    exports.isArray = isArray;

                    function isBoolean(arg) {
                        return typeof arg === 'boolean';
                    }
                    exports.isBoolean = isBoolean;

                    function isNull(arg) {
                        return arg === null;
                    }
                    exports.isNull = isNull;

                    function isNullOrUndefined(arg) {
                        return arg == null;
                    }
                    exports.isNullOrUndefined = isNullOrUndefined;

                    function isNumber(arg) {
                        return typeof arg === 'number';
                    }
                    exports.isNumber = isNumber;

                    function isString(arg) {
                        return typeof arg === 'string';
                    }
                    exports.isString = isString;

                    function isSymbol(arg) {
                        return typeof arg === 'symbol';
                    }
                    exports.isSymbol = isSymbol;

                    function isUndefined(arg) {
                        return arg === void 0;
                    }
                    exports.isUndefined = isUndefined;

                    function isRegExp(re) {
                        return objectToString(re) === '[object RegExp]';
                    }
                    exports.isRegExp = isRegExp;

                    function isObject(arg) {
                        return typeof arg === 'object' && arg !== null;
                    }
                    exports.isObject = isObject;

                    function isDate(d) {
                        return objectToString(d) === '[object Date]';
                    }
                    exports.isDate = isDate;

                    function isError(e) {
                        return (
                            objectToString(e) === '[object Error]' ||
                            e instanceof Error
                        );
                    }
                    exports.isError = isError;

                    function isFunction(arg) {
                        return typeof arg === 'function';
                    }
                    exports.isFunction = isFunction;

                    function isPrimitive(arg) {
                        return (
                            arg === null ||
                            typeof arg === 'boolean' ||
                            typeof arg === 'number' ||
                            typeof arg === 'string' ||
                            typeof arg === 'symbol' || // ES6 symbol
                            typeof arg === 'undefined'
                        );
                    }
                    exports.isPrimitive = isPrimitive;

                    exports.isBuffer = Buffer.isBuffer;

                    function objectToString(o) {
                        return Object.prototype.toString.call(o);
                    }
                }.call(this, {
                    isBuffer: require('../../is-buffer/index.js')
                }));
            },
            { '../../is-buffer/index.js': 102 }
        ],
        35: [
            function(require, module, exports) {
                module.exports = language;

                var tokenizer = require('./tokenizer');

                function language(lookups, matchComparison) {
                    return function(selector) {
                        return parse(
                            selector,
                            remap(lookups),
                            matchComparison || caseSensitiveComparison
                        );
                    };
                }

                function remap(opts) {
                    for (var key in opts)
                        if (opt_okay(opts, key)) {
                            opts[key] = Function(
                                'return function(node, attr) { return node.' +
                                    opts[key] +
                                    ' }'
                            );
                            opts[key] = opts[key]();
                        }

                    return opts;
                }

                function opt_okay(opts, key) {
                    return (
                        opts.hasOwnProperty(key) &&
                        typeof opts[key] === 'string'
                    );
                }

                function parse(selector, options, matchComparison) {
                    var stream = tokenizer(),
                        default_subj = true,
                        selectors = [[]],
                        traversal,
                        bits;

                    bits = selectors[0];

                    traversal = {
                        '': any_parents,
                        '>': direct_parent,
                        '+': direct_sibling,
                        '~': any_sibling
                    };

                    stream.on('data', group).end(selector);

                    function group(token) {
                        var crnt;

                        if (token.type === 'comma') {
                            selectors.unshift((bits = []));

                            return;
                        }

                        if (token.type === 'op' || token.type === 'any-child') {
                            bits.unshift(traversal[token.data]);
                            bits.unshift(check());

                            return;
                        }

                        bits[0] = bits[0] || check();
                        crnt = bits[0];

                        if (token.type === '!') {
                            crnt.subject = selectors[0].subject = true;

                            return;
                        }

                        crnt.push(
                            token.type === 'class'
                                ? listContains(token.type, token.data)
                                : token.type === 'attr'
                                  ? attr(token)
                                  : token.type === ':' || token.type === '::'
                                    ? pseudo(token)
                                    : token.type === '*'
                                      ? Boolean
                                      : matches(
                                            token.type,
                                            token.data,
                                            matchComparison
                                        )
                        );
                    }

                    return selector_fn;

                    function selector_fn(node, as_boolean) {
                        var current, length, orig, subj, set;

                        orig = node;
                        set = [];

                        for (var i = 0, len = selectors.length; i < len; ++i) {
                            bits = selectors[i];
                            current = entry;
                            length = bits.length;
                            node = orig;
                            subj = [];

                            for (var j = 0; j < length; j += 2) {
                                node = current(node, bits[j], subj);

                                if (!node) {
                                    break;
                                }

                                current = bits[j + 1];
                            }

                            if (j >= length) {
                                if (as_boolean) {
                                    return true;
                                }

                                add(!bits.subject ? [orig] : subj);
                            }
                        }

                        if (as_boolean) {
                            return false;
                        }

                        return !set.length
                            ? false
                            : set.length === 1 ? set[0] : set;

                        function add(items) {
                            var next;

                            while (items.length) {
                                next = items.shift();

                                if (set.indexOf(next) === -1) {
                                    set.push(next);
                                }
                            }
                        }
                    }

                    function check() {
                        _check.bits = [];
                        _check.subject = false;
                        _check.push = function(token) {
                            _check.bits.push(token);
                        };

                        return _check;

                        function _check(node, subj) {
                            for (
                                var i = 0, len = _check.bits.length;
                                i < len;
                                ++i
                            ) {
                                if (!_check.bits[i](node)) {
                                    return false;
                                }
                            }

                            if (_check.subject) {
                                subj.push(node);
                            }

                            return true;
                        }
                    }

                    function listContains(type, data) {
                        return function(node) {
                            var val = options[type](node);
                            val = Array.isArray(val)
                                ? val
                                : val ? val.toString().split(/\s+/) : [];
                            return val.indexOf(data) >= 0;
                        };
                    }

                    function attr(token) {
                        return token.data.lhs
                            ? valid_attr(
                                  options.attr,
                                  token.data.lhs,
                                  token.data.cmp,
                                  token.data.rhs
                              )
                            : valid_attr(options.attr, token.data);
                    }

                    function matches(type, data, matchComparison) {
                        return function(node) {
                            return matchComparison(
                                type,
                                options[type](node),
                                data
                            );
                        };
                    }

                    function any_parents(node, next, subj) {
                        do {
                            node = options.parent(node);
                        } while (node && !next(node, subj));

                        return node;
                    }

                    function direct_parent(node, next, subj) {
                        node = options.parent(node);

                        return node && next(node, subj) ? node : null;
                    }

                    function direct_sibling(node, next, subj) {
                        var parent = options.parent(node),
                            idx = 0,
                            children;

                        children = options.children(parent);

                        for (var i = 0, len = children.length; i < len; ++i) {
                            if (children[i] === node) {
                                idx = i;

                                break;
                            }
                        }

                        return children[idx - 1] &&
                            next(children[idx - 1], subj)
                            ? children[idx - 1]
                            : null;
                    }

                    function any_sibling(node, next, subj) {
                        var parent = options.parent(node),
                            children;

                        children = options.children(parent);

                        for (var i = 0, len = children.length; i < len; ++i) {
                            if (children[i] === node) {
                                return null;
                            }

                            if (next(children[i], subj)) {
                                return children[i];
                            }
                        }

                        return null;
                    }

                    function pseudo(token) {
                        return valid_pseudo(
                            options,
                            token.data,
                            matchComparison
                        );
                    }
                }

                function entry(node, next, subj) {
                    return next(node, subj) ? node : null;
                }

                function valid_pseudo(options, match, matchComparison) {
                    switch (match) {
                        case 'empty':
                            return valid_empty(options);
                        case 'first-child':
                            return valid_first_child(options);
                        case 'last-child':
                            return valid_last_child(options);
                        case 'root':
                            return valid_root(options);
                    }

                    if (match.indexOf('contains') === 0) {
                        return valid_contains(options, match.slice(9, -1));
                    }

                    if (match.indexOf('any') === 0) {
                        return valid_any_match(
                            options,
                            match.slice(4, -1),
                            matchComparison
                        );
                    }

                    if (match.indexOf('not') === 0) {
                        return valid_not_match(
                            options,
                            match.slice(4, -1),
                            matchComparison
                        );
                    }

                    if (match.indexOf('nth-child') === 0) {
                        return valid_nth_child(options, match.slice(10, -1));
                    }

                    return function() {
                        return false;
                    };
                }

                function valid_not_match(options, selector, matchComparison) {
                    var fn = parse(selector, options, matchComparison);

                    return not_function;

                    function not_function(node) {
                        return !fn(node, true);
                    }
                }

                function valid_any_match(options, selector, matchComparison) {
                    var fn = parse(selector, options, matchComparison);

                    return fn;
                }

                function valid_attr(fn, lhs, cmp, rhs) {
                    return function(node) {
                        var attr = fn(node, lhs);

                        if (!cmp) {
                            return !!attr;
                        }

                        if (cmp.length === 1) {
                            return attr == rhs;
                        }

                        if (attr === void 0 || attr === null) {
                            return false;
                        }

                        return checkattr[cmp.charAt(0)](attr, rhs);
                    };
                }

                function valid_first_child(options) {
                    return function(node) {
                        return (
                            options.children(options.parent(node))[0] === node
                        );
                    };
                }

                function valid_last_child(options) {
                    return function(node) {
                        var children = options.children(options.parent(node));

                        return children[children.length - 1] === node;
                    };
                }

                function valid_empty(options) {
                    return function(node) {
                        return options.children(node).length === 0;
                    };
                }

                function valid_root(options) {
                    return function(node) {
                        return !options.parent(node);
                    };
                }

                function valid_contains(options, contents) {
                    return function(node) {
                        return options.contents(node).indexOf(contents) !== -1;
                    };
                }

                function valid_nth_child(options, nth) {
                    var test = function() {
                        return false;
                    };
                    if (nth == 'odd') {
                        nth = '2n+1';
                    } else if (nth == 'even') {
                        nth = '2n';
                    }
                    var regexp = /( ?([-|\+])?(\d*)n)? ?((\+|-)? ?(\d+))? ?/;
                    var matches = nth.match(regexp);
                    if (matches) {
                        var growth = 0;
                        if (matches[1]) {
                            var positiveGrowth = matches[2] != '-';
                            growth = parseInt(
                                matches[3] == '' ? 1 : matches[3]
                            );
                            growth = growth * (positiveGrowth ? 1 : -1);
                        }
                        var offset = 0;
                        if (matches[4]) {
                            offset = parseInt(matches[6]);
                            var positiveOffset = matches[5] != '-';
                            offset = offset * (positiveOffset ? 1 : -1);
                        }
                        if (growth == 0) {
                            if (offset != 0) {
                                test = function(children, node) {
                                    return children[offset - 1] === node;
                                };
                            }
                        } else {
                            test = function(children, node) {
                                var validPositions = [];
                                var len = children.length;
                                for (
                                    var position = 1;
                                    position <= len;
                                    position++
                                ) {
                                    var divisible =
                                        (position - offset) % growth == 0;
                                    if (divisible) {
                                        if (growth > 0) {
                                            validPositions.push(position);
                                        } else {
                                            if (
                                                (position - offset) / growth >=
                                                0
                                            ) {
                                                validPositions.push(position);
                                            }
                                        }
                                    }
                                }
                                for (
                                    var i = 0;
                                    i < validPositions.length;
                                    i++
                                ) {
                                    if (
                                        children[validPositions[i] - 1] === node
                                    ) {
                                        return true;
                                    }
                                }
                                return false;
                            };
                        }
                    }
                    return function(node) {
                        var children = options.children(options.parent(node));

                        return test(children, node);
                    };
                }

                var checkattr = {
                    $: check_end,
                    '^': check_beg,
                    '*': check_any,
                    '~': check_spc,
                    '|': check_dsh
                };

                function check_end(l, r) {
                    return l.slice(l.length - r.length) === r;
                }

                function check_beg(l, r) {
                    return l.slice(0, r.length) === r;
                }

                function check_any(l, r) {
                    return l.indexOf(r) > -1;
                }

                function check_spc(l, r) {
                    return l.split(/\s+/).indexOf(r) > -1;
                }

                function check_dsh(l, r) {
                    return l.split('-').indexOf(r) > -1;
                }

                function caseSensitiveComparison(type, pattern, data) {
                    return pattern === data;
                }
            },
            { './tokenizer': 36 }
        ],
        36: [
            function(require, module, exports) {
                module.exports = tokenize;

                var through = require('through');

                var PSEUDOSTART = 'pseudo-start',
                    ATTR_START = 'attr-start',
                    ANY_CHILD = 'any-child',
                    ATTR_COMP = 'attr-comp',
                    ATTR_END = 'attr-end',
                    PSEUDOPSEUDO = '::',
                    PSEUDOCLASS = ':',
                    READY = '(ready)',
                    OPERATION = 'op',
                    CLASS = 'class',
                    COMMA = 'comma',
                    ATTR = 'attr',
                    SUBJECT = '!',
                    TAG = 'tag',
                    STAR = '*',
                    ID = 'id';

                function tokenize() {
                    var escaped = false,
                        gathered = [],
                        state = READY,
                        data = [],
                        idx = 0,
                        stream,
                        length,
                        quote,
                        depth,
                        lhs,
                        rhs,
                        cmp,
                        c;

                    return (stream = through(ondata, onend));

                    function ondata(chunk) {
                        data = data.concat(chunk.split(''));
                        length = data.length;

                        while (idx < length && (c = data[idx++])) {
                            switch (state) {
                                case READY:
                                    state_ready();
                                    break;
                                case ANY_CHILD:
                                    state_any_child();
                                    break;
                                case OPERATION:
                                    state_op();
                                    break;
                                case ATTR_START:
                                    state_attr_start();
                                    break;
                                case ATTR_COMP:
                                    state_attr_compare();
                                    break;
                                case ATTR_END:
                                    state_attr_end();
                                    break;
                                case PSEUDOCLASS:
                                case PSEUDOPSEUDO:
                                    state_pseudo();
                                    break;
                                case PSEUDOSTART:
                                    state_pseudostart();
                                    break;
                                case ID:
                                case TAG:
                                case CLASS:
                                    state_gather();
                                    break;
                            }
                        }

                        data = data.slice(idx);
                    }

                    function onend(chunk) {
                        if (arguments.length) {
                            ondata(chunk);
                        }

                        if (gathered.length) {
                            stream.queue(token());
                        }
                    }

                    function state_ready() {
                        switch (true) {
                            case '#' === c:
                                state = ID;
                                break;
                            case '.' === c:
                                state = CLASS;
                                break;
                            case ':' === c:
                                state = PSEUDOCLASS;
                                break;
                            case '[' === c:
                                state = ATTR_START;
                                break;
                            case '!' === c:
                                subject();
                                break;
                            case '*' === c:
                                star();
                                break;
                            case ',' === c:
                                comma();
                                break;
                            case /[>\+~]/.test(c):
                                state = OPERATION;
                                break;
                            case /\s/.test(c):
                                state = ANY_CHILD;
                                break;
                            case /[\w\d\-_]/.test(c):
                                state = TAG;
                                --idx;
                                break;
                        }
                    }

                    function subject() {
                        state = SUBJECT;
                        gathered = ['!'];
                        stream.queue(token());
                        state = READY;
                    }

                    function star() {
                        state = STAR;
                        gathered = ['*'];
                        stream.queue(token());
                        state = READY;
                    }

                    function comma() {
                        state = COMMA;
                        gathered = [','];
                        stream.queue(token());
                        state = READY;
                    }

                    function state_op() {
                        if (/[>\+~]/.test(c)) {
                            return gathered.push(c);
                        }

                        // chomp down the following whitespace.
                        if (/\s/.test(c)) {
                            return;
                        }

                        stream.queue(token());
                        state = READY;
                        --idx;
                    }

                    function state_any_child() {
                        if (/\s/.test(c)) {
                            return;
                        }

                        if (/[>\+~]/.test(c)) {
                            return --idx, (state = OPERATION);
                        }

                        stream.queue(token());
                        state = READY;
                        --idx;
                    }

                    function state_pseudo() {
                        rhs = state;
                        state_gather(true);

                        if (state !== READY) {
                            return;
                        }

                        if (c === '(') {
                            lhs = gathered.join('');
                            state = PSEUDOSTART;
                            gathered.length = 0;
                            depth = 1;
                            ++idx;

                            return;
                        }

                        state = PSEUDOCLASS;
                        stream.queue(token());
                        state = READY;
                    }

                    function state_pseudostart() {
                        if (gathered.length === 0 && !quote) {
                            quote = /['"]/.test(c) ? c : null;

                            if (quote) {
                                return;
                            }
                        }

                        if (quote) {
                            if (!escaped && c === quote) {
                                quote = null;

                                return;
                            }

                            if (c === '\\') {
                                escaped ? gathered.push(c) : (escaped = true);

                                return;
                            }

                            escaped = false;
                            gathered.push(c);

                            return;
                        }

                        gathered.push(c);

                        if (c === '(') {
                            ++depth;
                        } else if (c === ')') {
                            --depth;
                        }

                        if (!depth) {
                            gathered.pop();
                            stream.queue({
                                type: rhs,
                                data: lhs + '(' + gathered.join('') + ')'
                            });

                            state = READY;
                            lhs = rhs = cmp = null;
                            gathered.length = 0;
                        }

                        return;
                    }

                    function state_attr_start() {
                        state_gather(true);

                        if (state !== READY) {
                            return;
                        }

                        if (c === ']') {
                            state = ATTR;
                            stream.queue(token());
                            state = READY;

                            return;
                        }

                        lhs = gathered.join('');
                        gathered.length = 0;
                        state = ATTR_COMP;
                    }

                    function state_attr_compare() {
                        if (/[=~|$^*]/.test(c)) {
                            gathered.push(c);
                        }

                        if (gathered.length === 2 || c === '=') {
                            cmp = gathered.join('');
                            gathered.length = 0;
                            state = ATTR_END;
                            quote = null;

                            return;
                        }
                    }

                    function state_attr_end() {
                        if (!gathered.length && !quote) {
                            quote = /['"]/.test(c) ? c : null;

                            if (quote) {
                                return;
                            }
                        }

                        if (quote) {
                            if (!escaped && c === quote) {
                                quote = null;

                                return;
                            }

                            if (c === '\\') {
                                if (escaped) {
                                    gathered.push(c);
                                }

                                escaped = !escaped;

                                return;
                            }

                            escaped = false;
                            gathered.push(c);

                            return;
                        }

                        state_gather(true);

                        if (state !== READY) {
                            return;
                        }

                        stream.queue({
                            type: ATTR,
                            data: {
                                lhs: lhs,
                                rhs: gathered.join(''),
                                cmp: cmp
                            }
                        });

                        state = READY;
                        lhs = rhs = cmp = null;
                        gathered.length = 0;

                        return;
                    }

                    function state_gather(quietly) {
                        if (/[^\d\w\-_]/.test(c) && !escaped) {
                            if (c === '\\') {
                                escaped = true;
                            } else {
                                !quietly && stream.queue(token());
                                state = READY;
                                --idx;
                            }

                            return;
                        }

                        escaped = false;
                        gathered.push(c);
                    }

                    function token() {
                        var data = gathered.join('');

                        gathered.length = 0;

                        return {
                            type: state,
                            data: data
                        };
                    }
                }
            },
            { through: 143 }
        ],
        37: [
            function(require, module, exports) {
                'use strict';

                var copy = require('es5-ext/object/copy'),
                    normalizeOptions = require('es5-ext/object/normalize-options'),
                    ensureCallable = require('es5-ext/object/valid-callable'),
                    map = require('es5-ext/object/map'),
                    callable = require('es5-ext/object/valid-callable'),
                    validValue = require('es5-ext/object/valid-value'),
                    bind = Function.prototype.bind,
                    defineProperty = Object.defineProperty,
                    hasOwnProperty = Object.prototype.hasOwnProperty,
                    define;

                define = function(name, desc, options) {
                    var value = validValue(desc) && callable(desc.value),
                        dgs;
                    dgs = copy(desc);
                    delete dgs.writable;
                    delete dgs.value;
                    dgs.get = function() {
                        if (
                            !options.overwriteDefinition &&
                            hasOwnProperty.call(this, name)
                        )
                            return value;
                        desc.value = bind.call(
                            value,
                            options.resolveContext
                                ? options.resolveContext(this)
                                : this
                        );
                        defineProperty(this, name, desc);
                        return this[name];
                    };
                    return dgs;
                };

                module.exports = function(props /*, options*/) {
                    var options = normalizeOptions(arguments[1]);
                    if (options.resolveContext != null)
                        ensureCallable(options.resolveContext);
                    return map(props, function(desc, name) {
                        return define(name, desc, options);
                    });
                };
            },
            {
                'es5-ext/object/copy': 59,
                'es5-ext/object/map': 68,
                'es5-ext/object/normalize-options': 69,
                'es5-ext/object/valid-callable': 74,
                'es5-ext/object/valid-value': 75
            }
        ],
        38: [
            function(require, module, exports) {
                'use strict';

                var assign = require('es5-ext/object/assign'),
                    normalizeOpts = require('es5-ext/object/normalize-options'),
                    isCallable = require('es5-ext/object/is-callable'),
                    contains = require('es5-ext/string/#/contains'),
                    d;

                d = module.exports = function(dscr, value /*, options*/) {
                    var c, e, w, options, desc;
                    if (arguments.length < 2 || typeof dscr !== 'string') {
                        options = value;
                        value = dscr;
                        dscr = null;
                    } else {
                        options = arguments[2];
                    }
                    if (dscr == null) {
                        c = w = true;
                        e = false;
                    } else {
                        c = contains.call(dscr, 'c');
                        e = contains.call(dscr, 'e');
                        w = contains.call(dscr, 'w');
                    }

                    desc = {
                        value: value,
                        configurable: c,
                        enumerable: e,
                        writable: w
                    };
                    return !options
                        ? desc
                        : assign(normalizeOpts(options), desc);
                };

                d.gs = function(dscr, get, set /*, options*/) {
                    var c, e, options, desc;
                    if (typeof dscr !== 'string') {
                        options = set;
                        set = get;
                        get = dscr;
                        dscr = null;
                    } else {
                        options = arguments[3];
                    }
                    if (get == null) {
                        get = undefined;
                    } else if (!isCallable(get)) {
                        options = get;
                        get = set = undefined;
                    } else if (set == null) {
                        set = undefined;
                    } else if (!isCallable(set)) {
                        options = set;
                        set = undefined;
                    }
                    if (dscr == null) {
                        c = true;
                        e = false;
                    } else {
                        c = contains.call(dscr, 'c');
                        e = contains.call(dscr, 'e');
                    }

                    desc = {
                        get: get,
                        set: set,
                        configurable: c,
                        enumerable: e
                    };
                    return !options
                        ? desc
                        : assign(normalizeOpts(options), desc);
                };
            },
            {
                'es5-ext/object/assign': 56,
                'es5-ext/object/is-callable': 62,
                'es5-ext/object/normalize-options': 69,
                'es5-ext/string/#/contains': 76
            }
        ],
        39: [
            function(require, module, exports) {
                // Inspired by Google Closure:
                // http://closure-library.googlecode.com/svn/docs/
                // closure_goog_array_array.js.html#goog.array.clear

                'use strict';

                var value = require('../../object/valid-value');

                module.exports = function() {
                    value(this).length = 0;
                    return this;
                };
            },
            { '../../object/valid-value': 75 }
        ],
        40: [
            function(require, module, exports) {
                'use strict';

                var numberIsNaN = require('../../number/is-nan'),
                    toPosInt = require('../../number/to-pos-integer'),
                    value = require('../../object/valid-value'),
                    indexOf = Array.prototype.indexOf,
                    objHasOwnProperty = Object.prototype.hasOwnProperty,
                    abs = Math.abs,
                    floor = Math.floor;

                module.exports = function(searchElement /*, fromIndex*/) {
                    var i, length, fromIndex, val;
                    if (!numberIsNaN(searchElement))
                        return indexOf.apply(this, arguments);

                    length = toPosInt(value(this).length);
                    fromIndex = arguments[1];
                    if (isNaN(fromIndex)) fromIndex = 0;
                    else if (fromIndex >= 0) fromIndex = floor(fromIndex);
                    else
                        fromIndex =
                            toPosInt(this.length) - floor(abs(fromIndex));

                    for (i = fromIndex; i < length; ++i) {
                        if (objHasOwnProperty.call(this, i)) {
                            val = this[i];
                            if (numberIsNaN(val)) return i; // Jslint: ignore
                        }
                    }
                    return -1;
                };
            },
            {
                '../../number/is-nan': 50,
                '../../number/to-pos-integer': 54,
                '../../object/valid-value': 75
            }
        ],
        41: [
            function(require, module, exports) {
                'use strict';

                module.exports = require('./is-implemented')()
                    ? Array.from
                    : require('./shim');
            },
            { './is-implemented': 42, './shim': 43 }
        ],
        42: [
            function(require, module, exports) {
                'use strict';

                module.exports = function() {
                    var from = Array.from,
                        arr,
                        result;
                    if (typeof from !== 'function') return false;
                    arr = ['raz', 'dwa'];
                    result = from(arr);
                    return Boolean(
                        result && result !== arr && result[1] === 'dwa'
                    );
                };
            },
            {}
        ],
        43: [
            function(require, module, exports) {
                'use strict';

                var iteratorSymbol = require('es6-symbol').iterator,
                    isArguments = require('../../function/is-arguments'),
                    isFunction = require('../../function/is-function'),
                    toPosInt = require('../../number/to-pos-integer'),
                    callable = require('../../object/valid-callable'),
                    validValue = require('../../object/valid-value'),
                    isValue = require('../../object/is-value'),
                    isString = require('../../string/is-string'),
                    isArray = Array.isArray,
                    call = Function.prototype.call,
                    desc = {
                        configurable: true,
                        enumerable: true,
                        writable: true,
                        value: null
                    },
                    defineProperty = Object.defineProperty;

                // eslint-disable-next-line complexity
                module.exports = function(arrayLike /*, mapFn, thisArg*/) {
                    var mapFn = arguments[1],
                        thisArg = arguments[2],
                        Context,
                        i,
                        j,
                        arr,
                        length,
                        code,
                        iterator,
                        result,
                        getIterator,
                        value;

                    arrayLike = Object(validValue(arrayLike));

                    if (isValue(mapFn)) callable(mapFn);
                    if (!this || this === Array || !isFunction(this)) {
                        // Result: Plain array
                        if (!mapFn) {
                            if (isArguments(arrayLike)) {
                                // Source: Arguments
                                length = arrayLike.length;
                                if (length !== 1)
                                    return Array.apply(null, arrayLike);
                                arr = new Array(1);
                                arr[0] = arrayLike[0];
                                return arr;
                            }
                            if (isArray(arrayLike)) {
                                // Source: Array
                                arr = new Array((length = arrayLike.length));
                                for (i = 0; i < length; ++i)
                                    arr[i] = arrayLike[i];
                                return arr;
                            }
                        }
                        arr = [];
                    } else {
                        // Result: Non plain array
                        Context = this;
                    }

                    if (!isArray(arrayLike)) {
                        if (
                            (getIterator = arrayLike[iteratorSymbol]) !==
                            undefined
                        ) {
                            // Source: Iterator
                            iterator = callable(getIterator).call(arrayLike);
                            if (Context) arr = new Context();
                            result = iterator.next();
                            i = 0;
                            while (!result.done) {
                                value = mapFn
                                    ? call.call(mapFn, thisArg, result.value, i)
                                    : result.value;
                                if (Context) {
                                    desc.value = value;
                                    defineProperty(arr, i, desc);
                                } else {
                                    arr[i] = value;
                                }
                                result = iterator.next();
                                ++i;
                            }
                            length = i;
                        } else if (isString(arrayLike)) {
                            // Source: String
                            length = arrayLike.length;
                            if (Context) arr = new Context();
                            for (i = 0, j = 0; i < length; ++i) {
                                value = arrayLike[i];
                                if (i + 1 < length) {
                                    code = value.charCodeAt(0);
                                    // eslint-disable-next-line max-depth
                                    if (code >= 0xd800 && code <= 0xdbff)
                                        value += arrayLike[++i];
                                }
                                value = mapFn
                                    ? call.call(mapFn, thisArg, value, j)
                                    : value;
                                if (Context) {
                                    desc.value = value;
                                    defineProperty(arr, j, desc);
                                } else {
                                    arr[j] = value;
                                }
                                ++j;
                            }
                            length = j;
                        }
                    }
                    if (length === undefined) {
                        // Source: array or array-like
                        length = toPosInt(arrayLike.length);
                        if (Context) arr = new Context(length);
                        for (i = 0; i < length; ++i) {
                            value = mapFn
                                ? call.call(mapFn, thisArg, arrayLike[i], i)
                                : arrayLike[i];
                            if (Context) {
                                desc.value = value;
                                defineProperty(arr, i, desc);
                            } else {
                                arr[i] = value;
                            }
                        }
                    }
                    if (Context) {
                        desc.value = null;
                        arr.length = length;
                    }
                    return arr;
                };
            },
            {
                '../../function/is-arguments': 44,
                '../../function/is-function': 45,
                '../../number/to-pos-integer': 54,
                '../../object/is-value': 64,
                '../../object/valid-callable': 74,
                '../../object/valid-value': 75,
                '../../string/is-string': 79,
                'es6-symbol': 93
            }
        ],
        44: [
            function(require, module, exports) {
                'use strict';

                var objToString = Object.prototype.toString,
                    id = objToString.call(
                        (function() {
                            return arguments;
                        })()
                    );

                module.exports = function(value) {
                    return objToString.call(value) === id;
                };
            },
            {}
        ],
        45: [
            function(require, module, exports) {
                'use strict';

                var objToString = Object.prototype.toString,
                    id = objToString.call(require('./noop'));

                module.exports = function(value) {
                    return (
                        typeof value === 'function' &&
                        objToString.call(value) === id
                    );
                };
            },
            { './noop': 46 }
        ],
        46: [
            function(require, module, exports) {
                'use strict';

                // eslint-disable-next-line no-empty-function
                module.exports = function() {};
            },
            {}
        ],
        47: [
            function(require, module, exports) {
                'use strict';

                module.exports = require('./is-implemented')()
                    ? Math.sign
                    : require('./shim');
            },
            { './is-implemented': 48, './shim': 49 }
        ],
        48: [
            function(require, module, exports) {
                'use strict';

                module.exports = function() {
                    var sign = Math.sign;
                    if (typeof sign !== 'function') return false;
                    return sign(10) === 1 && sign(-20) === -1;
                };
            },
            {}
        ],
        49: [
            function(require, module, exports) {
                'use strict';

                module.exports = function(value) {
                    value = Number(value);
                    if (isNaN(value) || value === 0) return value;
                    return value > 0 ? 1 : -1;
                };
            },
            {}
        ],
        50: [
            function(require, module, exports) {
                'use strict';

                module.exports = require('./is-implemented')()
                    ? Number.isNaN
                    : require('./shim');
            },
            { './is-implemented': 51, './shim': 52 }
        ],
        51: [
            function(require, module, exports) {
                'use strict';

                module.exports = function() {
                    var numberIsNaN = Number.isNaN;
                    if (typeof numberIsNaN !== 'function') return false;
                    return (
                        !numberIsNaN({}) && numberIsNaN(NaN) && !numberIsNaN(34)
                    );
                };
            },
            {}
        ],
        52: [
            function(require, module, exports) {
                'use strict';

                module.exports = function(value) {
                    // eslint-disable-next-line no-self-compare
                    return value !== value;
                };
            },
            {}
        ],
        53: [
            function(require, module, exports) {
                'use strict';

                var sign = require('../math/sign'),
                    abs = Math.abs,
                    floor = Math.floor;

                module.exports = function(value) {
                    if (isNaN(value)) return 0;
                    value = Number(value);
                    if (value === 0 || !isFinite(value)) return value;
                    return sign(value) * floor(abs(value));
                };
            },
            { '../math/sign': 47 }
        ],
        54: [
            function(require, module, exports) {
                'use strict';

                var toInteger = require('./to-integer'),
                    max = Math.max;

                module.exports = function(value) {
                    return max(0, toInteger(value));
                };
            },
            { './to-integer': 53 }
        ],
        55: [
            function(require, module, exports) {
                // Internal method, used by iteration functions.
                // Calls a function for each key-value pair found in object
                // Optionally takes compareFn to iterate object in specific order

                'use strict';

                var callable = require('./valid-callable'),
                    value = require('./valid-value'),
                    bind = Function.prototype.bind,
                    call = Function.prototype.call,
                    keys = Object.keys,
                    objPropertyIsEnumerable =
                        Object.prototype.propertyIsEnumerable;

                module.exports = function(method, defVal) {
                    return function(obj, cb /*, thisArg, compareFn*/) {
                        var list,
                            thisArg = arguments[2],
                            compareFn = arguments[3];
                        obj = Object(value(obj));
                        callable(cb);

                        list = keys(obj);
                        if (compareFn) {
                            list.sort(
                                typeof compareFn === 'function'
                                    ? bind.call(compareFn, obj)
                                    : undefined
                            );
                        }
                        if (typeof method !== 'function') method = list[method];
                        return call.call(method, list, function(key, index) {
                            if (!objPropertyIsEnumerable.call(obj, key))
                                return defVal;
                            return call.call(
                                cb,
                                thisArg,
                                obj[key],
                                key,
                                obj,
                                index
                            );
                        });
                    };
                };
            },
            { './valid-callable': 74, './valid-value': 75 }
        ],
        56: [
            function(require, module, exports) {
                'use strict';

                module.exports = require('./is-implemented')()
                    ? Object.assign
                    : require('./shim');
            },
            { './is-implemented': 57, './shim': 58 }
        ],
        57: [
            function(require, module, exports) {
                'use strict';

                module.exports = function() {
                    var assign = Object.assign,
                        obj;
                    if (typeof assign !== 'function') return false;
                    obj = { foo: 'raz' };
                    assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
                    return obj.foo + obj.bar + obj.trzy === 'razdwatrzy';
                };
            },
            {}
        ],
        58: [
            function(require, module, exports) {
                'use strict';

                var keys = require('../keys'),
                    value = require('../valid-value'),
                    max = Math.max;

                module.exports = function(dest, src /*, …srcn*/) {
                    var error,
                        i,
                        length = max(arguments.length, 2),
                        assign;
                    dest = Object(value(dest));
                    assign = function(key) {
                        try {
                            dest[key] = src[key];
                        } catch (e) {
                            if (!error) error = e;
                        }
                    };
                    for (i = 1; i < length; ++i) {
                        src = arguments[i];
                        keys(src).forEach(assign);
                    }
                    if (error !== undefined) throw error;
                    return dest;
                };
            },
            { '../keys': 65, '../valid-value': 75 }
        ],
        59: [
            function(require, module, exports) {
                'use strict';

                var aFrom = require('../array/from'),
                    assign = require('./assign'),
                    value = require('./valid-value');

                module.exports = function(obj /*, propertyNames, options*/) {
                    var copy = Object(value(obj)),
                        propertyNames = arguments[1],
                        options = Object(arguments[2]);
                    if (copy !== obj && !propertyNames) return copy;
                    var result = {};
                    if (propertyNames) {
                        aFrom(propertyNames, function(propertyName) {
                            if (options.ensure || propertyName in obj)
                                result[propertyName] = obj[propertyName];
                        });
                    } else {
                        assign(result, obj);
                    }
                    return result;
                };
            },
            { '../array/from': 41, './assign': 56, './valid-value': 75 }
        ],
        60: [
            function(require, module, exports) {
                // Workaround for http://code.google.com/p/v8/issues/detail?id=2804

                'use strict';

                var create = Object.create,
                    shim;

                if (!require('./set-prototype-of/is-implemented')()) {
                    shim = require('./set-prototype-of/shim');
                }

                module.exports = (function() {
                    var nullObject, polyProps, desc;
                    if (!shim) return create;
                    if (shim.level !== 1) return create;

                    nullObject = {};
                    polyProps = {};
                    desc = {
                        configurable: false,
                        enumerable: false,
                        writable: true,
                        value: undefined
                    };
                    Object.getOwnPropertyNames(
                        Object.prototype
                    ).forEach(function(name) {
                        if (name === '__proto__') {
                            polyProps[name] = {
                                configurable: true,
                                enumerable: false,
                                writable: true,
                                value: undefined
                            };
                            return;
                        }
                        polyProps[name] = desc;
                    });
                    Object.defineProperties(nullObject, polyProps);

                    Object.defineProperty(shim, 'nullPolyfill', {
                        configurable: false,
                        enumerable: false,
                        writable: false,
                        value: nullObject
                    });

                    return function(prototype, props) {
                        return create(
                            prototype === null ? nullObject : prototype,
                            props
                        );
                    };
                })();
            },
            {
                './set-prototype-of/is-implemented': 72,
                './set-prototype-of/shim': 73
            }
        ],
        61: [
            function(require, module, exports) {
                'use strict';

                module.exports = require('./_iterate')('forEach');
            },
            { './_iterate': 55 }
        ],
        62: [
            function(require, module, exports) {
                // Deprecated

                'use strict';

                module.exports = function(obj) {
                    return typeof obj === 'function';
                };
            },
            {}
        ],
        63: [
            function(require, module, exports) {
                'use strict';

                var isValue = require('./is-value');

                var map = { function: true, object: true };

                module.exports = function(value) {
                    return (isValue(value) && map[typeof value]) || false;
                };
            },
            { './is-value': 64 }
        ],
        64: [
            function(require, module, exports) {
                'use strict';

                var _undefined = require('../function/noop')(); // Support ES3 engines

                module.exports = function(val) {
                    return val !== _undefined && val !== null;
                };
            },
            { '../function/noop': 46 }
        ],
        65: [
            function(require, module, exports) {
                'use strict';

                module.exports = require('./is-implemented')()
                    ? Object.keys
                    : require('./shim');
            },
            { './is-implemented': 66, './shim': 67 }
        ],
        66: [
            function(require, module, exports) {
                'use strict';

                module.exports = function() {
                    try {
                        Object.keys('primitive');
                        return true;
                    } catch (e) {
                        return false;
                    }
                };
            },
            {}
        ],
        67: [
            function(require, module, exports) {
                'use strict';

                var isValue = require('../is-value');

                var keys = Object.keys;

                module.exports = function(object) {
                    return keys(isValue(object) ? Object(object) : object);
                };
            },
            { '../is-value': 64 }
        ],
        68: [
            function(require, module, exports) {
                'use strict';

                var callable = require('./valid-callable'),
                    forEach = require('./for-each'),
                    call = Function.prototype.call;

                module.exports = function(obj, cb /*, thisArg*/) {
                    var result = {},
                        thisArg = arguments[2];
                    callable(cb);
                    forEach(obj, function(value, key, targetObj, index) {
                        result[key] = call.call(
                            cb,
                            thisArg,
                            value,
                            key,
                            targetObj,
                            index
                        );
                    });
                    return result;
                };
            },
            { './for-each': 61, './valid-callable': 74 }
        ],
        69: [
            function(require, module, exports) {
                'use strict';

                var isValue = require('./is-value');

                var forEach = Array.prototype.forEach,
                    create = Object.create;

                var process = function(src, obj) {
                    var key;
                    for (key in src) obj[key] = src[key];
                };

                // eslint-disable-next-line no-unused-vars
                module.exports = function(opts1 /*, …options*/) {
                    var result = create(null);
                    forEach.call(arguments, function(options) {
                        if (!isValue(options)) return;
                        process(Object(options), result);
                    });
                    return result;
                };
            },
            { './is-value': 64 }
        ],
        70: [
            function(require, module, exports) {
                'use strict';

                var forEach = Array.prototype.forEach,
                    create = Object.create;

                // eslint-disable-next-line no-unused-vars
                module.exports = function(arg /*, …args*/) {
                    var set = create(null);
                    forEach.call(arguments, function(name) {
                        set[name] = true;
                    });
                    return set;
                };
            },
            {}
        ],
        71: [
            function(require, module, exports) {
                'use strict';

                module.exports = require('./is-implemented')()
                    ? Object.setPrototypeOf
                    : require('./shim');
            },
            { './is-implemented': 72, './shim': 73 }
        ],
        72: [
            function(require, module, exports) {
                'use strict';

                var create = Object.create,
                    getPrototypeOf = Object.getPrototypeOf,
                    plainObject = {};

                module.exports = function(/* CustomCreate*/) {
                    var setPrototypeOf = Object.setPrototypeOf,
                        customCreate = arguments[0] || create;
                    if (typeof setPrototypeOf !== 'function') return false;
                    return (
                        getPrototypeOf(
                            setPrototypeOf(customCreate(null), plainObject)
                        ) === plainObject
                    );
                };
            },
            {}
        ],
        73: [
            function(require, module, exports) {
                /* eslint no-proto: "off" */

                // Big thanks to @WebReflection for sorting this out
                // https://gist.github.com/WebReflection/5593554

                'use strict';

                var isObject = require('../is-object'),
                    value = require('../valid-value'),
                    objIsPrototypOf = Object.prototype.isPrototypeOf,
                    defineProperty = Object.defineProperty,
                    nullDesc = {
                        configurable: true,
                        enumerable: false,
                        writable: true,
                        value: undefined
                    },
                    validate;

                validate = function(obj, prototype) {
                    value(obj);
                    if (prototype === null || isObject(prototype)) return obj;
                    throw new TypeError('Prototype must be null or an object');
                };

                module.exports = (function(status) {
                    var fn, set;
                    if (!status) return null;
                    if (status.level === 2) {
                        if (status.set) {
                            set = status.set;
                            fn = function(obj, prototype) {
                                set.call(validate(obj, prototype), prototype);
                                return obj;
                            };
                        } else {
                            fn = function(obj, prototype) {
                                validate(obj, prototype).__proto__ = prototype;
                                return obj;
                            };
                        }
                    } else {
                        fn = function self(obj, prototype) {
                            var isNullBase;
                            validate(obj, prototype);
                            isNullBase = objIsPrototypOf.call(
                                self.nullPolyfill,
                                obj
                            );
                            if (isNullBase) delete self.nullPolyfill.__proto__;
                            if (prototype === null)
                                prototype = self.nullPolyfill;
                            obj.__proto__ = prototype;
                            if (isNullBase)
                                defineProperty(
                                    self.nullPolyfill,
                                    '__proto__',
                                    nullDesc
                                );
                            return obj;
                        };
                    }
                    return Object.defineProperty(fn, 'level', {
                        configurable: false,
                        enumerable: false,
                        writable: false,
                        value: status.level
                    });
                })(
                    (function() {
                        var tmpObj1 = Object.create(null),
                            tmpObj2 = {},
                            set,
                            desc = Object.getOwnPropertyDescriptor(
                                Object.prototype,
                                '__proto__'
                            );

                        if (desc) {
                            try {
                                set = desc.set; // Opera crashes at this point
                                set.call(tmpObj1, tmpObj2);
                            } catch (ignore) {}
                            if (Object.getPrototypeOf(tmpObj1) === tmpObj2)
                                return { set: set, level: 2 };
                        }

                        tmpObj1.__proto__ = tmpObj2;
                        if (Object.getPrototypeOf(tmpObj1) === tmpObj2)
                            return { level: 2 };

                        tmpObj1 = {};
                        tmpObj1.__proto__ = tmpObj2;
                        if (Object.getPrototypeOf(tmpObj1) === tmpObj2)
                            return { level: 1 };

                        return false;
                    })()
                );

                require('../create');
            },
            { '../create': 60, '../is-object': 63, '../valid-value': 75 }
        ],
        74: [
            function(require, module, exports) {
                'use strict';

                module.exports = function(fn) {
                    if (typeof fn !== 'function')
                        throw new TypeError(fn + ' is not a function');
                    return fn;
                };
            },
            {}
        ],
        75: [
            function(require, module, exports) {
                'use strict';

                var isValue = require('./is-value');

                module.exports = function(value) {
                    if (!isValue(value))
                        throw new TypeError('Cannot use null or undefined');
                    return value;
                };
            },
            { './is-value': 64 }
        ],
        76: [
            function(require, module, exports) {
                'use strict';

                module.exports = require('./is-implemented')()
                    ? String.prototype.contains
                    : require('./shim');
            },
            { './is-implemented': 77, './shim': 78 }
        ],
        77: [
            function(require, module, exports) {
                'use strict';

                var str = 'razdwatrzy';

                module.exports = function() {
                    if (typeof str.contains !== 'function') return false;
                    return (
                        str.contains('dwa') === true &&
                        str.contains('foo') === false
                    );
                };
            },
            {}
        ],
        78: [
            function(require, module, exports) {
                'use strict';

                var indexOf = String.prototype.indexOf;

                module.exports = function(searchString /*, position*/) {
                    return indexOf.call(this, searchString, arguments[1]) > -1;
                };
            },
            {}
        ],
        79: [
            function(require, module, exports) {
                'use strict';

                var objToString = Object.prototype.toString,
                    id = objToString.call('');

                module.exports = function(value) {
                    return (
                        typeof value === 'string' ||
                        (value &&
                            typeof value === 'object' &&
                            (value instanceof String ||
                                objToString.call(value) === id)) ||
                        false
                    );
                };
            },
            {}
        ],
        80: [
            function(require, module, exports) {
                'use strict';

                var setPrototypeOf = require('es5-ext/object/set-prototype-of'),
                    contains = require('es5-ext/string/#/contains'),
                    d = require('d'),
                    Iterator = require('./'),
                    defineProperty = Object.defineProperty,
                    ArrayIterator;

                ArrayIterator = module.exports = function(arr, kind) {
                    if (!(this instanceof ArrayIterator))
                        return new ArrayIterator(arr, kind);
                    Iterator.call(this, arr);
                    if (!kind) kind = 'value';
                    else if (contains.call(kind, 'key+value'))
                        kind = 'key+value';
                    else if (contains.call(kind, 'key')) kind = 'key';
                    else kind = 'value';
                    defineProperty(this, '__kind__', d('', kind));
                };
                if (setPrototypeOf) setPrototypeOf(ArrayIterator, Iterator);

                ArrayIterator.prototype = Object.create(Iterator.prototype, {
                    constructor: d(ArrayIterator),
                    _resolve: d(function(i) {
                        if (this.__kind__ === 'value') return this.__list__[i];
                        if (this.__kind__ === 'key+value')
                            return [i, this.__list__[i]];
                        return i;
                    }),
                    toString: d(function() {
                        return '[object Array Iterator]';
                    })
                });
            },
            {
                './': 83,
                d: 38,
                'es5-ext/object/set-prototype-of': 71,
                'es5-ext/string/#/contains': 76
            }
        ],
        81: [
            function(require, module, exports) {
                'use strict';

                var isArguments = require('es5-ext/function/is-arguments'),
                    callable = require('es5-ext/object/valid-callable'),
                    isString = require('es5-ext/string/is-string'),
                    get = require('./get'),
                    isArray = Array.isArray,
                    call = Function.prototype.call,
                    some = Array.prototype.some;

                module.exports = function(iterable, cb /*, thisArg*/) {
                    var mode,
                        thisArg = arguments[2],
                        result,
                        doBreak,
                        broken,
                        i,
                        l,
                        char,
                        code;
                    if (isArray(iterable) || isArguments(iterable))
                        mode = 'array';
                    else if (isString(iterable)) mode = 'string';
                    else iterable = get(iterable);

                    callable(cb);
                    doBreak = function() {
                        broken = true;
                    };
                    if (mode === 'array') {
                        some.call(iterable, function(value) {
                            call.call(cb, thisArg, value, doBreak);
                            if (broken) return true;
                        });
                        return;
                    }
                    if (mode === 'string') {
                        l = iterable.length;
                        for (i = 0; i < l; ++i) {
                            char = iterable[i];
                            if (i + 1 < l) {
                                code = char.charCodeAt(0);
                                if (code >= 0xd800 && code <= 0xdbff)
                                    char += iterable[++i];
                            }
                            call.call(cb, thisArg, char, doBreak);
                            if (broken) break;
                        }
                        return;
                    }
                    result = iterable.next();

                    while (!result.done) {
                        call.call(cb, thisArg, result.value, doBreak);
                        if (broken) return;
                        result = iterable.next();
                    }
                };
            },
            {
                './get': 82,
                'es5-ext/function/is-arguments': 44,
                'es5-ext/object/valid-callable': 74,
                'es5-ext/string/is-string': 79
            }
        ],
        82: [
            function(require, module, exports) {
                'use strict';

                var isArguments = require('es5-ext/function/is-arguments'),
                    isString = require('es5-ext/string/is-string'),
                    ArrayIterator = require('./array'),
                    StringIterator = require('./string'),
                    iterable = require('./valid-iterable'),
                    iteratorSymbol = require('es6-symbol').iterator;

                module.exports = function(obj) {
                    if (typeof iterable(obj)[iteratorSymbol] === 'function')
                        return obj[iteratorSymbol]();
                    if (isArguments(obj)) return new ArrayIterator(obj);
                    if (isString(obj)) return new StringIterator(obj);
                    return new ArrayIterator(obj);
                };
            },
            {
                './array': 80,
                './string': 85,
                './valid-iterable': 86,
                'es5-ext/function/is-arguments': 44,
                'es5-ext/string/is-string': 79,
                'es6-symbol': 93
            }
        ],
        83: [
            function(require, module, exports) {
                'use strict';

                var clear = require('es5-ext/array/#/clear'),
                    assign = require('es5-ext/object/assign'),
                    callable = require('es5-ext/object/valid-callable'),
                    value = require('es5-ext/object/valid-value'),
                    d = require('d'),
                    autoBind = require('d/auto-bind'),
                    Symbol = require('es6-symbol'),
                    defineProperty = Object.defineProperty,
                    defineProperties = Object.defineProperties,
                    Iterator;

                module.exports = Iterator = function(list, context) {
                    if (!(this instanceof Iterator))
                        return new Iterator(list, context);
                    defineProperties(this, {
                        __list__: d('w', value(list)),
                        __context__: d('w', context),
                        __nextIndex__: d('w', 0)
                    });
                    if (!context) return;
                    callable(context.on);
                    context.on('_add', this._onAdd);
                    context.on('_delete', this._onDelete);
                    context.on('_clear', this._onClear);
                };

                defineProperties(
                    Iterator.prototype,
                    assign(
                        {
                            constructor: d(Iterator),
                            _next: d(function() {
                                var i;
                                if (!this.__list__) return;
                                if (this.__redo__) {
                                    i = this.__redo__.shift();
                                    if (i !== undefined) return i;
                                }
                                if (this.__nextIndex__ < this.__list__.length)
                                    return this.__nextIndex__++;
                                this._unBind();
                            }),
                            next: d(function() {
                                return this._createResult(this._next());
                            }),
                            _createResult: d(function(i) {
                                if (i === undefined)
                                    return { done: true, value: undefined };
                                return { done: false, value: this._resolve(i) };
                            }),
                            _resolve: d(function(i) {
                                return this.__list__[i];
                            }),
                            _unBind: d(function() {
                                this.__list__ = null;
                                delete this.__redo__;
                                if (!this.__context__) return;
                                this.__context__.off('_add', this._onAdd);
                                this.__context__.off('_delete', this._onDelete);
                                this.__context__.off('_clear', this._onClear);
                                this.__context__ = null;
                            }),
                            toString: d(function() {
                                return '[object Iterator]';
                            })
                        },
                        autoBind({
                            _onAdd: d(function(index) {
                                if (index >= this.__nextIndex__) return;
                                ++this.__nextIndex__;
                                if (!this.__redo__) {
                                    defineProperty(
                                        this,
                                        '__redo__',
                                        d('c', [index])
                                    );
                                    return;
                                }
                                this.__redo__.forEach(function(redo, i) {
                                    if (redo >= index)
                                        this.__redo__[i] = ++redo;
                                }, this);
                                this.__redo__.push(index);
                            }),
                            _onDelete: d(function(index) {
                                var i;
                                if (index >= this.__nextIndex__) return;
                                --this.__nextIndex__;
                                if (!this.__redo__) return;
                                i = this.__redo__.indexOf(index);
                                if (i !== -1) this.__redo__.splice(i, 1);
                                this.__redo__.forEach(function(redo, i) {
                                    if (redo > index) this.__redo__[i] = --redo;
                                }, this);
                            }),
                            _onClear: d(function() {
                                if (this.__redo__) clear.call(this.__redo__);
                                this.__nextIndex__ = 0;
                            })
                        })
                    )
                );

                defineProperty(
                    Iterator.prototype,
                    Symbol.iterator,
                    d(function() {
                        return this;
                    })
                );
                defineProperty(
                    Iterator.prototype,
                    Symbol.toStringTag,
                    d('', 'Iterator')
                );
            },
            {
                d: 38,
                'd/auto-bind': 37,
                'es5-ext/array/#/clear': 39,
                'es5-ext/object/assign': 56,
                'es5-ext/object/valid-callable': 74,
                'es5-ext/object/valid-value': 75,
                'es6-symbol': 93
            }
        ],
        84: [
            function(require, module, exports) {
                'use strict';

                var isArguments = require('es5-ext/function/is-arguments'),
                    isString = require('es5-ext/string/is-string'),
                    iteratorSymbol = require('es6-symbol').iterator,
                    isArray = Array.isArray;

                module.exports = function(value) {
                    if (value == null) return false;
                    if (isArray(value)) return true;
                    if (isString(value)) return true;
                    if (isArguments(value)) return true;
                    return typeof value[iteratorSymbol] === 'function';
                };
            },
            {
                'es5-ext/function/is-arguments': 44,
                'es5-ext/string/is-string': 79,
                'es6-symbol': 93
            }
        ],
        85: [
            function(require, module, exports) {
                // Thanks @mathiasbynens
                // http://mathiasbynens.be/notes/javascript-unicode#iterating-over-symbols

                'use strict';

                var setPrototypeOf = require('es5-ext/object/set-prototype-of'),
                    d = require('d'),
                    Iterator = require('./'),
                    defineProperty = Object.defineProperty,
                    StringIterator;

                StringIterator = module.exports = function(str) {
                    if (!(this instanceof StringIterator))
                        return new StringIterator(str);
                    str = String(str);
                    Iterator.call(this, str);
                    defineProperty(this, '__length__', d('', str.length));
                };
                if (setPrototypeOf) setPrototypeOf(StringIterator, Iterator);

                StringIterator.prototype = Object.create(Iterator.prototype, {
                    constructor: d(StringIterator),
                    _next: d(function() {
                        if (!this.__list__) return;
                        if (this.__nextIndex__ < this.__length__)
                            return this.__nextIndex__++;
                        this._unBind();
                    }),
                    _resolve: d(function(i) {
                        var char = this.__list__[i],
                            code;
                        if (this.__nextIndex__ === this.__length__) return char;
                        code = char.charCodeAt(0);
                        if (code >= 0xd800 && code <= 0xdbff)
                            return char + this.__list__[this.__nextIndex__++];
                        return char;
                    }),
                    toString: d(function() {
                        return '[object String Iterator]';
                    })
                });
            },
            { './': 83, d: 38, 'es5-ext/object/set-prototype-of': 71 }
        ],
        86: [
            function(require, module, exports) {
                'use strict';

                var isIterable = require('./is-iterable');

                module.exports = function(value) {
                    if (!isIterable(value))
                        throw new TypeError(value + ' is not iterable');
                    return value;
                };
            },
            { './is-iterable': 84 }
        ],
        87: [
            function(require, module, exports) {
                'use strict';

                module.exports = require('./is-implemented')()
                    ? Map
                    : require('./polyfill');
            },
            { './is-implemented': 88, './polyfill': 92 }
        ],
        88: [
            function(require, module, exports) {
                'use strict';

                module.exports = function() {
                    var map, iterator, result;
                    if (typeof Map !== 'function') return false;
                    try {
                        // WebKit doesn't support arguments and crashes
                        map = new Map([
                            ['raz', 'one'],
                            ['dwa', 'two'],
                            ['trzy', 'three']
                        ]);
                    } catch (e) {
                        return false;
                    }
                    if (String(map) !== '[object Map]') return false;
                    if (map.size !== 3) return false;
                    if (typeof map.clear !== 'function') return false;
                    if (typeof map.delete !== 'function') return false;
                    if (typeof map.entries !== 'function') return false;
                    if (typeof map.forEach !== 'function') return false;
                    if (typeof map.get !== 'function') return false;
                    if (typeof map.has !== 'function') return false;
                    if (typeof map.keys !== 'function') return false;
                    if (typeof map.set !== 'function') return false;
                    if (typeof map.values !== 'function') return false;

                    iterator = map.entries();
                    result = iterator.next();
                    if (result.done !== false) return false;
                    if (!result.value) return false;
                    if (result.value[0] !== 'raz') return false;
                    if (result.value[1] !== 'one') return false;

                    return true;
                };
            },
            {}
        ],
        89: [
            function(require, module, exports) {
                // Exports true if environment provides native `Map` implementation,
                // whatever that is.

                'use strict';

                module.exports = (function() {
                    if (typeof Map === 'undefined') return false;
                    return (
                        Object.prototype.toString.call(new Map()) ===
                        '[object Map]'
                    );
                })();
            },
            {}
        ],
        90: [
            function(require, module, exports) {
                'use strict';

                module.exports = require('es5-ext/object/primitive-set')(
                    'key',
                    'value',
                    'key+value'
                );
            },
            { 'es5-ext/object/primitive-set': 70 }
        ],
        91: [
            function(require, module, exports) {
                'use strict';

                var setPrototypeOf = require('es5-ext/object/set-prototype-of'),
                    d = require('d'),
                    Iterator = require('es6-iterator'),
                    toStringTagSymbol = require('es6-symbol').toStringTag,
                    kinds = require('./iterator-kinds'),
                    defineProperties = Object.defineProperties,
                    unBind = Iterator.prototype._unBind,
                    MapIterator;

                MapIterator = module.exports = function(map, kind) {
                    if (!(this instanceof MapIterator))
                        return new MapIterator(map, kind);
                    Iterator.call(this, map.__mapKeysData__, map);
                    if (!kind || !kinds[kind]) kind = 'key+value';
                    defineProperties(this, {
                        __kind__: d('', kind),
                        __values__: d('w', map.__mapValuesData__)
                    });
                };
                if (setPrototypeOf) setPrototypeOf(MapIterator, Iterator);

                MapIterator.prototype = Object.create(Iterator.prototype, {
                    constructor: d(MapIterator),
                    _resolve: d(function(i) {
                        if (this.__kind__ === 'value')
                            return this.__values__[i];
                        if (this.__kind__ === 'key') return this.__list__[i];
                        return [this.__list__[i], this.__values__[i]];
                    }),
                    _unBind: d(function() {
                        this.__values__ = null;
                        unBind.call(this);
                    }),
                    toString: d(function() {
                        return '[object Map Iterator]';
                    })
                });
                Object.defineProperty(
                    MapIterator.prototype,
                    toStringTagSymbol,
                    d('c', 'Map Iterator')
                );
            },
            {
                './iterator-kinds': 90,
                d: 38,
                'es5-ext/object/set-prototype-of': 71,
                'es6-iterator': 83,
                'es6-symbol': 93
            }
        ],
        92: [
            function(require, module, exports) {
                'use strict';

                var clear = require('es5-ext/array/#/clear'),
                    eIndexOf = require('es5-ext/array/#/e-index-of'),
                    setPrototypeOf = require('es5-ext/object/set-prototype-of'),
                    callable = require('es5-ext/object/valid-callable'),
                    validValue = require('es5-ext/object/valid-value'),
                    d = require('d'),
                    ee = require('event-emitter'),
                    Symbol = require('es6-symbol'),
                    iterator = require('es6-iterator/valid-iterable'),
                    forOf = require('es6-iterator/for-of'),
                    Iterator = require('./lib/iterator'),
                    isNative = require('./is-native-implemented'),
                    call = Function.prototype.call,
                    defineProperties = Object.defineProperties,
                    getPrototypeOf = Object.getPrototypeOf,
                    MapPoly;

                module.exports = MapPoly = function(/*iterable*/) {
                    var iterable = arguments[0],
                        keys,
                        values,
                        self;
                    if (!(this instanceof MapPoly))
                        throw new TypeError("Constructor requires 'new'");
                    if (isNative && setPrototypeOf && Map !== MapPoly) {
                        self = setPrototypeOf(new Map(), getPrototypeOf(this));
                    } else {
                        self = this;
                    }
                    if (iterable != null) iterator(iterable);
                    defineProperties(self, {
                        __mapKeysData__: d('c', (keys = [])),
                        __mapValuesData__: d('c', (values = []))
                    });
                    if (!iterable) return self;
                    forOf(
                        iterable,
                        function(value) {
                            var key = validValue(value)[0];
                            value = value[1];
                            if (eIndexOf.call(keys, key) !== -1) return;
                            keys.push(key);
                            values.push(value);
                        },
                        self
                    );
                    return self;
                };

                if (isNative) {
                    if (setPrototypeOf) setPrototypeOf(MapPoly, Map);
                    MapPoly.prototype = Object.create(Map.prototype, {
                        constructor: d(MapPoly)
                    });
                }

                ee(
                    defineProperties(MapPoly.prototype, {
                        clear: d(function() {
                            if (!this.__mapKeysData__.length) return;
                            clear.call(this.__mapKeysData__);
                            clear.call(this.__mapValuesData__);
                            this.emit('_clear');
                        }),
                        delete: d(function(key) {
                            var index = eIndexOf.call(
                                this.__mapKeysData__,
                                key
                            );
                            if (index === -1) return false;
                            this.__mapKeysData__.splice(index, 1);
                            this.__mapValuesData__.splice(index, 1);
                            this.emit('_delete', index, key);
                            return true;
                        }),
                        entries: d(function() {
                            return new Iterator(this, 'key+value');
                        }),
                        forEach: d(function(cb /*, thisArg*/) {
                            var thisArg = arguments[1],
                                iterator,
                                result;
                            callable(cb);
                            iterator = this.entries();
                            result = iterator._next();
                            while (result !== undefined) {
                                call.call(
                                    cb,
                                    thisArg,
                                    this.__mapValuesData__[result],
                                    this.__mapKeysData__[result],
                                    this
                                );
                                result = iterator._next();
                            }
                        }),
                        get: d(function(key) {
                            var index = eIndexOf.call(
                                this.__mapKeysData__,
                                key
                            );
                            if (index === -1) return;
                            return this.__mapValuesData__[index];
                        }),
                        has: d(function(key) {
                            return (
                                eIndexOf.call(this.__mapKeysData__, key) !== -1
                            );
                        }),
                        keys: d(function() {
                            return new Iterator(this, 'key');
                        }),
                        set: d(function(key, value) {
                            var index = eIndexOf.call(
                                    this.__mapKeysData__,
                                    key
                                ),
                                emit;
                            if (index === -1) {
                                index = this.__mapKeysData__.push(key) - 1;
                                emit = true;
                            }
                            this.__mapValuesData__[index] = value;
                            if (emit) this.emit('_add', index, key);
                            return this;
                        }),
                        size: d.gs(function() {
                            return this.__mapKeysData__.length;
                        }),
                        values: d(function() {
                            return new Iterator(this, 'value');
                        }),
                        toString: d(function() {
                            return '[object Map]';
                        })
                    })
                );
                Object.defineProperty(
                    MapPoly.prototype,
                    Symbol.iterator,
                    d(function() {
                        return this.entries();
                    })
                );
                Object.defineProperty(
                    MapPoly.prototype,
                    Symbol.toStringTag,
                    d('c', 'Map')
                );
            },
            {
                './is-native-implemented': 89,
                './lib/iterator': 91,
                d: 38,
                'es5-ext/array/#/clear': 39,
                'es5-ext/array/#/e-index-of': 40,
                'es5-ext/object/set-prototype-of': 71,
                'es5-ext/object/valid-callable': 74,
                'es5-ext/object/valid-value': 75,
                'es6-iterator/for-of': 81,
                'es6-iterator/valid-iterable': 86,
                'es6-symbol': 93,
                'event-emitter': 98
            }
        ],
        93: [
            function(require, module, exports) {
                'use strict';

                module.exports = require('./is-implemented')()
                    ? Symbol
                    : require('./polyfill');
            },
            { './is-implemented': 94, './polyfill': 96 }
        ],
        94: [
            function(require, module, exports) {
                'use strict';

                var validTypes = { object: true, symbol: true };

                module.exports = function() {
                    var symbol;
                    if (typeof Symbol !== 'function') return false;
                    symbol = Symbol('test symbol');
                    try {
                        String(symbol);
                    } catch (e) {
                        return false;
                    }

                    // Return 'true' also for polyfills
                    if (!validTypes[typeof Symbol.iterator]) return false;
                    if (!validTypes[typeof Symbol.toPrimitive]) return false;
                    if (!validTypes[typeof Symbol.toStringTag]) return false;

                    return true;
                };
            },
            {}
        ],
        95: [
            function(require, module, exports) {
                'use strict';

                module.exports = function(x) {
                    if (!x) return false;
                    if (typeof x === 'symbol') return true;
                    if (!x.constructor) return false;
                    if (x.constructor.name !== 'Symbol') return false;
                    return x[x.constructor.toStringTag] === 'Symbol';
                };
            },
            {}
        ],
        96: [
            function(require, module, exports) {
                // ES2015 Symbol polyfill for environments that do not (or partially) support it

                'use strict';

                var d = require('d'),
                    validateSymbol = require('./validate-symbol'),
                    create = Object.create,
                    defineProperties = Object.defineProperties,
                    defineProperty = Object.defineProperty,
                    objPrototype = Object.prototype,
                    NativeSymbol,
                    SymbolPolyfill,
                    HiddenSymbol,
                    globalSymbols = create(null),
                    isNativeSafe;

                if (typeof Symbol === 'function') {
                    NativeSymbol = Symbol;
                    try {
                        String(NativeSymbol());
                        isNativeSafe = true;
                    } catch (ignore) {}
                }

                var generateName = (function() {
                    var created = create(null);
                    return function(desc) {
                        var postfix = 0,
                            name,
                            ie11BugWorkaround;
                        while (created[desc + (postfix || '')]) ++postfix;
                        desc += postfix || '';
                        created[desc] = true;
                        name = '@@' + desc;
                        defineProperty(
                            objPrototype,
                            name,
                            d.gs(null, function(value) {
                                // For IE11 issue see:
                                // https://connect.microsoft.com/IE/feedbackdetail/view/1928508/
                                //    ie11-broken-getters-on-dom-objects
                                // https://github.com/medikoo/es6-symbol/issues/12
                                if (ie11BugWorkaround) return;
                                ie11BugWorkaround = true;
                                defineProperty(this, name, d(value));
                                ie11BugWorkaround = false;
                            })
                        );
                        return name;
                    };
                })();

                // Internal constructor (not one exposed) for creating Symbol instances.
                // This one is used to ensure that `someSymbol instanceof Symbol` always return false
                HiddenSymbol = function Symbol(description) {
                    if (this instanceof HiddenSymbol)
                        throw new TypeError('Symbol is not a constructor');
                    return SymbolPolyfill(description);
                };

                // Exposed `Symbol` constructor
                // (returns instances of HiddenSymbol)
                module.exports = SymbolPolyfill = function Symbol(description) {
                    var symbol;
                    if (this instanceof Symbol)
                        throw new TypeError('Symbol is not a constructor');
                    if (isNativeSafe) return NativeSymbol(description);
                    symbol = create(HiddenSymbol.prototype);
                    description =
                        description === undefined ? '' : String(description);
                    return defineProperties(symbol, {
                        __description__: d('', description),
                        __name__: d('', generateName(description))
                    });
                };
                defineProperties(SymbolPolyfill, {
                    for: d(function(key) {
                        if (globalSymbols[key]) return globalSymbols[key];
                        return (globalSymbols[key] = SymbolPolyfill(
                            String(key)
                        ));
                    }),
                    keyFor: d(function(s) {
                        var key;
                        validateSymbol(s);
                        for (key in globalSymbols)
                            if (globalSymbols[key] === s) return key;
                    }),

                    // To ensure proper interoperability with other native functions (e.g. Array.from)
                    // fallback to eventual native implementation of given symbol
                    hasInstance: d(
                        '',
                        (NativeSymbol && NativeSymbol.hasInstance) ||
                            SymbolPolyfill('hasInstance')
                    ),
                    isConcatSpreadable: d(
                        '',
                        (NativeSymbol && NativeSymbol.isConcatSpreadable) ||
                            SymbolPolyfill('isConcatSpreadable')
                    ),
                    iterator: d(
                        '',
                        (NativeSymbol && NativeSymbol.iterator) ||
                            SymbolPolyfill('iterator')
                    ),
                    match: d(
                        '',
                        (NativeSymbol && NativeSymbol.match) ||
                            SymbolPolyfill('match')
                    ),
                    replace: d(
                        '',
                        (NativeSymbol && NativeSymbol.replace) ||
                            SymbolPolyfill('replace')
                    ),
                    search: d(
                        '',
                        (NativeSymbol && NativeSymbol.search) ||
                            SymbolPolyfill('search')
                    ),
                    species: d(
                        '',
                        (NativeSymbol && NativeSymbol.species) ||
                            SymbolPolyfill('species')
                    ),
                    split: d(
                        '',
                        (NativeSymbol && NativeSymbol.split) ||
                            SymbolPolyfill('split')
                    ),
                    toPrimitive: d(
                        '',
                        (NativeSymbol && NativeSymbol.toPrimitive) ||
                            SymbolPolyfill('toPrimitive')
                    ),
                    toStringTag: d(
                        '',
                        (NativeSymbol && NativeSymbol.toStringTag) ||
                            SymbolPolyfill('toStringTag')
                    ),
                    unscopables: d(
                        '',
                        (NativeSymbol && NativeSymbol.unscopables) ||
                            SymbolPolyfill('unscopables')
                    )
                });

                // Internal tweaks for real symbol producer
                defineProperties(HiddenSymbol.prototype, {
                    constructor: d(SymbolPolyfill),
                    toString: d('', function() {
                        return this.__name__;
                    })
                });

                // Proper implementation of methods exposed on Symbol.prototype
                // They won't be accessible on produced symbol instances as they derive from HiddenSymbol.prototype
                defineProperties(SymbolPolyfill.prototype, {
                    toString: d(function() {
                        return (
                            'Symbol (' +
                            validateSymbol(this).__description__ +
                            ')'
                        );
                    }),
                    valueOf: d(function() {
                        return validateSymbol(this);
                    })
                });
                defineProperty(
                    SymbolPolyfill.prototype,
                    SymbolPolyfill.toPrimitive,
                    d('', function() {
                        var symbol = validateSymbol(this);
                        if (typeof symbol === 'symbol') return symbol;
                        return symbol.toString();
                    })
                );
                defineProperty(
                    SymbolPolyfill.prototype,
                    SymbolPolyfill.toStringTag,
                    d('c', 'Symbol')
                );

                // Proper implementaton of toPrimitive and toStringTag for returned symbol instances
                defineProperty(
                    HiddenSymbol.prototype,
                    SymbolPolyfill.toStringTag,
                    d('c', SymbolPolyfill.prototype[SymbolPolyfill.toStringTag])
                );

                // Note: It's important to define `toPrimitive` as last one, as some implementations
                // implement `toPrimitive` natively without implementing `toStringTag` (or other specified symbols)
                // And that may invoke error in definition flow:
                // See: https://github.com/medikoo/es6-symbol/issues/13#issuecomment-164146149
                defineProperty(
                    HiddenSymbol.prototype,
                    SymbolPolyfill.toPrimitive,
                    d('c', SymbolPolyfill.prototype[SymbolPolyfill.toPrimitive])
                );
            },
            { './validate-symbol': 97, d: 38 }
        ],
        97: [
            function(require, module, exports) {
                'use strict';

                var isSymbol = require('./is-symbol');

                module.exports = function(value) {
                    if (!isSymbol(value))
                        throw new TypeError(value + ' is not a symbol');
                    return value;
                };
            },
            { './is-symbol': 95 }
        ],
        98: [
            function(require, module, exports) {
                'use strict';

                var d = require('d'),
                    callable = require('es5-ext/object/valid-callable'),
                    apply = Function.prototype.apply,
                    call = Function.prototype.call,
                    create = Object.create,
                    defineProperty = Object.defineProperty,
                    defineProperties = Object.defineProperties,
                    hasOwnProperty = Object.prototype.hasOwnProperty,
                    descriptor = {
                        configurable: true,
                        enumerable: false,
                        writable: true
                    },
                    on,
                    once,
                    off,
                    emit,
                    methods,
                    descriptors,
                    base;

                on = function(type, listener) {
                    var data;

                    callable(listener);

                    if (!hasOwnProperty.call(this, '__ee__')) {
                        data = descriptor.value = create(null);
                        defineProperty(this, '__ee__', descriptor);
                        descriptor.value = null;
                    } else {
                        data = this.__ee__;
                    }
                    if (!data[type]) data[type] = listener;
                    else if (typeof data[type] === 'object')
                        data[type].push(listener);
                    else data[type] = [data[type], listener];

                    return this;
                };

                once = function(type, listener) {
                    var once, self;

                    callable(listener);
                    self = this;
                    on.call(
                        this,
                        type,
                        (once = function() {
                            off.call(self, type, once);
                            apply.call(listener, this, arguments);
                        })
                    );

                    once.__eeOnceListener__ = listener;
                    return this;
                };

                off = function(type, listener) {
                    var data, listeners, candidate, i;

                    callable(listener);

                    if (!hasOwnProperty.call(this, '__ee__')) return this;
                    data = this.__ee__;
                    if (!data[type]) return this;
                    listeners = data[type];

                    if (typeof listeners === 'object') {
                        for (i = 0; (candidate = listeners[i]); ++i) {
                            if (
                                candidate === listener ||
                                candidate.__eeOnceListener__ === listener
                            ) {
                                if (listeners.length === 2)
                                    data[type] = listeners[i ? 0 : 1];
                                else listeners.splice(i, 1);
                            }
                        }
                    } else {
                        if (
                            listeners === listener ||
                            listeners.__eeOnceListener__ === listener
                        ) {
                            delete data[type];
                        }
                    }

                    return this;
                };

                emit = function(type) {
                    var i, l, listener, listeners, args;

                    if (!hasOwnProperty.call(this, '__ee__')) return;
                    listeners = this.__ee__[type];
                    if (!listeners) return;

                    if (typeof listeners === 'object') {
                        l = arguments.length;
                        args = new Array(l - 1);
                        for (i = 1; i < l; ++i) args[i - 1] = arguments[i];

                        listeners = listeners.slice();
                        for (i = 0; (listener = listeners[i]); ++i) {
                            apply.call(listener, this, args);
                        }
                    } else {
                        switch (arguments.length) {
                            case 1:
                                call.call(listeners, this);
                                break;
                            case 2:
                                call.call(listeners, this, arguments[1]);
                                break;
                            case 3:
                                call.call(
                                    listeners,
                                    this,
                                    arguments[1],
                                    arguments[2]
                                );
                                break;
                            default:
                                l = arguments.length;
                                args = new Array(l - 1);
                                for (i = 1; i < l; ++i) {
                                    args[i - 1] = arguments[i];
                                }
                                apply.call(listeners, this, args);
                        }
                    }
                };

                methods = {
                    on: on,
                    once: once,
                    off: off,
                    emit: emit
                };

                descriptors = {
                    on: d(on),
                    once: d(once),
                    off: d(off),
                    emit: d(emit)
                };

                base = defineProperties({}, descriptors);

                module.exports = exports = function(o) {
                    return o == null
                        ? create(base)
                        : defineProperties(Object(o), descriptors);
                };
                exports.methods = methods;
            },
            { d: 38, 'es5-ext/object/valid-callable': 74 }
        ],
        99: [
            function(require, module, exports) {
                // Copyright Joyent, Inc. and other Node contributors.
                //
                // Permission is hereby granted, free of charge, to any person obtaining a
                // copy of this software and associated documentation files (the
                // "Software"), to deal in the Software without restriction, including
                // without limitation the rights to use, copy, modify, merge, publish,
                // distribute, sublicense, and/or sell copies of the Software, and to permit
                // persons to whom the Software is furnished to do so, subject to the
                // following conditions:
                //
                // The above copyright notice and this permission notice shall be included
                // in all copies or substantial portions of the Software.
                //
                // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
                // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
                // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
                // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
                // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
                // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
                // USE OR OTHER DEALINGS IN THE SOFTWARE.

                function EventEmitter() {
                    this._events = this._events || {};
                    this._maxListeners = this._maxListeners || undefined;
                }
                module.exports = EventEmitter;

                // Backwards-compat with node 0.10.x
                EventEmitter.EventEmitter = EventEmitter;

                EventEmitter.prototype._events = undefined;
                EventEmitter.prototype._maxListeners = undefined;

                // By default EventEmitters will print a warning if more than 10 listeners are
                // added to it. This is a useful default which helps finding memory leaks.
                EventEmitter.defaultMaxListeners = 10;

                // Obviously not all Emitters should be limited to 10. This function allows
                // that to be increased. Set to zero for unlimited.
                EventEmitter.prototype.setMaxListeners = function(n) {
                    if (!isNumber(n) || n < 0 || isNaN(n))
                        throw TypeError('n must be a positive number');
                    this._maxListeners = n;
                    return this;
                };

                EventEmitter.prototype.emit = function(type) {
                    var er, handler, len, args, i, listeners;

                    if (!this._events) this._events = {};

                    // If there is no 'error' event listener then throw.
                    if (type === 'error') {
                        if (
                            !this._events.error ||
                            (isObject(this._events.error) &&
                                !this._events.error.length)
                        ) {
                            er = arguments[1];
                            if (er instanceof Error) {
                                throw er; // Unhandled 'error' event
                            } else {
                                // At least give some kind of context to the user
                                var err = new Error(
                                    'Uncaught, unspecified "error" event. (' +
                                        er +
                                        ')'
                                );
                                err.context = er;
                                throw err;
                            }
                        }
                    }

                    handler = this._events[type];

                    if (isUndefined(handler)) return false;

                    if (isFunction(handler)) {
                        switch (arguments.length) {
                            // fast cases
                            case 1:
                                handler.call(this);
                                break;
                            case 2:
                                handler.call(this, arguments[1]);
                                break;
                            case 3:
                                handler.call(this, arguments[1], arguments[2]);
                                break;
                            // slower
                            default:
                                args = Array.prototype.slice.call(arguments, 1);
                                handler.apply(this, args);
                        }
                    } else if (isObject(handler)) {
                        args = Array.prototype.slice.call(arguments, 1);
                        listeners = handler.slice();
                        len = listeners.length;
                        for (i = 0; i < len; i++)
                            listeners[i].apply(this, args);
                    }

                    return true;
                };

                EventEmitter.prototype.addListener = function(type, listener) {
                    var m;

                    if (!isFunction(listener))
                        throw TypeError('listener must be a function');

                    if (!this._events) this._events = {};

                    // To avoid recursion in the case that type === "newListener"! Before
                    // adding it to the listeners, first emit "newListener".
                    if (this._events.newListener)
                        this.emit(
                            'newListener',
                            type,
                            isFunction(listener.listener)
                                ? listener.listener
                                : listener
                        );

                    if (!this._events[type])
                        // Optimize the case of one listener. Don't need the extra array object.
                        this._events[type] = listener;
                    else if (isObject(this._events[type]))
                        // If we've already got an array, just append.
                        this._events[type].push(listener);
                    else
                        // Adding the second element, need to change to array.
                        this._events[type] = [this._events[type], listener];

                    // Check for listener leak
                    if (
                        isObject(this._events[type]) &&
                        !this._events[type].warned
                    ) {
                        if (!isUndefined(this._maxListeners)) {
                            m = this._maxListeners;
                        } else {
                            m = EventEmitter.defaultMaxListeners;
                        }

                        if (m && m > 0 && this._events[type].length > m) {
                            this._events[type].warned = true;
                            console.error(
                                '(node) warning: possible EventEmitter memory ' +
                                    'leak detected. %d listeners added. ' +
                                    'Use emitter.setMaxListeners() to increase limit.',
                                this._events[type].length
                            );
                            if (typeof console.trace === 'function') {
                                // not supported in IE 10
                                console.trace();
                            }
                        }
                    }

                    return this;
                };

                EventEmitter.prototype.on = EventEmitter.prototype.addListener;

                EventEmitter.prototype.once = function(type, listener) {
                    if (!isFunction(listener))
                        throw TypeError('listener must be a function');

                    var fired = false;

                    function g() {
                        this.removeListener(type, g);

                        if (!fired) {
                            fired = true;
                            listener.apply(this, arguments);
                        }
                    }

                    g.listener = listener;
                    this.on(type, g);

                    return this;
                };

                // emits a 'removeListener' event iff the listener was removed
                EventEmitter.prototype.removeListener = function(
                    type,
                    listener
                ) {
                    var list, position, length, i;

                    if (!isFunction(listener))
                        throw TypeError('listener must be a function');

                    if (!this._events || !this._events[type]) return this;

                    list = this._events[type];
                    length = list.length;
                    position = -1;

                    if (
                        list === listener ||
                        (isFunction(list.listener) &&
                            list.listener === listener)
                    ) {
                        delete this._events[type];
                        if (this._events.removeListener)
                            this.emit('removeListener', type, listener);
                    } else if (isObject(list)) {
                        for (i = length; i-- > 0; ) {
                            if (
                                list[i] === listener ||
                                (list[i].listener &&
                                    list[i].listener === listener)
                            ) {
                                position = i;
                                break;
                            }
                        }

                        if (position < 0) return this;

                        if (list.length === 1) {
                            list.length = 0;
                            delete this._events[type];
                        } else {
                            list.splice(position, 1);
                        }

                        if (this._events.removeListener)
                            this.emit('removeListener', type, listener);
                    }

                    return this;
                };

                EventEmitter.prototype.removeAllListeners = function(type) {
                    var key, listeners;

                    if (!this._events) return this;

                    // not listening for removeListener, no need to emit
                    if (!this._events.removeListener) {
                        if (arguments.length === 0) this._events = {};
                        else if (this._events[type]) delete this._events[type];
                        return this;
                    }

                    // emit removeListener for all listeners on all events
                    if (arguments.length === 0) {
                        for (key in this._events) {
                            if (key === 'removeListener') continue;
                            this.removeAllListeners(key);
                        }
                        this.removeAllListeners('removeListener');
                        this._events = {};
                        return this;
                    }

                    listeners = this._events[type];

                    if (isFunction(listeners)) {
                        this.removeListener(type, listeners);
                    } else if (listeners) {
                        // LIFO order
                        while (listeners.length)
                            this.removeListener(
                                type,
                                listeners[listeners.length - 1]
                            );
                    }
                    delete this._events[type];

                    return this;
                };

                EventEmitter.prototype.listeners = function(type) {
                    var ret;
                    if (!this._events || !this._events[type]) ret = [];
                    else if (isFunction(this._events[type]))
                        ret = [this._events[type]];
                    else ret = this._events[type].slice();
                    return ret;
                };

                EventEmitter.prototype.listenerCount = function(type) {
                    if (this._events) {
                        var evlistener = this._events[type];

                        if (isFunction(evlistener)) return 1;
                        else if (evlistener) return evlistener.length;
                    }
                    return 0;
                };

                EventEmitter.listenerCount = function(emitter, type) {
                    return emitter.listenerCount(type);
                };

                function isFunction(arg) {
                    return typeof arg === 'function';
                }

                function isNumber(arg) {
                    return typeof arg === 'number';
                }

                function isObject(arg) {
                    return typeof arg === 'object' && arg !== null;
                }

                function isUndefined(arg) {
                    return arg === void 0;
                }
            },
            {}
        ],
        100: [
            function(require, module, exports) {
                exports.read = function(buffer, offset, isLE, mLen, nBytes) {
                    var e, m;
                    var eLen = nBytes * 8 - mLen - 1;
                    var eMax = (1 << eLen) - 1;
                    var eBias = eMax >> 1;
                    var nBits = -7;
                    var i = isLE ? nBytes - 1 : 0;
                    var d = isLE ? -1 : 1;
                    var s = buffer[offset + i];

                    i += d;

                    e = s & ((1 << -nBits) - 1);
                    s >>= -nBits;
                    nBits += eLen;
                    for (
                        ;
                        nBits > 0;
                        e = e * 256 + buffer[offset + i], i += d, nBits -= 8
                    ) {}

                    m = e & ((1 << -nBits) - 1);
                    e >>= -nBits;
                    nBits += mLen;
                    for (
                        ;
                        nBits > 0;
                        m = m * 256 + buffer[offset + i], i += d, nBits -= 8
                    ) {}

                    if (e === 0) {
                        e = 1 - eBias;
                    } else if (e === eMax) {
                        return m ? NaN : (s ? -1 : 1) * Infinity;
                    } else {
                        m = m + Math.pow(2, mLen);
                        e = e - eBias;
                    }
                    return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
                };

                exports.write = function(
                    buffer,
                    value,
                    offset,
                    isLE,
                    mLen,
                    nBytes
                ) {
                    var e, m, c;
                    var eLen = nBytes * 8 - mLen - 1;
                    var eMax = (1 << eLen) - 1;
                    var eBias = eMax >> 1;
                    var rt =
                        mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
                    var i = isLE ? 0 : nBytes - 1;
                    var d = isLE ? 1 : -1;
                    var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

                    value = Math.abs(value);

                    if (isNaN(value) || value === Infinity) {
                        m = isNaN(value) ? 1 : 0;
                        e = eMax;
                    } else {
                        e = Math.floor(Math.log(value) / Math.LN2);
                        if (value * (c = Math.pow(2, -e)) < 1) {
                            e--;
                            c *= 2;
                        }
                        if (e + eBias >= 1) {
                            value += rt / c;
                        } else {
                            value += rt * Math.pow(2, 1 - eBias);
                        }
                        if (value * c >= 2) {
                            e++;
                            c /= 2;
                        }

                        if (e + eBias >= eMax) {
                            m = 0;
                            e = eMax;
                        } else if (e + eBias >= 1) {
                            m = (value * c - 1) * Math.pow(2, mLen);
                            e = e + eBias;
                        } else {
                            m =
                                value *
                                Math.pow(2, eBias - 1) *
                                Math.pow(2, mLen);
                            e = 0;
                        }
                    }

                    for (
                        ;
                        mLen >= 8;
                        buffer[offset + i] = m & 0xff,
                            i += d,
                            m /= 256,
                            mLen -= 8
                    ) {}

                    e = (e << mLen) | m;
                    eLen += mLen;
                    for (
                        ;
                        eLen > 0;
                        buffer[offset + i] = e & 0xff,
                            i += d,
                            e /= 256,
                            eLen -= 8
                    ) {}

                    buffer[offset + i - d] |= s * 128;
                };
            },
            {}
        ],
        101: [
            function(require, module, exports) {
                if (typeof Object.create === 'function') {
                    // implementation from standard node.js 'util' module
                    module.exports = function inherits(ctor, superCtor) {
                        ctor.super_ = superCtor;
                        ctor.prototype = Object.create(superCtor.prototype, {
                            constructor: {
                                value: ctor,
                                enumerable: false,
                                writable: true,
                                configurable: true
                            }
                        });
                    };
                } else {
                    // old school shim for old browsers
                    module.exports = function inherits(ctor, superCtor) {
                        ctor.super_ = superCtor;
                        var TempCtor = function() {};
                        TempCtor.prototype = superCtor.prototype;
                        ctor.prototype = new TempCtor();
                        ctor.prototype.constructor = ctor;
                    };
                }
            },
            {}
        ],
        102: [
            function(require, module, exports) {
                /*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

                // The _isBuffer check is for Safari 5-7 support, because it's missing
                // Object.prototype.constructor. Remove this eventually
                module.exports = function(obj) {
                    return (
                        obj != null &&
                        (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
                    );
                };

                function isBuffer(obj) {
                    return (
                        !!obj.constructor &&
                        typeof obj.constructor.isBuffer === 'function' &&
                        obj.constructor.isBuffer(obj)
                    );
                }

                // For Node v0.10 support. Remove this eventually.
                function isSlowBuffer(obj) {
                    return (
                        typeof obj.readFloatLE === 'function' &&
                        typeof obj.slice === 'function' &&
                        isBuffer(obj.slice(0, 0))
                    );
                }
            },
            {}
        ],
        103: [
            function(require, module, exports) {
                var toString = {}.toString;

                module.exports =
                    Array.isArray ||
                    function(arr) {
                        return toString.call(arr) == '[object Array]';
                    };
            },
            {}
        ],
        104: [
            function(require, module, exports) {
                (function(process) {
                    'use strict';

                    if (
                        !process.version ||
                        process.version.indexOf('v0.') === 0 ||
                        (process.version.indexOf('v1.') === 0 &&
                            process.version.indexOf('v1.8.') !== 0)
                    ) {
                        module.exports = nextTick;
                    } else {
                        module.exports = process.nextTick;
                    }

                    function nextTick(fn, arg1, arg2, arg3) {
                        if (typeof fn !== 'function') {
                            throw new TypeError(
                                '"callback" argument must be a function'
                            );
                        }
                        var len = arguments.length;
                        var args, i;
                        switch (len) {
                            case 0:
                            case 1:
                                return process.nextTick(fn);
                            case 2:
                                return process.nextTick(
                                    function afterTickOne() {
                                        fn.call(null, arg1);
                                    }
                                );
                            case 3:
                                return process.nextTick(
                                    function afterTickTwo() {
                                        fn.call(null, arg1, arg2);
                                    }
                                );
                            case 4:
                                return process.nextTick(
                                    function afterTickThree() {
                                        fn.call(null, arg1, arg2, arg3);
                                    }
                                );
                            default:
                                args = new Array(len - 1);
                                i = 0;
                                while (i < args.length) {
                                    args[i++] = arguments[i];
                                }
                                return process.nextTick(function afterTick() {
                                    fn.apply(null, args);
                                });
                        }
                    }
                }.call(this, require('_process')));
            },
            { _process: 105 }
        ],
        105: [
            function(require, module, exports) {
                // shim for using process in browser
                var process = (module.exports = {});

                // cached from whatever global is present so that test runners that stub it
                // don't break things.  But we need to wrap it in a try catch in case it is
                // wrapped in strict mode code which doesn't define any globals.  It's inside a
                // function because try/catches deoptimize in certain engines.

                var cachedSetTimeout;
                var cachedClearTimeout;

                function defaultSetTimout() {
                    throw new Error('setTimeout has not been defined');
                }
                function defaultClearTimeout() {
                    throw new Error('clearTimeout has not been defined');
                }
                (function() {
                    try {
                        if (typeof setTimeout === 'function') {
                            cachedSetTimeout = setTimeout;
                        } else {
                            cachedSetTimeout = defaultSetTimout;
                        }
                    } catch (e) {
                        cachedSetTimeout = defaultSetTimout;
                    }
                    try {
                        if (typeof clearTimeout === 'function') {
                            cachedClearTimeout = clearTimeout;
                        } else {
                            cachedClearTimeout = defaultClearTimeout;
                        }
                    } catch (e) {
                        cachedClearTimeout = defaultClearTimeout;
                    }
                })();
                function runTimeout(fun) {
                    if (cachedSetTimeout === setTimeout) {
                        //normal enviroments in sane situations
                        return setTimeout(fun, 0);
                    }
                    // if setTimeout wasn't available but was latter defined
                    if (
                        (cachedSetTimeout === defaultSetTimout ||
                            !cachedSetTimeout) &&
                        setTimeout
                    ) {
                        cachedSetTimeout = setTimeout;
                        return setTimeout(fun, 0);
                    }
                    try {
                        // when when somebody has screwed with setTimeout but no I.E. maddness
                        return cachedSetTimeout(fun, 0);
                    } catch (e) {
                        try {
                            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                            return cachedSetTimeout.call(null, fun, 0);
                        } catch (e) {
                            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                            return cachedSetTimeout.call(this, fun, 0);
                        }
                    }
                }
                function runClearTimeout(marker) {
                    if (cachedClearTimeout === clearTimeout) {
                        //normal enviroments in sane situations
                        return clearTimeout(marker);
                    }
                    // if clearTimeout wasn't available but was latter defined
                    if (
                        (cachedClearTimeout === defaultClearTimeout ||
                            !cachedClearTimeout) &&
                        clearTimeout
                    ) {
                        cachedClearTimeout = clearTimeout;
                        return clearTimeout(marker);
                    }
                    try {
                        // when when somebody has screwed with setTimeout but no I.E. maddness
                        return cachedClearTimeout(marker);
                    } catch (e) {
                        try {
                            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                            return cachedClearTimeout.call(null, marker);
                        } catch (e) {
                            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                            return cachedClearTimeout.call(this, marker);
                        }
                    }
                }
                var queue = [];
                var draining = false;
                var currentQueue;
                var queueIndex = -1;

                function cleanUpNextTick() {
                    if (!draining || !currentQueue) {
                        return;
                    }
                    draining = false;
                    if (currentQueue.length) {
                        queue = currentQueue.concat(queue);
                    } else {
                        queueIndex = -1;
                    }
                    if (queue.length) {
                        drainQueue();
                    }
                }

                function drainQueue() {
                    if (draining) {
                        return;
                    }
                    var timeout = runTimeout(cleanUpNextTick);
                    draining = true;

                    var len = queue.length;
                    while (len) {
                        currentQueue = queue;
                        queue = [];
                        while (++queueIndex < len) {
                            if (currentQueue) {
                                currentQueue[queueIndex].run();
                            }
                        }
                        queueIndex = -1;
                        len = queue.length;
                    }
                    currentQueue = null;
                    draining = false;
                    runClearTimeout(timeout);
                }

                process.nextTick = function(fun) {
                    var args = new Array(arguments.length - 1);
                    if (arguments.length > 1) {
                        for (var i = 1; i < arguments.length; i++) {
                            args[i - 1] = arguments[i];
                        }
                    }
                    queue.push(new Item(fun, args));
                    if (queue.length === 1 && !draining) {
                        runTimeout(drainQueue);
                    }
                };

                // v8 likes predictible objects
                function Item(fun, array) {
                    this.fun = fun;
                    this.array = array;
                }
                Item.prototype.run = function() {
                    this.fun.apply(null, this.array);
                };
                process.title = 'browser';
                process.browser = true;
                process.env = {};
                process.argv = [];
                process.version = ''; // empty string to avoid regexp issues
                process.versions = {};

                function noop() {}

                process.on = noop;
                process.addListener = noop;
                process.once = noop;
                process.off = noop;
                process.removeListener = noop;
                process.removeAllListeners = noop;
                process.emit = noop;
                process.prependListener = noop;
                process.prependOnceListener = noop;

                process.listeners = function(name) {
                    return [];
                };

                process.binding = function(name) {
                    throw new Error('process.binding is not supported');
                };

                process.cwd = function() {
                    return '/';
                };
                process.chdir = function(dir) {
                    throw new Error('process.chdir is not supported');
                };
                process.umask = function() {
                    return 0;
                };
            },
            {}
        ],
        106: [
            function(require, module, exports) {
                module.exports = require('./lib/_stream_duplex.js');
            },
            { './lib/_stream_duplex.js': 107 }
        ],
        107: [
            function(require, module, exports) {
                // Copyright Joyent, Inc. and other Node contributors.
                //
                // Permission is hereby granted, free of charge, to any person obtaining a
                // copy of this software and associated documentation files (the
                // "Software"), to deal in the Software without restriction, including
                // without limitation the rights to use, copy, modify, merge, publish,
                // distribute, sublicense, and/or sell copies of the Software, and to permit
                // persons to whom the Software is furnished to do so, subject to the
                // following conditions:
                //
                // The above copyright notice and this permission notice shall be included
                // in all copies or substantial portions of the Software.
                //
                // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
                // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
                // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
                // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
                // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
                // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
                // USE OR OTHER DEALINGS IN THE SOFTWARE.

                // a duplex stream is just a stream that is both readable and writable.
                // Since JS doesn't have multiple prototypal inheritance, this class
                // prototypally inherits from Readable, and then parasitically from
                // Writable.

                'use strict';

                /*<replacement>*/

                var processNextTick = require('process-nextick-args');
                /*</replacement>*/

                /*<replacement>*/
                var objectKeys =
                    Object.keys ||
                    function(obj) {
                        var keys = [];
                        for (var key in obj) {
                            keys.push(key);
                        }
                        return keys;
                    };
                /*</replacement>*/

                module.exports = Duplex;

                /*<replacement>*/
                var util = require('core-util-is');
                util.inherits = require('inherits');
                /*</replacement>*/

                var Readable = require('./_stream_readable');
                var Writable = require('./_stream_writable');

                util.inherits(Duplex, Readable);

                var keys = objectKeys(Writable.prototype);
                for (var v = 0; v < keys.length; v++) {
                    var method = keys[v];
                    if (!Duplex.prototype[method])
                        Duplex.prototype[method] = Writable.prototype[method];
                }

                function Duplex(options) {
                    if (!(this instanceof Duplex)) return new Duplex(options);

                    Readable.call(this, options);
                    Writable.call(this, options);

                    if (options && options.readable === false)
                        this.readable = false;

                    if (options && options.writable === false)
                        this.writable = false;

                    this.allowHalfOpen = true;
                    if (options && options.allowHalfOpen === false)
                        this.allowHalfOpen = false;

                    this.once('end', onend);
                }

                // the no-half-open enforcer
                function onend() {
                    // if we allow half-open state, or if the writable side ended,
                    // then we're ok.
                    if (this.allowHalfOpen || this._writableState.ended) return;

                    // no more data can be written.
                    // But allow more writes to happen in this tick.
                    processNextTick(onEndNT, this);
                }

                function onEndNT(self) {
                    self.end();
                }

                Object.defineProperty(Duplex.prototype, 'destroyed', {
                    get: function() {
                        if (
                            this._readableState === undefined ||
                            this._writableState === undefined
                        ) {
                            return false;
                        }
                        return (
                            this._readableState.destroyed &&
                            this._writableState.destroyed
                        );
                    },
                    set: function(value) {
                        // we ignore the value if the stream
                        // has not been initialized yet
                        if (
                            this._readableState === undefined ||
                            this._writableState === undefined
                        ) {
                            return;
                        }

                        // backward compatibility, the user is explicitly
                        // managing destroyed
                        this._readableState.destroyed = value;
                        this._writableState.destroyed = value;
                    }
                });

                Duplex.prototype._destroy = function(err, cb) {
                    this.push(null);
                    this.end();

                    processNextTick(cb, err);
                };

                function forEach(xs, f) {
                    for (var i = 0, l = xs.length; i < l; i++) {
                        f(xs[i], i);
                    }
                }
            },
            {
                './_stream_readable': 109,
                './_stream_writable': 111,
                'core-util-is': 34,
                inherits: 101,
                'process-nextick-args': 104
            }
        ],
        108: [
            function(require, module, exports) {
                // Copyright Joyent, Inc. and other Node contributors.
                //
                // Permission is hereby granted, free of charge, to any person obtaining a
                // copy of this software and associated documentation files (the
                // "Software"), to deal in the Software without restriction, including
                // without limitation the rights to use, copy, modify, merge, publish,
                // distribute, sublicense, and/or sell copies of the Software, and to permit
                // persons to whom the Software is furnished to do so, subject to the
                // following conditions:
                //
                // The above copyright notice and this permission notice shall be included
                // in all copies or substantial portions of the Software.
                //
                // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
                // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
                // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
                // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
                // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
                // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
                // USE OR OTHER DEALINGS IN THE SOFTWARE.

                // a passthrough stream.
                // basically just the most minimal sort of Transform stream.
                // Every written chunk gets output as-is.

                'use strict';

                module.exports = PassThrough;

                var Transform = require('./_stream_transform');

                /*<replacement>*/
                var util = require('core-util-is');
                util.inherits = require('inherits');
                /*</replacement>*/

                util.inherits(PassThrough, Transform);

                function PassThrough(options) {
                    if (!(this instanceof PassThrough))
                        return new PassThrough(options);

                    Transform.call(this, options);
                }

                PassThrough.prototype._transform = function(
                    chunk,
                    encoding,
                    cb
                ) {
                    cb(null, chunk);
                };
            },
            { './_stream_transform': 110, 'core-util-is': 34, inherits: 101 }
        ],
        109: [
            function(require, module, exports) {
                (function(process, global) {
                    // Copyright Joyent, Inc. and other Node contributors.
                    //
                    // Permission is hereby granted, free of charge, to any person obtaining a
                    // copy of this software and associated documentation files (the
                    // "Software"), to deal in the Software without restriction, including
                    // without limitation the rights to use, copy, modify, merge, publish,
                    // distribute, sublicense, and/or sell copies of the Software, and to permit
                    // persons to whom the Software is furnished to do so, subject to the
                    // following conditions:
                    //
                    // The above copyright notice and this permission notice shall be included
                    // in all copies or substantial portions of the Software.
                    //
                    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
                    // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
                    // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
                    // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
                    // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
                    // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
                    // USE OR OTHER DEALINGS IN THE SOFTWARE.

                    'use strict';

                    /*<replacement>*/

                    var processNextTick = require('process-nextick-args');
                    /*</replacement>*/

                    module.exports = Readable;

                    /*<replacement>*/
                    var isArray = require('isarray');
                    /*</replacement>*/

                    /*<replacement>*/
                    var Duplex;
                    /*</replacement>*/

                    Readable.ReadableState = ReadableState;

                    /*<replacement>*/
                    var EE = require('events').EventEmitter;

                    var EElistenerCount = function(emitter, type) {
                        return emitter.listeners(type).length;
                    };
                    /*</replacement>*/

                    /*<replacement>*/
                    var Stream = require('./internal/streams/stream');
                    /*</replacement>*/

                    // TODO(bmeurer): Change this back to const once hole checks are
                    // properly optimized away early in Ignition+TurboFan.
                    /*<replacement>*/
                    var Buffer = require('safe-buffer').Buffer;
                    var OurUint8Array = global.Uint8Array || function() {};
                    function _uint8ArrayToBuffer(chunk) {
                        return Buffer.from(chunk);
                    }
                    function _isUint8Array(obj) {
                        return (
                            Buffer.isBuffer(obj) || obj instanceof OurUint8Array
                        );
                    }
                    /*</replacement>*/

                    /*<replacement>*/
                    var util = require('core-util-is');
                    util.inherits = require('inherits');
                    /*</replacement>*/

                    /*<replacement>*/
                    var debugUtil = require('util');
                    var debug = void 0;
                    if (debugUtil && debugUtil.debuglog) {
                        debug = debugUtil.debuglog('stream');
                    } else {
                        debug = function() {};
                    }
                    /*</replacement>*/

                    var BufferList = require('./internal/streams/BufferList');
                    var destroyImpl = require('./internal/streams/destroy');
                    var StringDecoder;

                    util.inherits(Readable, Stream);

                    var kProxyEvents = [
                        'error',
                        'close',
                        'destroy',
                        'pause',
                        'resume'
                    ];

                    function prependListener(emitter, event, fn) {
                        // Sadly this is not cacheable as some libraries bundle their own
                        // event emitter implementation with them.
                        if (typeof emitter.prependListener === 'function') {
                            return emitter.prependListener(event, fn);
                        } else {
                            // This is a hack to make sure that our error handler is attached before any
                            // userland ones.  NEVER DO THIS. This is here only because this code needs
                            // to continue to work with older versions of Node.js that do not include
                            // the prependListener() method. The goal is to eventually remove this hack.
                            if (!emitter._events || !emitter._events[event])
                                emitter.on(event, fn);
                            else if (isArray(emitter._events[event]))
                                emitter._events[event].unshift(fn);
                            else
                                emitter._events[event] = [
                                    fn,
                                    emitter._events[event]
                                ];
                        }
                    }

                    function ReadableState(options, stream) {
                        Duplex = Duplex || require('./_stream_duplex');

                        options = options || {};

                        // object stream flag. Used to make read(n) ignore n and to
                        // make all the buffer merging and length checks go away
                        this.objectMode = !!options.objectMode;

                        if (stream instanceof Duplex)
                            this.objectMode =
                                this.objectMode || !!options.readableObjectMode;

                        // the point at which it stops calling _read() to fill the buffer
                        // Note: 0 is a valid value, means "don't call _read preemptively ever"
                        var hwm = options.highWaterMark;
                        var defaultHwm = this.objectMode ? 16 : 16 * 1024;
                        this.highWaterMark =
                            hwm || hwm === 0 ? hwm : defaultHwm;

                        // cast to ints.
                        this.highWaterMark = Math.floor(this.highWaterMark);

                        // A linked list is used to store data chunks instead of an array because the
                        // linked list can remove elements from the beginning faster than
                        // array.shift()
                        this.buffer = new BufferList();
                        this.length = 0;
                        this.pipes = null;
                        this.pipesCount = 0;
                        this.flowing = null;
                        this.ended = false;
                        this.endEmitted = false;
                        this.reading = false;

                        // a flag to be able to tell if the event 'readable'/'data' is emitted
                        // immediately, or on a later tick.  We set this to true at first, because
                        // any actions that shouldn't happen until "later" should generally also
                        // not happen before the first read call.
                        this.sync = true;

                        // whenever we return null, then we set a flag to say
                        // that we're awaiting a 'readable' event emission.
                        this.needReadable = false;
                        this.emittedReadable = false;
                        this.readableListening = false;
                        this.resumeScheduled = false;

                        // has it been destroyed
                        this.destroyed = false;

                        // Crypto is kind of old and crusty.  Historically, its default string
                        // encoding is 'binary' so we have to make this configurable.
                        // Everything else in the universe uses 'utf8', though.
                        this.defaultEncoding =
                            options.defaultEncoding || 'utf8';

                        // the number of writers that are awaiting a drain event in .pipe()s
                        this.awaitDrain = 0;

                        // if true, a maybeReadMore has been scheduled
                        this.readingMore = false;

                        this.decoder = null;
                        this.encoding = null;
                        if (options.encoding) {
                            if (!StringDecoder)
                                StringDecoder = require('string_decoder/')
                                    .StringDecoder;
                            this.decoder = new StringDecoder(options.encoding);
                            this.encoding = options.encoding;
                        }
                    }

                    function Readable(options) {
                        Duplex = Duplex || require('./_stream_duplex');

                        if (!(this instanceof Readable))
                            return new Readable(options);

                        this._readableState = new ReadableState(options, this);

                        // legacy
                        this.readable = true;

                        if (options) {
                            if (typeof options.read === 'function')
                                this._read = options.read;

                            if (typeof options.destroy === 'function')
                                this._destroy = options.destroy;
                        }

                        Stream.call(this);
                    }

                    Object.defineProperty(Readable.prototype, 'destroyed', {
                        get: function() {
                            if (this._readableState === undefined) {
                                return false;
                            }
                            return this._readableState.destroyed;
                        },
                        set: function(value) {
                            // we ignore the value if the stream
                            // has not been initialized yet
                            if (!this._readableState) {
                                return;
                            }

                            // backward compatibility, the user is explicitly
                            // managing destroyed
                            this._readableState.destroyed = value;
                        }
                    });

                    Readable.prototype.destroy = destroyImpl.destroy;
                    Readable.prototype._undestroy = destroyImpl.undestroy;
                    Readable.prototype._destroy = function(err, cb) {
                        this.push(null);
                        cb(err);
                    };

                    // Manually shove something into the read() buffer.
                    // This returns true if the highWaterMark has not been hit yet,
                    // similar to how Writable.write() returns true if you should
                    // write() some more.
                    Readable.prototype.push = function(chunk, encoding) {
                        var state = this._readableState;
                        var skipChunkCheck;

                        if (!state.objectMode) {
                            if (typeof chunk === 'string') {
                                encoding = encoding || state.defaultEncoding;
                                if (encoding !== state.encoding) {
                                    chunk = Buffer.from(chunk, encoding);
                                    encoding = '';
                                }
                                skipChunkCheck = true;
                            }
                        } else {
                            skipChunkCheck = true;
                        }

                        return readableAddChunk(
                            this,
                            chunk,
                            encoding,
                            false,
                            skipChunkCheck
                        );
                    };

                    // Unshift should *always* be something directly out of read()
                    Readable.prototype.unshift = function(chunk) {
                        return readableAddChunk(this, chunk, null, true, false);
                    };

                    function readableAddChunk(
                        stream,
                        chunk,
                        encoding,
                        addToFront,
                        skipChunkCheck
                    ) {
                        var state = stream._readableState;
                        if (chunk === null) {
                            state.reading = false;
                            onEofChunk(stream, state);
                        } else {
                            var er;
                            if (!skipChunkCheck)
                                er = chunkInvalid(state, chunk);
                            if (er) {
                                stream.emit('error', er);
                            } else if (
                                state.objectMode ||
                                (chunk && chunk.length > 0)
                            ) {
                                if (
                                    typeof chunk !== 'string' &&
                                    !state.objectMode &&
                                    Object.getPrototypeOf(chunk) !==
                                        Buffer.prototype
                                ) {
                                    chunk = _uint8ArrayToBuffer(chunk);
                                }

                                if (addToFront) {
                                    if (state.endEmitted)
                                        stream.emit(
                                            'error',
                                            new Error(
                                                'stream.unshift() after end event'
                                            )
                                        );
                                    else addChunk(stream, state, chunk, true);
                                } else if (state.ended) {
                                    stream.emit(
                                        'error',
                                        new Error('stream.push() after EOF')
                                    );
                                } else {
                                    state.reading = false;
                                    if (state.decoder && !encoding) {
                                        chunk = state.decoder.write(chunk);
                                        if (
                                            state.objectMode ||
                                            chunk.length !== 0
                                        )
                                            addChunk(
                                                stream,
                                                state,
                                                chunk,
                                                false
                                            );
                                        else maybeReadMore(stream, state);
                                    } else {
                                        addChunk(stream, state, chunk, false);
                                    }
                                }
                            } else if (!addToFront) {
                                state.reading = false;
                            }
                        }

                        return needMoreData(state);
                    }

                    function addChunk(stream, state, chunk, addToFront) {
                        if (
                            state.flowing &&
                            state.length === 0 &&
                            !state.sync
                        ) {
                            stream.emit('data', chunk);
                            stream.read(0);
                        } else {
                            // update the buffer info.
                            state.length += state.objectMode ? 1 : chunk.length;
                            if (addToFront) state.buffer.unshift(chunk);
                            else state.buffer.push(chunk);

                            if (state.needReadable) emitReadable(stream);
                        }
                        maybeReadMore(stream, state);
                    }

                    function chunkInvalid(state, chunk) {
                        var er;
                        if (
                            !_isUint8Array(chunk) &&
                            typeof chunk !== 'string' &&
                            chunk !== undefined &&
                            !state.objectMode
                        ) {
                            er = new TypeError(
                                'Invalid non-string/buffer chunk'
                            );
                        }
                        return er;
                    }

                    // if it's past the high water mark, we can push in some more.
                    // Also, if we have no data yet, we can stand some
                    // more bytes.  This is to work around cases where hwm=0,
                    // such as the repl.  Also, if the push() triggered a
                    // readable event, and the user called read(largeNumber) such that
                    // needReadable was set, then we ought to push more, so that another
                    // 'readable' event will be triggered.
                    function needMoreData(state) {
                        return (
                            !state.ended &&
                            (state.needReadable ||
                                state.length < state.highWaterMark ||
                                state.length === 0)
                        );
                    }

                    Readable.prototype.isPaused = function() {
                        return this._readableState.flowing === false;
                    };

                    // backwards compatibility.
                    Readable.prototype.setEncoding = function(enc) {
                        if (!StringDecoder)
                            StringDecoder = require('string_decoder/')
                                .StringDecoder;
                        this._readableState.decoder = new StringDecoder(enc);
                        this._readableState.encoding = enc;
                        return this;
                    };

                    // Don't raise the hwm > 8MB
                    var MAX_HWM = 0x800000;
                    function computeNewHighWaterMark(n) {
                        if (n >= MAX_HWM) {
                            n = MAX_HWM;
                        } else {
                            // Get the next highest power of 2 to prevent increasing hwm excessively in
                            // tiny amounts
                            n--;
                            n |= n >>> 1;
                            n |= n >>> 2;
                            n |= n >>> 4;
                            n |= n >>> 8;
                            n |= n >>> 16;
                            n++;
                        }
                        return n;
                    }

                    // This function is designed to be inlinable, so please take care when making
                    // changes to the function body.
                    function howMuchToRead(n, state) {
                        if (n <= 0 || (state.length === 0 && state.ended))
                            return 0;
                        if (state.objectMode) return 1;
                        if (n !== n) {
                            // Only flow one buffer at a time
                            if (state.flowing && state.length)
                                return state.buffer.head.data.length;
                            else return state.length;
                        }
                        // If we're asking for more than the current hwm, then raise the hwm.
                        if (n > state.highWaterMark)
                            state.highWaterMark = computeNewHighWaterMark(n);
                        if (n <= state.length) return n;
                        // Don't have enough
                        if (!state.ended) {
                            state.needReadable = true;
                            return 0;
                        }
                        return state.length;
                    }

                    // you can override either this method, or the async _read(n) below.
                    Readable.prototype.read = function(n) {
                        debug('read', n);
                        n = parseInt(n, 10);
                        var state = this._readableState;
                        var nOrig = n;

                        if (n !== 0) state.emittedReadable = false;

                        // if we're doing read(0) to trigger a readable event, but we
                        // already have a bunch of data in the buffer, then just trigger
                        // the 'readable' event and move on.
                        if (
                            n === 0 &&
                            state.needReadable &&
                            (state.length >= state.highWaterMark || state.ended)
                        ) {
                            debug(
                                'read: emitReadable',
                                state.length,
                                state.ended
                            );
                            if (state.length === 0 && state.ended)
                                endReadable(this);
                            else emitReadable(this);
                            return null;
                        }

                        n = howMuchToRead(n, state);

                        // if we've ended, and we're now clear, then finish it up.
                        if (n === 0 && state.ended) {
                            if (state.length === 0) endReadable(this);
                            return null;
                        }

                        // All the actual chunk generation logic needs to be
                        // *below* the call to _read.  The reason is that in certain
                        // synthetic stream cases, such as passthrough streams, _read
                        // may be a completely synchronous operation which may change
                        // the state of the read buffer, providing enough data when
                        // before there was *not* enough.
                        //
                        // So, the steps are:
                        // 1. Figure out what the state of things will be after we do
                        // a read from the buffer.
                        //
                        // 2. If that resulting state will trigger a _read, then call _read.
                        // Note that this may be asynchronous, or synchronous.  Yes, it is
                        // deeply ugly to write APIs this way, but that still doesn't mean
                        // that the Readable class should behave improperly, as streams are
                        // designed to be sync/async agnostic.
                        // Take note if the _read call is sync or async (ie, if the read call
                        // has returned yet), so that we know whether or not it's safe to emit
                        // 'readable' etc.
                        //
                        // 3. Actually pull the requested chunks out of the buffer and return.

                        // if we need a readable event, then we need to do some reading.
                        var doRead = state.needReadable;
                        debug('need readable', doRead);

                        // if we currently have less than the highWaterMark, then also read some
                        if (
                            state.length === 0 ||
                            state.length - n < state.highWaterMark
                        ) {
                            doRead = true;
                            debug('length less than watermark', doRead);
                        }

                        // however, if we've ended, then there's no point, and if we're already
                        // reading, then it's unnecessary.
                        if (state.ended || state.reading) {
                            doRead = false;
                            debug('reading or ended', doRead);
                        } else if (doRead) {
                            debug('do read');
                            state.reading = true;
                            state.sync = true;
                            // if the length is currently zero, then we *need* a readable event.
                            if (state.length === 0) state.needReadable = true;
                            // call internal read method
                            this._read(state.highWaterMark);
                            state.sync = false;
                            // If _read pushed data synchronously, then `reading` will be false,
                            // and we need to re-evaluate how much data we can return to the user.
                            if (!state.reading) n = howMuchToRead(nOrig, state);
                        }

                        var ret;
                        if (n > 0) ret = fromList(n, state);
                        else ret = null;

                        if (ret === null) {
                            state.needReadable = true;
                            n = 0;
                        } else {
                            state.length -= n;
                        }

                        if (state.length === 0) {
                            // If we have nothing in the buffer, then we want to know
                            // as soon as we *do* get something into the buffer.
                            if (!state.ended) state.needReadable = true;

                            // If we tried to read() past the EOF, then emit end on the next tick.
                            if (nOrig !== n && state.ended) endReadable(this);
                        }

                        if (ret !== null) this.emit('data', ret);

                        return ret;
                    };

                    function onEofChunk(stream, state) {
                        if (state.ended) return;
                        if (state.decoder) {
                            var chunk = state.decoder.end();
                            if (chunk && chunk.length) {
                                state.buffer.push(chunk);
                                state.length += state.objectMode
                                    ? 1
                                    : chunk.length;
                            }
                        }
                        state.ended = true;

                        // emit 'readable' now to make sure it gets picked up.
                        emitReadable(stream);
                    }

                    // Don't emit readable right away in sync mode, because this can trigger
                    // another read() call => stack overflow.  This way, it might trigger
                    // a nextTick recursion warning, but that's not so bad.
                    function emitReadable(stream) {
                        var state = stream._readableState;
                        state.needReadable = false;
                        if (!state.emittedReadable) {
                            debug('emitReadable', state.flowing);
                            state.emittedReadable = true;
                            if (state.sync)
                                processNextTick(emitReadable_, stream);
                            else emitReadable_(stream);
                        }
                    }

                    function emitReadable_(stream) {
                        debug('emit readable');
                        stream.emit('readable');
                        flow(stream);
                    }

                    // at this point, the user has presumably seen the 'readable' event,
                    // and called read() to consume some data.  that may have triggered
                    // in turn another _read(n) call, in which case reading = true if
                    // it's in progress.
                    // However, if we're not ended, or reading, and the length < hwm,
                    // then go ahead and try to read some more preemptively.
                    function maybeReadMore(stream, state) {
                        if (!state.readingMore) {
                            state.readingMore = true;
                            processNextTick(maybeReadMore_, stream, state);
                        }
                    }

                    function maybeReadMore_(stream, state) {
                        var len = state.length;
                        while (
                            !state.reading &&
                            !state.flowing &&
                            !state.ended &&
                            state.length < state.highWaterMark
                        ) {
                            debug('maybeReadMore read 0');
                            stream.read(0);
                            if (len === state.length)
                                // didn't get any data, stop spinning.
                                break;
                            else len = state.length;
                        }
                        state.readingMore = false;
                    }

                    // abstract method.  to be overridden in specific implementation classes.
                    // call cb(er, data) where data is <= n in length.
                    // for virtual (non-string, non-buffer) streams, "length" is somewhat
                    // arbitrary, and perhaps not very meaningful.
                    Readable.prototype._read = function(n) {
                        this.emit(
                            'error',
                            new Error('_read() is not implemented')
                        );
                    };

                    Readable.prototype.pipe = function(dest, pipeOpts) {
                        var src = this;
                        var state = this._readableState;

                        switch (state.pipesCount) {
                            case 0:
                                state.pipes = dest;
                                break;
                            case 1:
                                state.pipes = [state.pipes, dest];
                                break;
                            default:
                                state.pipes.push(dest);
                                break;
                        }
                        state.pipesCount += 1;
                        debug(
                            'pipe count=%d opts=%j',
                            state.pipesCount,
                            pipeOpts
                        );

                        var doEnd =
                            (!pipeOpts || pipeOpts.end !== false) &&
                            dest !== process.stdout &&
                            dest !== process.stderr;

                        var endFn = doEnd ? onend : unpipe;
                        if (state.endEmitted) processNextTick(endFn);
                        else src.once('end', endFn);

                        dest.on('unpipe', onunpipe);
                        function onunpipe(readable, unpipeInfo) {
                            debug('onunpipe');
                            if (readable === src) {
                                if (
                                    unpipeInfo &&
                                    unpipeInfo.hasUnpiped === false
                                ) {
                                    unpipeInfo.hasUnpiped = true;
                                    cleanup();
                                }
                            }
                        }

                        function onend() {
                            debug('onend');
                            dest.end();
                        }

                        // when the dest drains, it reduces the awaitDrain counter
                        // on the source.  This would be more elegant with a .once()
                        // handler in flow(), but adding and removing repeatedly is
                        // too slow.
                        var ondrain = pipeOnDrain(src);
                        dest.on('drain', ondrain);

                        var cleanedUp = false;
                        function cleanup() {
                            debug('cleanup');
                            // cleanup event handlers once the pipe is broken
                            dest.removeListener('close', onclose);
                            dest.removeListener('finish', onfinish);
                            dest.removeListener('drain', ondrain);
                            dest.removeListener('error', onerror);
                            dest.removeListener('unpipe', onunpipe);
                            src.removeListener('end', onend);
                            src.removeListener('end', unpipe);
                            src.removeListener('data', ondata);

                            cleanedUp = true;

                            // if the reader is waiting for a drain event from this
                            // specific writer, then it would cause it to never start
                            // flowing again.
                            // So, if this is awaiting a drain, then we just call it now.
                            // If we don't know, then assume that we are waiting for one.
                            if (
                                state.awaitDrain &&
                                (!dest._writableState ||
                                    dest._writableState.needDrain)
                            )
                                ondrain();
                        }

                        // If the user pushes more data while we're writing to dest then we'll end up
                        // in ondata again. However, we only want to increase awaitDrain once because
                        // dest will only emit one 'drain' event for the multiple writes.
                        // => Introduce a guard on increasing awaitDrain.
                        var increasedAwaitDrain = false;
                        src.on('data', ondata);
                        function ondata(chunk) {
                            debug('ondata');
                            increasedAwaitDrain = false;
                            var ret = dest.write(chunk);
                            if (false === ret && !increasedAwaitDrain) {
                                // If the user unpiped during `dest.write()`, it is possible
                                // to get stuck in a permanently paused state if that write
                                // also returned false.
                                // => Check whether `dest` is still a piping destination.
                                if (
                                    ((state.pipesCount === 1 &&
                                        state.pipes === dest) ||
                                        (state.pipesCount > 1 &&
                                            indexOf(state.pipes, dest) !==
                                                -1)) &&
                                    !cleanedUp
                                ) {
                                    debug(
                                        'false write response, pause',
                                        src._readableState.awaitDrain
                                    );
                                    src._readableState.awaitDrain++;
                                    increasedAwaitDrain = true;
                                }
                                src.pause();
                            }
                        }

                        // if the dest has an error, then stop piping into it.
                        // however, don't suppress the throwing behavior for this.
                        function onerror(er) {
                            debug('onerror', er);
                            unpipe();
                            dest.removeListener('error', onerror);
                            if (EElistenerCount(dest, 'error') === 0)
                                dest.emit('error', er);
                        }

                        // Make sure our error handler is attached before userland ones.
                        prependListener(dest, 'error', onerror);

                        // Both close and finish should trigger unpipe, but only once.
                        function onclose() {
                            dest.removeListener('finish', onfinish);
                            unpipe();
                        }
                        dest.once('close', onclose);
                        function onfinish() {
                            debug('onfinish');
                            dest.removeListener('close', onclose);
                            unpipe();
                        }
                        dest.once('finish', onfinish);

                        function unpipe() {
                            debug('unpipe');
                            src.unpipe(dest);
                        }

                        // tell the dest that it's being piped to
                        dest.emit('pipe', src);

                        // start the flow if it hasn't been started already.
                        if (!state.flowing) {
                            debug('pipe resume');
                            src.resume();
                        }

                        return dest;
                    };

                    function pipeOnDrain(src) {
                        return function() {
                            var state = src._readableState;
                            debug('pipeOnDrain', state.awaitDrain);
                            if (state.awaitDrain) state.awaitDrain--;
                            if (
                                state.awaitDrain === 0 &&
                                EElistenerCount(src, 'data')
                            ) {
                                state.flowing = true;
                                flow(src);
                            }
                        };
                    }

                    Readable.prototype.unpipe = function(dest) {
                        var state = this._readableState;
                        var unpipeInfo = { hasUnpiped: false };

                        // if we're not piping anywhere, then do nothing.
                        if (state.pipesCount === 0) return this;

                        // just one destination.  most common case.
                        if (state.pipesCount === 1) {
                            // passed in one, but it's not the right one.
                            if (dest && dest !== state.pipes) return this;

                            if (!dest) dest = state.pipes;

                            // got a match.
                            state.pipes = null;
                            state.pipesCount = 0;
                            state.flowing = false;
                            if (dest) dest.emit('unpipe', this, unpipeInfo);
                            return this;
                        }

                        // slow case. multiple pipe destinations.

                        if (!dest) {
                            // remove all.
                            var dests = state.pipes;
                            var len = state.pipesCount;
                            state.pipes = null;
                            state.pipesCount = 0;
                            state.flowing = false;

                            for (var i = 0; i < len; i++) {
                                dests[i].emit('unpipe', this, unpipeInfo);
                            }
                            return this;
                        }

                        // try to find the right one.
                        var index = indexOf(state.pipes, dest);
                        if (index === -1) return this;

                        state.pipes.splice(index, 1);
                        state.pipesCount -= 1;
                        if (state.pipesCount === 1)
                            state.pipes = state.pipes[0];

                        dest.emit('unpipe', this, unpipeInfo);

                        return this;
                    };

                    // set up data events if they are asked for
                    // Ensure readable listeners eventually get something
                    Readable.prototype.on = function(ev, fn) {
                        var res = Stream.prototype.on.call(this, ev, fn);

                        if (ev === 'data') {
                            // Start flowing on next tick if stream isn't explicitly paused
                            if (this._readableState.flowing !== false)
                                this.resume();
                        } else if (ev === 'readable') {
                            var state = this._readableState;
                            if (!state.endEmitted && !state.readableListening) {
                                state.readableListening = state.needReadable = true;
                                state.emittedReadable = false;
                                if (!state.reading) {
                                    processNextTick(nReadingNextTick, this);
                                } else if (state.length) {
                                    emitReadable(this);
                                }
                            }
                        }

                        return res;
                    };
                    Readable.prototype.addListener = Readable.prototype.on;

                    function nReadingNextTick(self) {
                        debug('readable nexttick read 0');
                        self.read(0);
                    }

                    // pause() and resume() are remnants of the legacy readable stream API
                    // If the user uses them, then switch into old mode.
                    Readable.prototype.resume = function() {
                        var state = this._readableState;
                        if (!state.flowing) {
                            debug('resume');
                            state.flowing = true;
                            resume(this, state);
                        }
                        return this;
                    };

                    function resume(stream, state) {
                        if (!state.resumeScheduled) {
                            state.resumeScheduled = true;
                            processNextTick(resume_, stream, state);
                        }
                    }

                    function resume_(stream, state) {
                        if (!state.reading) {
                            debug('resume read 0');
                            stream.read(0);
                        }

                        state.resumeScheduled = false;
                        state.awaitDrain = 0;
                        stream.emit('resume');
                        flow(stream);
                        if (state.flowing && !state.reading) stream.read(0);
                    }

                    Readable.prototype.pause = function() {
                        debug(
                            'call pause flowing=%j',
                            this._readableState.flowing
                        );
                        if (false !== this._readableState.flowing) {
                            debug('pause');
                            this._readableState.flowing = false;
                            this.emit('pause');
                        }
                        return this;
                    };

                    function flow(stream) {
                        var state = stream._readableState;
                        debug('flow', state.flowing);
                        while (state.flowing && stream.read() !== null) {}
                    }

                    // wrap an old-style stream as the async data source.
                    // This is *not* part of the readable stream interface.
                    // It is an ugly unfortunate mess of history.
                    Readable.prototype.wrap = function(stream) {
                        var state = this._readableState;
                        var paused = false;

                        var self = this;
                        stream.on('end', function() {
                            debug('wrapped end');
                            if (state.decoder && !state.ended) {
                                var chunk = state.decoder.end();
                                if (chunk && chunk.length) self.push(chunk);
                            }

                            self.push(null);
                        });

                        stream.on('data', function(chunk) {
                            debug('wrapped data');
                            if (state.decoder)
                                chunk = state.decoder.write(chunk);

                            // don't skip over falsy values in objectMode
                            if (
                                state.objectMode &&
                                (chunk === null || chunk === undefined)
                            )
                                return;
                            else if (
                                !state.objectMode &&
                                (!chunk || !chunk.length)
                            )
                                return;

                            var ret = self.push(chunk);
                            if (!ret) {
                                paused = true;
                                stream.pause();
                            }
                        });

                        // proxy all the other methods.
                        // important when wrapping filters and duplexes.
                        for (var i in stream) {
                            if (
                                this[i] === undefined &&
                                typeof stream[i] === 'function'
                            ) {
                                this[i] = (function(method) {
                                    return function() {
                                        return stream[method].apply(
                                            stream,
                                            arguments
                                        );
                                    };
                                })(i);
                            }
                        }

                        // proxy certain important events.
                        for (var n = 0; n < kProxyEvents.length; n++) {
                            stream.on(
                                kProxyEvents[n],
                                self.emit.bind(self, kProxyEvents[n])
                            );
                        }

                        // when we try to consume some more bytes, simply unpause the
                        // underlying stream.
                        self._read = function(n) {
                            debug('wrapped _read', n);
                            if (paused) {
                                paused = false;
                                stream.resume();
                            }
                        };

                        return self;
                    };

                    // exposed for testing purposes only.
                    Readable._fromList = fromList;

                    // Pluck off n bytes from an array of buffers.
                    // Length is the combined lengths of all the buffers in the list.
                    // This function is designed to be inlinable, so please take care when making
                    // changes to the function body.
                    function fromList(n, state) {
                        // nothing buffered
                        if (state.length === 0) return null;

                        var ret;
                        if (state.objectMode) ret = state.buffer.shift();
                        else if (!n || n >= state.length) {
                            // read it all, truncate the list
                            if (state.decoder) ret = state.buffer.join('');
                            else if (state.buffer.length === 1)
                                ret = state.buffer.head.data;
                            else ret = state.buffer.concat(state.length);
                            state.buffer.clear();
                        } else {
                            // read part of list
                            ret = fromListPartial(
                                n,
                                state.buffer,
                                state.decoder
                            );
                        }

                        return ret;
                    }

                    // Extracts only enough buffered data to satisfy the amount requested.
                    // This function is designed to be inlinable, so please take care when making
                    // changes to the function body.
                    function fromListPartial(n, list, hasStrings) {
                        var ret;
                        if (n < list.head.data.length) {
                            // slice is the same for buffers and strings
                            ret = list.head.data.slice(0, n);
                            list.head.data = list.head.data.slice(n);
                        } else if (n === list.head.data.length) {
                            // first chunk is a perfect match
                            ret = list.shift();
                        } else {
                            // result spans more than one buffer
                            ret = hasStrings
                                ? copyFromBufferString(n, list)
                                : copyFromBuffer(n, list);
                        }
                        return ret;
                    }

                    // Copies a specified amount of characters from the list of buffered data
                    // chunks.
                    // This function is designed to be inlinable, so please take care when making
                    // changes to the function body.
                    function copyFromBufferString(n, list) {
                        var p = list.head;
                        var c = 1;
                        var ret = p.data;
                        n -= ret.length;
                        while ((p = p.next)) {
                            var str = p.data;
                            var nb = n > str.length ? str.length : n;
                            if (nb === str.length) ret += str;
                            else ret += str.slice(0, n);
                            n -= nb;
                            if (n === 0) {
                                if (nb === str.length) {
                                    ++c;
                                    if (p.next) list.head = p.next;
                                    else list.head = list.tail = null;
                                } else {
                                    list.head = p;
                                    p.data = str.slice(nb);
                                }
                                break;
                            }
                            ++c;
                        }
                        list.length -= c;
                        return ret;
                    }

                    // Copies a specified amount of bytes from the list of buffered data chunks.
                    // This function is designed to be inlinable, so please take care when making
                    // changes to the function body.
                    function copyFromBuffer(n, list) {
                        var ret = Buffer.allocUnsafe(n);
                        var p = list.head;
                        var c = 1;
                        p.data.copy(ret);
                        n -= p.data.length;
                        while ((p = p.next)) {
                            var buf = p.data;
                            var nb = n > buf.length ? buf.length : n;
                            buf.copy(ret, ret.length - n, 0, nb);
                            n -= nb;
                            if (n === 0) {
                                if (nb === buf.length) {
                                    ++c;
                                    if (p.next) list.head = p.next;
                                    else list.head = list.tail = null;
                                } else {
                                    list.head = p;
                                    p.data = buf.slice(nb);
                                }
                                break;
                            }
                            ++c;
                        }
                        list.length -= c;
                        return ret;
                    }

                    function endReadable(stream) {
                        var state = stream._readableState;

                        // If we get here before consuming all the bytes, then that is a
                        // bug in node.  Should never happen.
                        if (state.length > 0)
                            throw new Error(
                                '"endReadable()" called on non-empty stream'
                            );

                        if (!state.endEmitted) {
                            state.ended = true;
                            processNextTick(endReadableNT, state, stream);
                        }
                    }

                    function endReadableNT(state, stream) {
                        // Check that we didn't get one last unshift.
                        if (!state.endEmitted && state.length === 0) {
                            state.endEmitted = true;
                            stream.readable = false;
                            stream.emit('end');
                        }
                    }

                    function forEach(xs, f) {
                        for (var i = 0, l = xs.length; i < l; i++) {
                            f(xs[i], i);
                        }
                    }

                    function indexOf(xs, x) {
                        for (var i = 0, l = xs.length; i < l; i++) {
                            if (xs[i] === x) return i;
                        }
                        return -1;
                    }
                }.call(
                    this,
                    require('_process'),
                    typeof global !== 'undefined'
                        ? global
                        : typeof self !== 'undefined'
                          ? self
                          : typeof window !== 'undefined' ? window : {}
                ));
            },
            {
                './_stream_duplex': 107,
                './internal/streams/BufferList': 112,
                './internal/streams/destroy': 113,
                './internal/streams/stream': 114,
                _process: 105,
                'core-util-is': 34,
                events: 99,
                inherits: 101,
                isarray: 103,
                'process-nextick-args': 104,
                'safe-buffer': 119,
                'string_decoder/': 139,
                util: 32
            }
        ],
        110: [
            function(require, module, exports) {
                // Copyright Joyent, Inc. and other Node contributors.
                //
                // Permission is hereby granted, free of charge, to any person obtaining a
                // copy of this software and associated documentation files (the
                // "Software"), to deal in the Software without restriction, including
                // without limitation the rights to use, copy, modify, merge, publish,
                // distribute, sublicense, and/or sell copies of the Software, and to permit
                // persons to whom the Software is furnished to do so, subject to the
                // following conditions:
                //
                // The above copyright notice and this permission notice shall be included
                // in all copies or substantial portions of the Software.
                //
                // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
                // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
                // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
                // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
                // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
                // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
                // USE OR OTHER DEALINGS IN THE SOFTWARE.

                // a transform stream is a readable/writable stream where you do
                // something with the data.  Sometimes it's called a "filter",
                // but that's not a great name for it, since that implies a thing where
                // some bits pass through, and others are simply ignored.  (That would
                // be a valid example of a transform, of course.)
                //
                // While the output is causally related to the input, it's not a
                // necessarily symmetric or synchronous transformation.  For example,
                // a zlib stream might take multiple plain-text writes(), and then
                // emit a single compressed chunk some time in the future.
                //
                // Here's how this works:
                //
                // The Transform stream has all the aspects of the readable and writable
                // stream classes.  When you write(chunk), that calls _write(chunk,cb)
                // internally, and returns false if there's a lot of pending writes
                // buffered up.  When you call read(), that calls _read(n) until
                // there's enough pending readable data buffered up.
                //
                // In a transform stream, the written data is placed in a buffer.  When
                // _read(n) is called, it transforms the queued up data, calling the
                // buffered _write cb's as it consumes chunks.  If consuming a single
                // written chunk would result in multiple output chunks, then the first
                // outputted bit calls the readcb, and subsequent chunks just go into
                // the read buffer, and will cause it to emit 'readable' if necessary.
                //
                // This way, back-pressure is actually determined by the reading side,
                // since _read has to be called to start processing a new chunk.  However,
                // a pathological inflate type of transform can cause excessive buffering
                // here.  For example, imagine a stream where every byte of input is
                // interpreted as an integer from 0-255, and then results in that many
                // bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
                // 1kb of data being output.  In this case, you could write a very small
                // amount of input, and end up with a very large amount of output.  In
                // such a pathological inflating mechanism, there'd be no way to tell
                // the system to stop doing the transform.  A single 4MB write could
                // cause the system to run out of memory.
                //
                // However, even in such a pathological case, only a single written chunk
                // would be consumed, and then the rest would wait (un-transformed) until
                // the results of the previous transformed chunk were consumed.

                'use strict';

                module.exports = Transform;

                var Duplex = require('./_stream_duplex');

                /*<replacement>*/
                var util = require('core-util-is');
                util.inherits = require('inherits');
                /*</replacement>*/

                util.inherits(Transform, Duplex);

                function TransformState(stream) {
                    this.afterTransform = function(er, data) {
                        return afterTransform(stream, er, data);
                    };

                    this.needTransform = false;
                    this.transforming = false;
                    this.writecb = null;
                    this.writechunk = null;
                    this.writeencoding = null;
                }

                function afterTransform(stream, er, data) {
                    var ts = stream._transformState;
                    ts.transforming = false;

                    var cb = ts.writecb;

                    if (!cb) {
                        return stream.emit(
                            'error',
                            new Error('write callback called multiple times')
                        );
                    }

                    ts.writechunk = null;
                    ts.writecb = null;

                    if (data !== null && data !== undefined) stream.push(data);

                    cb(er);

                    var rs = stream._readableState;
                    rs.reading = false;
                    if (rs.needReadable || rs.length < rs.highWaterMark) {
                        stream._read(rs.highWaterMark);
                    }
                }

                function Transform(options) {
                    if (!(this instanceof Transform))
                        return new Transform(options);

                    Duplex.call(this, options);

                    this._transformState = new TransformState(this);

                    var stream = this;

                    // start out asking for a readable event once data is transformed.
                    this._readableState.needReadable = true;

                    // we have implemented the _read method, and done the other things
                    // that Readable wants before the first _read call, so unset the
                    // sync guard flag.
                    this._readableState.sync = false;

                    if (options) {
                        if (typeof options.transform === 'function')
                            this._transform = options.transform;

                        if (typeof options.flush === 'function')
                            this._flush = options.flush;
                    }

                    // When the writable side finishes, then flush out anything remaining.
                    this.once('prefinish', function() {
                        if (typeof this._flush === 'function')
                            this._flush(function(er, data) {
                                done(stream, er, data);
                            });
                        else done(stream);
                    });
                }

                Transform.prototype.push = function(chunk, encoding) {
                    this._transformState.needTransform = false;
                    return Duplex.prototype.push.call(this, chunk, encoding);
                };

                // This is the part where you do stuff!
                // override this function in implementation classes.
                // 'chunk' is an input chunk.
                //
                // Call `push(newChunk)` to pass along transformed output
                // to the readable side.  You may call 'push' zero or more times.
                //
                // Call `cb(err)` when you are done with this chunk.  If you pass
                // an error, then that'll put the hurt on the whole operation.  If you
                // never call cb(), then you'll never get another chunk.
                Transform.prototype._transform = function(chunk, encoding, cb) {
                    throw new Error('_transform() is not implemented');
                };

                Transform.prototype._write = function(chunk, encoding, cb) {
                    var ts = this._transformState;
                    ts.writecb = cb;
                    ts.writechunk = chunk;
                    ts.writeencoding = encoding;
                    if (!ts.transforming) {
                        var rs = this._readableState;
                        if (
                            ts.needTransform ||
                            rs.needReadable ||
                            rs.length < rs.highWaterMark
                        )
                            this._read(rs.highWaterMark);
                    }
                };

                // Doesn't matter what the args are here.
                // _transform does all the work.
                // That we got here means that the readable side wants more data.
                Transform.prototype._read = function(n) {
                    var ts = this._transformState;

                    if (
                        ts.writechunk !== null &&
                        ts.writecb &&
                        !ts.transforming
                    ) {
                        ts.transforming = true;
                        this._transform(
                            ts.writechunk,
                            ts.writeencoding,
                            ts.afterTransform
                        );
                    } else {
                        // mark that we need a transform, so that any data that comes in
                        // will get processed, now that we've asked for it.
                        ts.needTransform = true;
                    }
                };

                Transform.prototype._destroy = function(err, cb) {
                    var _this = this;

                    Duplex.prototype._destroy.call(this, err, function(err2) {
                        cb(err2);
                        _this.emit('close');
                    });
                };

                function done(stream, er, data) {
                    if (er) return stream.emit('error', er);

                    if (data !== null && data !== undefined) stream.push(data);

                    // if there's nothing in the write buffer, then that means
                    // that nothing more will ever be provided
                    var ws = stream._writableState;
                    var ts = stream._transformState;

                    if (ws.length)
                        throw new Error(
                            'Calling transform done when ws.length != 0'
                        );

                    if (ts.transforming)
                        throw new Error(
                            'Calling transform done when still transforming'
                        );

                    return stream.push(null);
                }
            },
            { './_stream_duplex': 107, 'core-util-is': 34, inherits: 101 }
        ],
        111: [
            function(require, module, exports) {
                (function(process, global) {
                    // Copyright Joyent, Inc. and other Node contributors.
                    //
                    // Permission is hereby granted, free of charge, to any person obtaining a
                    // copy of this software and associated documentation files (the
                    // "Software"), to deal in the Software without restriction, including
                    // without limitation the rights to use, copy, modify, merge, publish,
                    // distribute, sublicense, and/or sell copies of the Software, and to permit
                    // persons to whom the Software is furnished to do so, subject to the
                    // following conditions:
                    //
                    // The above copyright notice and this permission notice shall be included
                    // in all copies or substantial portions of the Software.
                    //
                    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
                    // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
                    // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
                    // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
                    // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
                    // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
                    // USE OR OTHER DEALINGS IN THE SOFTWARE.

                    // A bit simpler than readable streams.
                    // Implement an async ._write(chunk, encoding, cb), and it'll handle all
                    // the drain event emission and buffering.

                    'use strict';

                    /*<replacement>*/

                    var processNextTick = require('process-nextick-args');
                    /*</replacement>*/

                    module.exports = Writable;

                    /* <replacement> */
                    function WriteReq(chunk, encoding, cb) {
                        this.chunk = chunk;
                        this.encoding = encoding;
                        this.callback = cb;
                        this.next = null;
                    }

                    // It seems a linked list but it is not
                    // there will be only 2 of these for each stream
                    function CorkedRequest(state) {
                        var _this = this;

                        this.next = null;
                        this.entry = null;
                        this.finish = function() {
                            onCorkedFinish(_this, state);
                        };
                    }
                    /* </replacement> */

                    /*<replacement>*/
                    var asyncWrite =
                        !process.browser &&
                        ['v0.10', 'v0.9.'].indexOf(
                            process.version.slice(0, 5)
                        ) > -1
                            ? setImmediate
                            : processNextTick;
                    /*</replacement>*/

                    /*<replacement>*/
                    var Duplex;
                    /*</replacement>*/

                    Writable.WritableState = WritableState;

                    /*<replacement>*/
                    var util = require('core-util-is');
                    util.inherits = require('inherits');
                    /*</replacement>*/

                    /*<replacement>*/
                    var internalUtil = {
                        deprecate: require('util-deprecate')
                    };
                    /*</replacement>*/

                    /*<replacement>*/
                    var Stream = require('./internal/streams/stream');
                    /*</replacement>*/

                    /*<replacement>*/
                    var Buffer = require('safe-buffer').Buffer;
                    var OurUint8Array = global.Uint8Array || function() {};
                    function _uint8ArrayToBuffer(chunk) {
                        return Buffer.from(chunk);
                    }
                    function _isUint8Array(obj) {
                        return (
                            Buffer.isBuffer(obj) || obj instanceof OurUint8Array
                        );
                    }
                    /*</replacement>*/

                    var destroyImpl = require('./internal/streams/destroy');

                    util.inherits(Writable, Stream);

                    function nop() {}

                    function WritableState(options, stream) {
                        Duplex = Duplex || require('./_stream_duplex');

                        options = options || {};

                        // object stream flag to indicate whether or not this stream
                        // contains buffers or objects.
                        this.objectMode = !!options.objectMode;

                        if (stream instanceof Duplex)
                            this.objectMode =
                                this.objectMode || !!options.writableObjectMode;

                        // the point at which write() starts returning false
                        // Note: 0 is a valid value, means that we always return false if
                        // the entire buffer is not flushed immediately on write()
                        var hwm = options.highWaterMark;
                        var defaultHwm = this.objectMode ? 16 : 16 * 1024;
                        this.highWaterMark =
                            hwm || hwm === 0 ? hwm : defaultHwm;

                        // cast to ints.
                        this.highWaterMark = Math.floor(this.highWaterMark);

                        // if _final has been called
                        this.finalCalled = false;

                        // drain event flag.
                        this.needDrain = false;
                        // at the start of calling end()
                        this.ending = false;
                        // when end() has been called, and returned
                        this.ended = false;
                        // when 'finish' is emitted
                        this.finished = false;

                        // has it been destroyed
                        this.destroyed = false;

                        // should we decode strings into buffers before passing to _write?
                        // this is here so that some node-core streams can optimize string
                        // handling at a lower level.
                        var noDecode = options.decodeStrings === false;
                        this.decodeStrings = !noDecode;

                        // Crypto is kind of old and crusty.  Historically, its default string
                        // encoding is 'binary' so we have to make this configurable.
                        // Everything else in the universe uses 'utf8', though.
                        this.defaultEncoding =
                            options.defaultEncoding || 'utf8';

                        // not an actual buffer we keep track of, but a measurement
                        // of how much we're waiting to get pushed to some underlying
                        // socket or file.
                        this.length = 0;

                        // a flag to see when we're in the middle of a write.
                        this.writing = false;

                        // when true all writes will be buffered until .uncork() call
                        this.corked = 0;

                        // a flag to be able to tell if the onwrite cb is called immediately,
                        // or on a later tick.  We set this to true at first, because any
                        // actions that shouldn't happen until "later" should generally also
                        // not happen before the first write call.
                        this.sync = true;

                        // a flag to know if we're processing previously buffered items, which
                        // may call the _write() callback in the same tick, so that we don't
                        // end up in an overlapped onwrite situation.
                        this.bufferProcessing = false;

                        // the callback that's passed to _write(chunk,cb)
                        this.onwrite = function(er) {
                            onwrite(stream, er);
                        };

                        // the callback that the user supplies to write(chunk,encoding,cb)
                        this.writecb = null;

                        // the amount that is being written when _write is called.
                        this.writelen = 0;

                        this.bufferedRequest = null;
                        this.lastBufferedRequest = null;

                        // number of pending user-supplied write callbacks
                        // this must be 0 before 'finish' can be emitted
                        this.pendingcb = 0;

                        // emit prefinish if the only thing we're waiting for is _write cbs
                        // This is relevant for synchronous Transform streams
                        this.prefinished = false;

                        // True if the error was already emitted and should not be thrown again
                        this.errorEmitted = false;

                        // count buffered requests
                        this.bufferedRequestCount = 0;

                        // allocate the first CorkedRequest, there is always
                        // one allocated and free to use, and we maintain at most two
                        this.corkedRequestsFree = new CorkedRequest(this);
                    }

                    WritableState.prototype.getBuffer = function getBuffer() {
                        var current = this.bufferedRequest;
                        var out = [];
                        while (current) {
                            out.push(current);
                            current = current.next;
                        }
                        return out;
                    };

                    (function() {
                        try {
                            Object.defineProperty(
                                WritableState.prototype,
                                'buffer',
                                {
                                    get: internalUtil.deprecate(
                                        function() {
                                            return this.getBuffer();
                                        },
                                        '_writableState.buffer is deprecated. Use _writableState.getBuffer ' +
                                            'instead.',
                                        'DEP0003'
                                    )
                                }
                            );
                        } catch (_) {}
                    })();

                    // Test _writableState for inheritance to account for Duplex streams,
                    // whose prototype chain only points to Readable.
                    var realHasInstance;
                    if (
                        typeof Symbol === 'function' &&
                        Symbol.hasInstance &&
                        typeof Function.prototype[Symbol.hasInstance] ===
                            'function'
                    ) {
                        realHasInstance =
                            Function.prototype[Symbol.hasInstance];
                        Object.defineProperty(Writable, Symbol.hasInstance, {
                            value: function(object) {
                                if (realHasInstance.call(this, object))
                                    return true;

                                return (
                                    object &&
                                    object._writableState instanceof
                                        WritableState
                                );
                            }
                        });
                    } else {
                        realHasInstance = function(object) {
                            return object instanceof this;
                        };
                    }

                    function Writable(options) {
                        Duplex = Duplex || require('./_stream_duplex');

                        // Writable ctor is applied to Duplexes, too.
                        // `realHasInstance` is necessary because using plain `instanceof`
                        // would return false, as no `_writableState` property is attached.

                        // Trying to use the custom `instanceof` for Writable here will also break the
                        // Node.js LazyTransform implementation, which has a non-trivial getter for
                        // `_writableState` that would lead to infinite recursion.
                        if (
                            !realHasInstance.call(Writable, this) &&
                            !(this instanceof Duplex)
                        ) {
                            return new Writable(options);
                        }

                        this._writableState = new WritableState(options, this);

                        // legacy.
                        this.writable = true;

                        if (options) {
                            if (typeof options.write === 'function')
                                this._write = options.write;

                            if (typeof options.writev === 'function')
                                this._writev = options.writev;

                            if (typeof options.destroy === 'function')
                                this._destroy = options.destroy;

                            if (typeof options.final === 'function')
                                this._final = options.final;
                        }

                        Stream.call(this);
                    }

                    // Otherwise people can pipe Writable streams, which is just wrong.
                    Writable.prototype.pipe = function() {
                        this.emit(
                            'error',
                            new Error('Cannot pipe, not readable')
                        );
                    };

                    function writeAfterEnd(stream, cb) {
                        var er = new Error('write after end');
                        // TODO: defer error events consistently everywhere, not just the cb
                        stream.emit('error', er);
                        processNextTick(cb, er);
                    }

                    // Checks that a user-supplied chunk is valid, especially for the particular
                    // mode the stream is in. Currently this means that `null` is never accepted
                    // and undefined/non-string values are only allowed in object mode.
                    function validChunk(stream, state, chunk, cb) {
                        var valid = true;
                        var er = false;

                        if (chunk === null) {
                            er = new TypeError(
                                'May not write null values to stream'
                            );
                        } else if (
                            typeof chunk !== 'string' &&
                            chunk !== undefined &&
                            !state.objectMode
                        ) {
                            er = new TypeError(
                                'Invalid non-string/buffer chunk'
                            );
                        }
                        if (er) {
                            stream.emit('error', er);
                            processNextTick(cb, er);
                            valid = false;
                        }
                        return valid;
                    }

                    Writable.prototype.write = function(chunk, encoding, cb) {
                        var state = this._writableState;
                        var ret = false;
                        var isBuf = _isUint8Array(chunk) && !state.objectMode;

                        if (isBuf && !Buffer.isBuffer(chunk)) {
                            chunk = _uint8ArrayToBuffer(chunk);
                        }

                        if (typeof encoding === 'function') {
                            cb = encoding;
                            encoding = null;
                        }

                        if (isBuf) encoding = 'buffer';
                        else if (!encoding) encoding = state.defaultEncoding;

                        if (typeof cb !== 'function') cb = nop;

                        if (state.ended) writeAfterEnd(this, cb);
                        else if (isBuf || validChunk(this, state, chunk, cb)) {
                            state.pendingcb++;
                            ret = writeOrBuffer(
                                this,
                                state,
                                isBuf,
                                chunk,
                                encoding,
                                cb
                            );
                        }

                        return ret;
                    };

                    Writable.prototype.cork = function() {
                        var state = this._writableState;

                        state.corked++;
                    };

                    Writable.prototype.uncork = function() {
                        var state = this._writableState;

                        if (state.corked) {
                            state.corked--;

                            if (
                                !state.writing &&
                                !state.corked &&
                                !state.finished &&
                                !state.bufferProcessing &&
                                state.bufferedRequest
                            )
                                clearBuffer(this, state);
                        }
                    };

                    Writable.prototype.setDefaultEncoding = function setDefaultEncoding(
                        encoding
                    ) {
                        // node::ParseEncoding() requires lower case.
                        if (typeof encoding === 'string')
                            encoding = encoding.toLowerCase();
                        if (
                            !(
                                [
                                    'hex',
                                    'utf8',
                                    'utf-8',
                                    'ascii',
                                    'binary',
                                    'base64',
                                    'ucs2',
                                    'ucs-2',
                                    'utf16le',
                                    'utf-16le',
                                    'raw'
                                ].indexOf((encoding + '').toLowerCase()) > -1
                            )
                        )
                            throw new TypeError(
                                'Unknown encoding: ' + encoding
                            );
                        this._writableState.defaultEncoding = encoding;
                        return this;
                    };

                    function decodeChunk(state, chunk, encoding) {
                        if (
                            !state.objectMode &&
                            state.decodeStrings !== false &&
                            typeof chunk === 'string'
                        ) {
                            chunk = Buffer.from(chunk, encoding);
                        }
                        return chunk;
                    }

                    // if we're already writing something, then just put this
                    // in the queue, and wait our turn.  Otherwise, call _write
                    // If we return false, then we need a drain event, so set that flag.
                    function writeOrBuffer(
                        stream,
                        state,
                        isBuf,
                        chunk,
                        encoding,
                        cb
                    ) {
                        if (!isBuf) {
                            var newChunk = decodeChunk(state, chunk, encoding);
                            if (chunk !== newChunk) {
                                isBuf = true;
                                encoding = 'buffer';
                                chunk = newChunk;
                            }
                        }
                        var len = state.objectMode ? 1 : chunk.length;

                        state.length += len;

                        var ret = state.length < state.highWaterMark;
                        // we must ensure that previous needDrain will not be reset to false.
                        if (!ret) state.needDrain = true;

                        if (state.writing || state.corked) {
                            var last = state.lastBufferedRequest;
                            state.lastBufferedRequest = {
                                chunk: chunk,
                                encoding: encoding,
                                isBuf: isBuf,
                                callback: cb,
                                next: null
                            };
                            if (last) {
                                last.next = state.lastBufferedRequest;
                            } else {
                                state.bufferedRequest =
                                    state.lastBufferedRequest;
                            }
                            state.bufferedRequestCount += 1;
                        } else {
                            doWrite(
                                stream,
                                state,
                                false,
                                len,
                                chunk,
                                encoding,
                                cb
                            );
                        }

                        return ret;
                    }

                    function doWrite(
                        stream,
                        state,
                        writev,
                        len,
                        chunk,
                        encoding,
                        cb
                    ) {
                        state.writelen = len;
                        state.writecb = cb;
                        state.writing = true;
                        state.sync = true;
                        if (writev) stream._writev(chunk, state.onwrite);
                        else stream._write(chunk, encoding, state.onwrite);
                        state.sync = false;
                    }

                    function onwriteError(stream, state, sync, er, cb) {
                        --state.pendingcb;

                        if (sync) {
                            // defer the callback if we are being called synchronously
                            // to avoid piling up things on the stack
                            processNextTick(cb, er);
                            // this can emit finish, and it will always happen
                            // after error
                            processNextTick(finishMaybe, stream, state);
                            stream._writableState.errorEmitted = true;
                            stream.emit('error', er);
                        } else {
                            // the caller expect this to happen before if
                            // it is async
                            cb(er);
                            stream._writableState.errorEmitted = true;
                            stream.emit('error', er);
                            // this can emit finish, but finish must
                            // always follow error
                            finishMaybe(stream, state);
                        }
                    }

                    function onwriteStateUpdate(state) {
                        state.writing = false;
                        state.writecb = null;
                        state.length -= state.writelen;
                        state.writelen = 0;
                    }

                    function onwrite(stream, er) {
                        var state = stream._writableState;
                        var sync = state.sync;
                        var cb = state.writecb;

                        onwriteStateUpdate(state);

                        if (er) onwriteError(stream, state, sync, er, cb);
                        else {
                            // Check if we're actually ready to finish, but don't emit yet
                            var finished = needFinish(state);

                            if (
                                !finished &&
                                !state.corked &&
                                !state.bufferProcessing &&
                                state.bufferedRequest
                            ) {
                                clearBuffer(stream, state);
                            }

                            if (sync) {
                                /*<replacement>*/
                                asyncWrite(
                                    afterWrite,
                                    stream,
                                    state,
                                    finished,
                                    cb
                                );
                                /*</replacement>*/
                            } else {
                                afterWrite(stream, state, finished, cb);
                            }
                        }
                    }

                    function afterWrite(stream, state, finished, cb) {
                        if (!finished) onwriteDrain(stream, state);
                        state.pendingcb--;
                        cb();
                        finishMaybe(stream, state);
                    }

                    // Must force callback to be called on nextTick, so that we don't
                    // emit 'drain' before the write() consumer gets the 'false' return
                    // value, and has a chance to attach a 'drain' listener.
                    function onwriteDrain(stream, state) {
                        if (state.length === 0 && state.needDrain) {
                            state.needDrain = false;
                            stream.emit('drain');
                        }
                    }

                    // if there's something in the buffer waiting, then process it
                    function clearBuffer(stream, state) {
                        state.bufferProcessing = true;
                        var entry = state.bufferedRequest;

                        if (stream._writev && entry && entry.next) {
                            // Fast case, write everything using _writev()
                            var l = state.bufferedRequestCount;
                            var buffer = new Array(l);
                            var holder = state.corkedRequestsFree;
                            holder.entry = entry;

                            var count = 0;
                            var allBuffers = true;
                            while (entry) {
                                buffer[count] = entry;
                                if (!entry.isBuf) allBuffers = false;
                                entry = entry.next;
                                count += 1;
                            }
                            buffer.allBuffers = allBuffers;

                            doWrite(
                                stream,
                                state,
                                true,
                                state.length,
                                buffer,
                                '',
                                holder.finish
                            );

                            // doWrite is almost always async, defer these to save a bit of time
                            // as the hot path ends with doWrite
                            state.pendingcb++;
                            state.lastBufferedRequest = null;
                            if (holder.next) {
                                state.corkedRequestsFree = holder.next;
                                holder.next = null;
                            } else {
                                state.corkedRequestsFree = new CorkedRequest(
                                    state
                                );
                            }
                        } else {
                            // Slow case, write chunks one-by-one
                            while (entry) {
                                var chunk = entry.chunk;
                                var encoding = entry.encoding;
                                var cb = entry.callback;
                                var len = state.objectMode ? 1 : chunk.length;

                                doWrite(
                                    stream,
                                    state,
                                    false,
                                    len,
                                    chunk,
                                    encoding,
                                    cb
                                );
                                entry = entry.next;
                                // if we didn't call the onwrite immediately, then
                                // it means that we need to wait until it does.
                                // also, that means that the chunk and cb are currently
                                // being processed, so move the buffer counter past them.
                                if (state.writing) {
                                    break;
                                }
                            }

                            if (entry === null)
                                state.lastBufferedRequest = null;
                        }

                        state.bufferedRequestCount = 0;
                        state.bufferedRequest = entry;
                        state.bufferProcessing = false;
                    }

                    Writable.prototype._write = function(chunk, encoding, cb) {
                        cb(new Error('_write() is not implemented'));
                    };

                    Writable.prototype._writev = null;

                    Writable.prototype.end = function(chunk, encoding, cb) {
                        var state = this._writableState;

                        if (typeof chunk === 'function') {
                            cb = chunk;
                            chunk = null;
                            encoding = null;
                        } else if (typeof encoding === 'function') {
                            cb = encoding;
                            encoding = null;
                        }

                        if (chunk !== null && chunk !== undefined)
                            this.write(chunk, encoding);

                        // .end() fully uncorks
                        if (state.corked) {
                            state.corked = 1;
                            this.uncork();
                        }

                        // ignore unnecessary end() calls.
                        if (!state.ending && !state.finished)
                            endWritable(this, state, cb);
                    };

                    function needFinish(state) {
                        return (
                            state.ending &&
                            state.length === 0 &&
                            state.bufferedRequest === null &&
                            !state.finished &&
                            !state.writing
                        );
                    }
                    function callFinal(stream, state) {
                        stream._final(function(err) {
                            state.pendingcb--;
                            if (err) {
                                stream.emit('error', err);
                            }
                            state.prefinished = true;
                            stream.emit('prefinish');
                            finishMaybe(stream, state);
                        });
                    }
                    function prefinish(stream, state) {
                        if (!state.prefinished && !state.finalCalled) {
                            if (typeof stream._final === 'function') {
                                state.pendingcb++;
                                state.finalCalled = true;
                                processNextTick(callFinal, stream, state);
                            } else {
                                state.prefinished = true;
                                stream.emit('prefinish');
                            }
                        }
                    }

                    function finishMaybe(stream, state) {
                        var need = needFinish(state);
                        if (need) {
                            prefinish(stream, state);
                            if (state.pendingcb === 0) {
                                state.finished = true;
                                stream.emit('finish');
                            }
                        }
                        return need;
                    }

                    function endWritable(stream, state, cb) {
                        state.ending = true;
                        finishMaybe(stream, state);
                        if (cb) {
                            if (state.finished) processNextTick(cb);
                            else stream.once('finish', cb);
                        }
                        state.ended = true;
                        stream.writable = false;
                    }

                    function onCorkedFinish(corkReq, state, err) {
                        var entry = corkReq.entry;
                        corkReq.entry = null;
                        while (entry) {
                            var cb = entry.callback;
                            state.pendingcb--;
                            cb(err);
                            entry = entry.next;
                        }
                        if (state.corkedRequestsFree) {
                            state.corkedRequestsFree.next = corkReq;
                        } else {
                            state.corkedRequestsFree = corkReq;
                        }
                    }

                    Object.defineProperty(Writable.prototype, 'destroyed', {
                        get: function() {
                            if (this._writableState === undefined) {
                                return false;
                            }
                            return this._writableState.destroyed;
                        },
                        set: function(value) {
                            // we ignore the value if the stream
                            // has not been initialized yet
                            if (!this._writableState) {
                                return;
                            }

                            // backward compatibility, the user is explicitly
                            // managing destroyed
                            this._writableState.destroyed = value;
                        }
                    });

                    Writable.prototype.destroy = destroyImpl.destroy;
                    Writable.prototype._undestroy = destroyImpl.undestroy;
                    Writable.prototype._destroy = function(err, cb) {
                        this.end();
                        cb(err);
                    };
                }.call(
                    this,
                    require('_process'),
                    typeof global !== 'undefined'
                        ? global
                        : typeof self !== 'undefined'
                          ? self
                          : typeof window !== 'undefined' ? window : {}
                ));
            },
            {
                './_stream_duplex': 107,
                './internal/streams/destroy': 113,
                './internal/streams/stream': 114,
                _process: 105,
                'core-util-is': 34,
                inherits: 101,
                'process-nextick-args': 104,
                'safe-buffer': 119,
                'util-deprecate': 144
            }
        ],
        112: [
            function(require, module, exports) {
                'use strict';

                /*<replacement>*/

                function _classCallCheck(instance, Constructor) {
                    if (!(instance instanceof Constructor)) {
                        throw new TypeError(
                            'Cannot call a class as a function'
                        );
                    }
                }

                var Buffer = require('safe-buffer').Buffer;
                /*</replacement>*/

                function copyBuffer(src, target, offset) {
                    src.copy(target, offset);
                }

                module.exports = (function() {
                    function BufferList() {
                        _classCallCheck(this, BufferList);

                        this.head = null;
                        this.tail = null;
                        this.length = 0;
                    }

                    BufferList.prototype.push = function push(v) {
                        var entry = { data: v, next: null };
                        if (this.length > 0) this.tail.next = entry;
                        else this.head = entry;
                        this.tail = entry;
                        ++this.length;
                    };

                    BufferList.prototype.unshift = function unshift(v) {
                        var entry = { data: v, next: this.head };
                        if (this.length === 0) this.tail = entry;
                        this.head = entry;
                        ++this.length;
                    };

                    BufferList.prototype.shift = function shift() {
                        if (this.length === 0) return;
                        var ret = this.head.data;
                        if (this.length === 1) this.head = this.tail = null;
                        else this.head = this.head.next;
                        --this.length;
                        return ret;
                    };

                    BufferList.prototype.clear = function clear() {
                        this.head = this.tail = null;
                        this.length = 0;
                    };

                    BufferList.prototype.join = function join(s) {
                        if (this.length === 0) return '';
                        var p = this.head;
                        var ret = '' + p.data;
                        while ((p = p.next)) {
                            ret += s + p.data;
                        }
                        return ret;
                    };

                    BufferList.prototype.concat = function concat(n) {
                        if (this.length === 0) return Buffer.alloc(0);
                        if (this.length === 1) return this.head.data;
                        var ret = Buffer.allocUnsafe(n >>> 0);
                        var p = this.head;
                        var i = 0;
                        while (p) {
                            copyBuffer(p.data, ret, i);
                            i += p.data.length;
                            p = p.next;
                        }
                        return ret;
                    };

                    return BufferList;
                })();
            },
            { 'safe-buffer': 119 }
        ],
        113: [
            function(require, module, exports) {
                'use strict';

                /*<replacement>*/

                var processNextTick = require('process-nextick-args');
                /*</replacement>*/

                // undocumented cb() API, needed for core, not for public API
                function destroy(err, cb) {
                    var _this = this;

                    var readableDestroyed =
                        this._readableState && this._readableState.destroyed;
                    var writableDestroyed =
                        this._writableState && this._writableState.destroyed;

                    if (readableDestroyed || writableDestroyed) {
                        if (cb) {
                            cb(err);
                        } else if (
                            err &&
                            (!this._writableState ||
                                !this._writableState.errorEmitted)
                        ) {
                            processNextTick(emitErrorNT, this, err);
                        }
                        return;
                    }

                    // we set destroyed to true before firing error callbacks in order
                    // to make it re-entrance safe in case destroy() is called within callbacks

                    if (this._readableState) {
                        this._readableState.destroyed = true;
                    }

                    // if this is a duplex stream mark the writable part as destroyed as well
                    if (this._writableState) {
                        this._writableState.destroyed = true;
                    }

                    this._destroy(err || null, function(err) {
                        if (!cb && err) {
                            processNextTick(emitErrorNT, _this, err);
                            if (_this._writableState) {
                                _this._writableState.errorEmitted = true;
                            }
                        } else if (cb) {
                            cb(err);
                        }
                    });
                }

                function undestroy() {
                    if (this._readableState) {
                        this._readableState.destroyed = false;
                        this._readableState.reading = false;
                        this._readableState.ended = false;
                        this._readableState.endEmitted = false;
                    }

                    if (this._writableState) {
                        this._writableState.destroyed = false;
                        this._writableState.ended = false;
                        this._writableState.ending = false;
                        this._writableState.finished = false;
                        this._writableState.errorEmitted = false;
                    }
                }

                function emitErrorNT(self, err) {
                    self.emit('error', err);
                }

                module.exports = {
                    destroy: destroy,
                    undestroy: undestroy
                };
            },
            { 'process-nextick-args': 104 }
        ],
        114: [
            function(require, module, exports) {
                module.exports = require('events').EventEmitter;
            },
            { events: 99 }
        ],
        115: [
            function(require, module, exports) {
                module.exports = require('./readable').PassThrough;
            },
            { './readable': 116 }
        ],
        116: [
            function(require, module, exports) {
                exports = module.exports = require('./lib/_stream_readable.js');
                exports.Stream = exports;
                exports.Readable = exports;
                exports.Writable = require('./lib/_stream_writable.js');
                exports.Duplex = require('./lib/_stream_duplex.js');
                exports.Transform = require('./lib/_stream_transform.js');
                exports.PassThrough = require('./lib/_stream_passthrough.js');
            },
            {
                './lib/_stream_duplex.js': 107,
                './lib/_stream_passthrough.js': 108,
                './lib/_stream_readable.js': 109,
                './lib/_stream_transform.js': 110,
                './lib/_stream_writable.js': 111
            }
        ],
        117: [
            function(require, module, exports) {
                module.exports = require('./readable').Transform;
            },
            { './readable': 116 }
        ],
        118: [
            function(require, module, exports) {
                module.exports = require('./lib/_stream_writable.js');
            },
            { './lib/_stream_writable.js': 111 }
        ],
        119: [
            function(require, module, exports) {
                /* eslint-disable node/no-deprecated-api */
                var buffer = require('buffer');
                var Buffer = buffer.Buffer;

                // alternative to using Object.keys for old browsers
                function copyProps(src, dst) {
                    for (var key in src) {
                        dst[key] = src[key];
                    }
                }
                if (
                    Buffer.from &&
                    Buffer.alloc &&
                    Buffer.allocUnsafe &&
                    Buffer.allocUnsafeSlow
                ) {
                    module.exports = buffer;
                } else {
                    // Copy properties from require('buffer')
                    copyProps(buffer, exports);
                    exports.Buffer = SafeBuffer;
                }

                function SafeBuffer(arg, encodingOrOffset, length) {
                    return Buffer(arg, encodingOrOffset, length);
                }

                // Copy static methods from Buffer
                copyProps(Buffer, SafeBuffer);

                SafeBuffer.from = function(arg, encodingOrOffset, length) {
                    if (typeof arg === 'number') {
                        throw new TypeError('Argument must not be a number');
                    }
                    return Buffer(arg, encodingOrOffset, length);
                };

                SafeBuffer.alloc = function(size, fill, encoding) {
                    if (typeof size !== 'number') {
                        throw new TypeError('Argument must be a number');
                    }
                    var buf = Buffer(size);
                    if (fill !== undefined) {
                        if (typeof encoding === 'string') {
                            buf.fill(fill, encoding);
                        } else {
                            buf.fill(fill);
                        }
                    } else {
                        buf.fill(0);
                    }
                    return buf;
                };

                SafeBuffer.allocUnsafe = function(size) {
                    if (typeof size !== 'number') {
                        throw new TypeError('Argument must be a number');
                    }
                    return Buffer(size);
                };

                SafeBuffer.allocUnsafeSlow = function(size) {
                    if (typeof size !== 'number') {
                        throw new TypeError('Argument must be a number');
                    }
                    return buffer.SlowBuffer(size);
                };
            },
            { buffer: 33 }
        ],
        120: [
            function(require, module, exports) {
                arguments[4][26][0].apply(exports, arguments);
            },
            { './selectorParser': 125, dup: 26 }
        ],
        121: [
            function(require, module, exports) {
                'use strict';
                function curry2(select) {
                    return function selector(selector, vNode) {
                        switch (arguments.length) {
                            case 0:
                                return select;
                            case 1:
                                return function(_vNode) {
                                    return select(selector, _vNode);
                                };
                            default:
                                return select(selector, vNode);
                        }
                    };
                }
                exports.curry2 = curry2;
            },
            {}
        ],
        122: [
            function(require, module, exports) {
                'use strict';
                var language_1 = require('./language');
                function findMatches(cssSelector, vNode) {
                    var selector = language_1.language(cssSelector);
                    var matches = [];
                    traverseVNode(vNode, addParent); // add mapping to the parent selectorParser
                    traverseVNode(vNode, function(currentNode) {
                        var data = currentNode.data;
                        var result;
                        if (data && data.fn) {
                            if (Array.isArray(data.args)) {
                                result = selector(
                                    data.fn.apply(null, data.args)
                                );
                            } else if (data.args) {
                                result = selector(
                                    data.fn.call(null, data.args)
                                );
                            } else {
                                result = selector(data.fn());
                            }
                        } else {
                            result = selector(currentNode);
                        }
                        if (result) {
                            if (!Array.isArray(result)) {
                                result = [result];
                            }
                            matches.push.apply(matches, result);
                        }
                    });
                    return matches;
                }
                exports.findMatches = findMatches;
                function traverseVNode(vNode, f) {
                    function recurse(currentNode, isParent, parentVNode) {
                        var length =
                            (currentNode.children &&
                                currentNode.children.length) ||
                            0;
                        for (var i = 0; i < length; ++i) {
                            var children = currentNode.children;
                            if (
                                children &&
                                children[i] &&
                                typeof children[i] !== 'string'
                            ) {
                                var child = children[i];
                                recurse(child, false, currentNode);
                            }
                        }
                        f(
                            currentNode,
                            isParent,
                            isParent ? void 0 : parentVNode
                        );
                    }
                    recurse(vNode, true);
                }
                function addParent(vNode, isParent, parent) {
                    if (isParent) {
                        return void 0;
                    }
                    if (!vNode.data) {
                        vNode.data = {};
                    }
                    if (!vNode.data.parent) {
                        vNode.data.parent = parent;
                    }
                }
            },
            { './language': 124 }
        ],
        123: [
            function(require, module, exports) {
                'use strict';
                var curry2_1 = require('./curry2');
                var findMatches_1 = require('./findMatches');
                exports.select = curry2_1.curry2(findMatches_1.findMatches);
                var selectorParser_1 = require('./selectorParser');
                exports.selectorParser = selectorParser_1.selectorParser;
                var classNameFromVNode_1 = require('./classNameFromVNode');
                exports.classNameFromVNode =
                    classNameFromVNode_1.classNameFromVNode;
            },
            {
                './classNameFromVNode': 120,
                './curry2': 121,
                './findMatches': 122,
                './selectorParser': 125
            }
        ],
        124: [
            function(require, module, exports) {
                'use strict';
                var cssauron = require('cssauron');
                var selectorParser_1 = require('./selectorParser');
                var classNameFromVNode_1 = require('./classNameFromVNode');
                exports.language = cssauron({
                    tag: function(vNode) {
                        return selectorParser_1.selectorParser(vNode).tagName;
                    },
                    class: function(vNode) {
                        return classNameFromVNode_1.classNameFromVNode(vNode);
                    },
                    id: function(vNode) {
                        return selectorParser_1.selectorParser(vNode).id;
                    },
                    children: function(vNode) {
                        return vNode.children || [];
                    },
                    parent: function(vNode) {
                        return vNode.data.parent || vNode;
                    },
                    contents: function(vNode) {
                        return vNode.text;
                    },
                    attr: function(vNode, attr) {
                        if (vNode.data) {
                            var _a = vNode.data,
                                _b = _a.attrs,
                                attrs = _b === void 0 ? {} : _b,
                                _c = _a.props,
                                props = _c === void 0 ? {} : _c;
                            if (attrs[attr]) {
                                return attrs[attr];
                            }
                            if (props[attr]) {
                                return props[attr];
                            }
                        }
                    }
                });
            },
            {
                './classNameFromVNode': 120,
                './selectorParser': 125,
                cssauron: 35
            }
        ],
        125: [
            function(require, module, exports) {
                arguments[4][27][0].apply(exports, arguments);
            },
            { dup: 27 }
        ],
        126: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                var vnode_1 = require('./vnode');
                var is = require('./is');
                function addNS(data, children, sel) {
                    data.ns = 'http://www.w3.org/2000/svg';
                    if (sel !== 'foreignObject' && children !== undefined) {
                        for (var i = 0; i < children.length; ++i) {
                            var childData = children[i].data;
                            if (childData !== undefined) {
                                addNS(
                                    childData,
                                    children[i].children,
                                    children[i].sel
                                );
                            }
                        }
                    }
                }
                function h(sel, b, c) {
                    var data = {},
                        children,
                        text,
                        i;
                    if (c !== undefined) {
                        data = b;
                        if (is.array(c)) {
                            children = c;
                        } else if (is.primitive(c)) {
                            text = c;
                        } else if (c && c.sel) {
                            children = [c];
                        }
                    } else if (b !== undefined) {
                        if (is.array(b)) {
                            children = b;
                        } else if (is.primitive(b)) {
                            text = b;
                        } else if (b && b.sel) {
                            children = [b];
                        } else {
                            data = b;
                        }
                    }
                    if (is.array(children)) {
                        for (i = 0; i < children.length; ++i) {
                            if (is.primitive(children[i]))
                                children[i] = vnode_1.vnode(
                                    undefined,
                                    undefined,
                                    undefined,
                                    children[i]
                                );
                        }
                    }
                    if (
                        sel[0] === 's' &&
                        sel[1] === 'v' &&
                        sel[2] === 'g' &&
                        (sel.length === 3 || sel[3] === '.' || sel[3] === '#')
                    ) {
                        addNS(data, children, sel);
                    }
                    return vnode_1.vnode(sel, data, children, text, undefined);
                }
                exports.h = h;
                exports.default = h;
            },
            { './is': 128, './vnode': 137 }
        ],
        127: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                function createElement(tagName) {
                    return document.createElement(tagName);
                }
                function createElementNS(namespaceURI, qualifiedName) {
                    return document.createElementNS(
                        namespaceURI,
                        qualifiedName
                    );
                }
                function createTextNode(text) {
                    return document.createTextNode(text);
                }
                function createComment(text) {
                    return document.createComment(text);
                }
                function insertBefore(parentNode, newNode, referenceNode) {
                    parentNode.insertBefore(newNode, referenceNode);
                }
                function removeChild(node, child) {
                    node.removeChild(child);
                }
                function appendChild(node, child) {
                    node.appendChild(child);
                }
                function parentNode(node) {
                    return node.parentNode;
                }
                function nextSibling(node) {
                    return node.nextSibling;
                }
                function tagName(elm) {
                    return elm.tagName;
                }
                function setTextContent(node, text) {
                    node.textContent = text;
                }
                function getTextContent(node) {
                    return node.textContent;
                }
                function isElement(node) {
                    return node.nodeType === 1;
                }
                function isText(node) {
                    return node.nodeType === 3;
                }
                function isComment(node) {
                    return node.nodeType === 8;
                }
                exports.htmlDomApi = {
                    createElement: createElement,
                    createElementNS: createElementNS,
                    createTextNode: createTextNode,
                    createComment: createComment,
                    insertBefore: insertBefore,
                    removeChild: removeChild,
                    appendChild: appendChild,
                    parentNode: parentNode,
                    nextSibling: nextSibling,
                    tagName: tagName,
                    setTextContent: setTextContent,
                    getTextContent: getTextContent,
                    isElement: isElement,
                    isText: isText,
                    isComment: isComment
                };
                exports.default = exports.htmlDomApi;
            },
            {}
        ],
        128: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                exports.array = Array.isArray;
                function primitive(s) {
                    return typeof s === 'string' || typeof s === 'number';
                }
                exports.primitive = primitive;
            },
            {}
        ],
        129: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                var xlinkNS = 'http://www.w3.org/1999/xlink';
                var xmlNS = 'http://www.w3.org/XML/1998/namespace';
                var colonChar = 58;
                var xChar = 120;
                function updateAttrs(oldVnode, vnode) {
                    var key,
                        elm = vnode.elm,
                        oldAttrs = oldVnode.data.attrs,
                        attrs = vnode.data.attrs;
                    if (!oldAttrs && !attrs) return;
                    if (oldAttrs === attrs) return;
                    oldAttrs = oldAttrs || {};
                    attrs = attrs || {};
                    // update modified attributes, add new attributes
                    for (key in attrs) {
                        var cur = attrs[key];
                        var old = oldAttrs[key];
                        if (old !== cur) {
                            if (cur === true) {
                                elm.setAttribute(key, '');
                            } else if (cur === false) {
                                elm.removeAttribute(key);
                            } else {
                                if (key.charCodeAt(0) !== xChar) {
                                    elm.setAttribute(key, cur);
                                } else if (key.charCodeAt(3) === colonChar) {
                                    // Assume xml namespace
                                    elm.setAttributeNS(xmlNS, key, cur);
                                } else if (key.charCodeAt(5) === colonChar) {
                                    // Assume xlink namespace
                                    elm.setAttributeNS(xlinkNS, key, cur);
                                } else {
                                    elm.setAttribute(key, cur);
                                }
                            }
                        }
                    }
                    // remove removed attributes
                    // use `in` operator since the previous `for` iteration uses it (.i.e. add even attributes with undefined value)
                    // the other option is to remove all attributes with value == undefined
                    for (key in oldAttrs) {
                        if (!(key in attrs)) {
                            elm.removeAttribute(key);
                        }
                    }
                }
                exports.attributesModule = {
                    create: updateAttrs,
                    update: updateAttrs
                };
                exports.default = exports.attributesModule;
            },
            {}
        ],
        130: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                function updateClass(oldVnode, vnode) {
                    var cur,
                        name,
                        elm = vnode.elm,
                        oldClass = oldVnode.data.class,
                        klass = vnode.data.class;
                    if (!oldClass && !klass) return;
                    if (oldClass === klass) return;
                    oldClass = oldClass || {};
                    klass = klass || {};
                    for (name in oldClass) {
                        if (!klass[name]) {
                            elm.classList.remove(name);
                        }
                    }
                    for (name in klass) {
                        cur = klass[name];
                        if (cur !== oldClass[name]) {
                            elm.classList[cur ? 'add' : 'remove'](name);
                        }
                    }
                }
                exports.classModule = {
                    create: updateClass,
                    update: updateClass
                };
                exports.default = exports.classModule;
            },
            {}
        ],
        131: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                var CAPS_REGEX = /[A-Z]/g;
                function updateDataset(oldVnode, vnode) {
                    var elm = vnode.elm,
                        oldDataset = oldVnode.data.dataset,
                        dataset = vnode.data.dataset,
                        key;
                    if (!oldDataset && !dataset) return;
                    if (oldDataset === dataset) return;
                    oldDataset = oldDataset || {};
                    dataset = dataset || {};
                    var d = elm.dataset;
                    for (key in oldDataset) {
                        if (!dataset[key]) {
                            if (d) {
                                if (key in d) {
                                    delete d[key];
                                }
                            } else {
                                elm.removeAttribute(
                                    'data-' +
                                        key
                                            .replace(CAPS_REGEX, '-$&')
                                            .toLowerCase()
                                );
                            }
                        }
                    }
                    for (key in dataset) {
                        if (oldDataset[key] !== dataset[key]) {
                            if (d) {
                                d[key] = dataset[key];
                            } else {
                                elm.setAttribute(
                                    'data-' +
                                        key
                                            .replace(CAPS_REGEX, '-$&')
                                            .toLowerCase(),
                                    dataset[key]
                                );
                            }
                        }
                    }
                }
                exports.datasetModule = {
                    create: updateDataset,
                    update: updateDataset
                };
                exports.default = exports.datasetModule;
            },
            {}
        ],
        132: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                function updateProps(oldVnode, vnode) {
                    var key,
                        cur,
                        old,
                        elm = vnode.elm,
                        oldProps = oldVnode.data.props,
                        props = vnode.data.props;
                    if (!oldProps && !props) return;
                    if (oldProps === props) return;
                    oldProps = oldProps || {};
                    props = props || {};
                    for (key in oldProps) {
                        if (!props[key]) {
                            delete elm[key];
                        }
                    }
                    for (key in props) {
                        cur = props[key];
                        old = oldProps[key];
                        if (
                            old !== cur &&
                            (key !== 'value' || elm[key] !== cur)
                        ) {
                            elm[key] = cur;
                        }
                    }
                }
                exports.propsModule = {
                    create: updateProps,
                    update: updateProps
                };
                exports.default = exports.propsModule;
            },
            {}
        ],
        133: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                var raf =
                    (typeof window !== 'undefined' &&
                        window.requestAnimationFrame) ||
                    setTimeout;
                var nextFrame = function(fn) {
                    raf(function() {
                        raf(fn);
                    });
                };
                function setNextFrame(obj, prop, val) {
                    nextFrame(function() {
                        obj[prop] = val;
                    });
                }
                function updateStyle(oldVnode, vnode) {
                    var cur,
                        name,
                        elm = vnode.elm,
                        oldStyle = oldVnode.data.style,
                        style = vnode.data.style;
                    if (!oldStyle && !style) return;
                    if (oldStyle === style) return;
                    oldStyle = oldStyle || {};
                    style = style || {};
                    var oldHasDel = 'delayed' in oldStyle;
                    for (name in oldStyle) {
                        if (!style[name]) {
                            if (name[0] === '-' && name[1] === '-') {
                                elm.style.removeProperty(name);
                            } else {
                                elm.style[name] = '';
                            }
                        }
                    }
                    for (name in style) {
                        cur = style[name];
                        if (name === 'delayed' && style.delayed) {
                            for (var name2 in style.delayed) {
                                cur = style.delayed[name2];
                                if (
                                    !oldHasDel ||
                                    cur !== oldStyle.delayed[name2]
                                ) {
                                    setNextFrame(elm.style, name2, cur);
                                }
                            }
                        } else if (
                            name !== 'remove' &&
                            cur !== oldStyle[name]
                        ) {
                            if (name[0] === '-' && name[1] === '-') {
                                elm.style.setProperty(name, cur);
                            } else {
                                elm.style[name] = cur;
                            }
                        }
                    }
                }
                function applyDestroyStyle(vnode) {
                    var style,
                        name,
                        elm = vnode.elm,
                        s = vnode.data.style;
                    if (!s || !(style = s.destroy)) return;
                    for (name in style) {
                        elm.style[name] = style[name];
                    }
                }
                function applyRemoveStyle(vnode, rm) {
                    var s = vnode.data.style;
                    if (!s || !s.remove) {
                        rm();
                        return;
                    }
                    var name,
                        elm = vnode.elm,
                        i = 0,
                        compStyle,
                        style = s.remove,
                        amount = 0,
                        applied = [];
                    for (name in style) {
                        applied.push(name);
                        elm.style[name] = style[name];
                    }
                    compStyle = getComputedStyle(elm);
                    var props = compStyle['transition-property'].split(', ');
                    for (; i < props.length; ++i) {
                        if (applied.indexOf(props[i]) !== -1) amount++;
                    }
                    elm.addEventListener('transitionend', function(ev) {
                        if (ev.target === elm) --amount;
                        if (amount === 0) rm();
                    });
                }
                exports.styleModule = {
                    create: updateStyle,
                    update: updateStyle,
                    destroy: applyDestroyStyle,
                    remove: applyRemoveStyle
                };
                exports.default = exports.styleModule;
            },
            {}
        ],
        134: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                var vnode_1 = require('./vnode');
                var is = require('./is');
                var htmldomapi_1 = require('./htmldomapi');
                function isUndef(s) {
                    return s === undefined;
                }
                function isDef(s) {
                    return s !== undefined;
                }
                var emptyNode = vnode_1.default(
                    '',
                    {},
                    [],
                    undefined,
                    undefined
                );
                function sameVnode(vnode1, vnode2) {
                    return (
                        vnode1.key === vnode2.key && vnode1.sel === vnode2.sel
                    );
                }
                function isVnode(vnode) {
                    return vnode.sel !== undefined;
                }
                function createKeyToOldIdx(children, beginIdx, endIdx) {
                    var i,
                        map = {},
                        key,
                        ch;
                    for (i = beginIdx; i <= endIdx; ++i) {
                        ch = children[i];
                        if (ch != null) {
                            key = ch.key;
                            if (key !== undefined) map[key] = i;
                        }
                    }
                    return map;
                }
                var hooks = [
                    'create',
                    'update',
                    'remove',
                    'destroy',
                    'pre',
                    'post'
                ];
                var h_1 = require('./h');
                exports.h = h_1.h;
                var thunk_1 = require('./thunk');
                exports.thunk = thunk_1.thunk;
                function init(modules, domApi) {
                    var i,
                        j,
                        cbs = {};
                    var api =
                        domApi !== undefined ? domApi : htmldomapi_1.default;
                    for (i = 0; i < hooks.length; ++i) {
                        cbs[hooks[i]] = [];
                        for (j = 0; j < modules.length; ++j) {
                            var hook = modules[j][hooks[i]];
                            if (hook !== undefined) {
                                cbs[hooks[i]].push(hook);
                            }
                        }
                    }
                    function emptyNodeAt(elm) {
                        var id = elm.id ? '#' + elm.id : '';
                        var c = elm.className
                            ? '.' + elm.className.split(' ').join('.')
                            : '';
                        return vnode_1.default(
                            api.tagName(elm).toLowerCase() + id + c,
                            {},
                            [],
                            undefined,
                            elm
                        );
                    }
                    function createRmCb(childElm, listeners) {
                        return function rmCb() {
                            if (--listeners === 0) {
                                var parent_1 = api.parentNode(childElm);
                                api.removeChild(parent_1, childElm);
                            }
                        };
                    }
                    function createElm(vnode, insertedVnodeQueue) {
                        var i,
                            data = vnode.data;
                        if (data !== undefined) {
                            if (isDef((i = data.hook)) && isDef((i = i.init))) {
                                i(vnode);
                                data = vnode.data;
                            }
                        }
                        var children = vnode.children,
                            sel = vnode.sel;
                        if (sel === '!') {
                            if (isUndef(vnode.text)) {
                                vnode.text = '';
                            }
                            vnode.elm = api.createComment(vnode.text);
                        } else if (sel !== undefined) {
                            // Parse selector
                            var hashIdx = sel.indexOf('#');
                            var dotIdx = sel.indexOf('.', hashIdx);
                            var hash = hashIdx > 0 ? hashIdx : sel.length;
                            var dot = dotIdx > 0 ? dotIdx : sel.length;
                            var tag =
                                hashIdx !== -1 || dotIdx !== -1
                                    ? sel.slice(0, Math.min(hash, dot))
                                    : sel;
                            var elm = (vnode.elm =
                                isDef(data) && isDef((i = data.ns))
                                    ? api.createElementNS(i, tag)
                                    : api.createElement(tag));
                            if (hash < dot)
                                elm.setAttribute(
                                    'id',
                                    sel.slice(hash + 1, dot)
                                );
                            if (dotIdx > 0)
                                elm.setAttribute(
                                    'class',
                                    sel.slice(dot + 1).replace(/\./g, ' ')
                                );
                            for (i = 0; i < cbs.create.length; ++i)
                                cbs.create[i](emptyNode, vnode);
                            if (is.array(children)) {
                                for (i = 0; i < children.length; ++i) {
                                    var ch = children[i];
                                    if (ch != null) {
                                        api.appendChild(
                                            elm,
                                            createElm(ch, insertedVnodeQueue)
                                        );
                                    }
                                }
                            } else if (is.primitive(vnode.text)) {
                                api.appendChild(
                                    elm,
                                    api.createTextNode(vnode.text)
                                );
                            }
                            i = vnode.data.hook; // Reuse variable
                            if (isDef(i)) {
                                if (i.create) i.create(emptyNode, vnode);
                                if (i.insert) insertedVnodeQueue.push(vnode);
                            }
                        } else {
                            vnode.elm = api.createTextNode(vnode.text);
                        }
                        return vnode.elm;
                    }
                    function addVnodes(
                        parentElm,
                        before,
                        vnodes,
                        startIdx,
                        endIdx,
                        insertedVnodeQueue
                    ) {
                        for (; startIdx <= endIdx; ++startIdx) {
                            var ch = vnodes[startIdx];
                            if (ch != null) {
                                api.insertBefore(
                                    parentElm,
                                    createElm(ch, insertedVnodeQueue),
                                    before
                                );
                            }
                        }
                    }
                    function invokeDestroyHook(vnode) {
                        var i,
                            j,
                            data = vnode.data;
                        if (data !== undefined) {
                            if (
                                isDef((i = data.hook)) &&
                                isDef((i = i.destroy))
                            )
                                i(vnode);
                            for (i = 0; i < cbs.destroy.length; ++i)
                                cbs.destroy[i](vnode);
                            if (vnode.children !== undefined) {
                                for (j = 0; j < vnode.children.length; ++j) {
                                    i = vnode.children[j];
                                    if (i != null && typeof i !== 'string') {
                                        invokeDestroyHook(i);
                                    }
                                }
                            }
                        }
                    }
                    function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
                        for (; startIdx <= endIdx; ++startIdx) {
                            var i_1 = void 0,
                                listeners = void 0,
                                rm = void 0,
                                ch = vnodes[startIdx];
                            if (ch != null) {
                                if (isDef(ch.sel)) {
                                    invokeDestroyHook(ch);
                                    listeners = cbs.remove.length + 1;
                                    rm = createRmCb(ch.elm, listeners);
                                    for (
                                        i_1 = 0;
                                        i_1 < cbs.remove.length;
                                        ++i_1
                                    )
                                        cbs.remove[i_1](ch, rm);
                                    if (
                                        isDef((i_1 = ch.data)) &&
                                        isDef((i_1 = i_1.hook)) &&
                                        isDef((i_1 = i_1.remove))
                                    ) {
                                        i_1(ch, rm);
                                    } else {
                                        rm();
                                    }
                                } else {
                                    api.removeChild(parentElm, ch.elm);
                                }
                            }
                        }
                    }
                    function updateChildren(
                        parentElm,
                        oldCh,
                        newCh,
                        insertedVnodeQueue
                    ) {
                        var oldStartIdx = 0,
                            newStartIdx = 0;
                        var oldEndIdx = oldCh.length - 1;
                        var oldStartVnode = oldCh[0];
                        var oldEndVnode = oldCh[oldEndIdx];
                        var newEndIdx = newCh.length - 1;
                        var newStartVnode = newCh[0];
                        var newEndVnode = newCh[newEndIdx];
                        var oldKeyToIdx;
                        var idxInOld;
                        var elmToMove;
                        var before;
                        while (
                            oldStartIdx <= oldEndIdx &&
                            newStartIdx <= newEndIdx
                        ) {
                            if (oldStartVnode == null) {
                                oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
                            } else if (oldEndVnode == null) {
                                oldEndVnode = oldCh[--oldEndIdx];
                            } else if (newStartVnode == null) {
                                newStartVnode = newCh[++newStartIdx];
                            } else if (newEndVnode == null) {
                                newEndVnode = newCh[--newEndIdx];
                            } else if (
                                sameVnode(oldStartVnode, newStartVnode)
                            ) {
                                patchVnode(
                                    oldStartVnode,
                                    newStartVnode,
                                    insertedVnodeQueue
                                );
                                oldStartVnode = oldCh[++oldStartIdx];
                                newStartVnode = newCh[++newStartIdx];
                            } else if (sameVnode(oldEndVnode, newEndVnode)) {
                                patchVnode(
                                    oldEndVnode,
                                    newEndVnode,
                                    insertedVnodeQueue
                                );
                                oldEndVnode = oldCh[--oldEndIdx];
                                newEndVnode = newCh[--newEndIdx];
                            } else if (sameVnode(oldStartVnode, newEndVnode)) {
                                patchVnode(
                                    oldStartVnode,
                                    newEndVnode,
                                    insertedVnodeQueue
                                );
                                api.insertBefore(
                                    parentElm,
                                    oldStartVnode.elm,
                                    api.nextSibling(oldEndVnode.elm)
                                );
                                oldStartVnode = oldCh[++oldStartIdx];
                                newEndVnode = newCh[--newEndIdx];
                            } else if (sameVnode(oldEndVnode, newStartVnode)) {
                                patchVnode(
                                    oldEndVnode,
                                    newStartVnode,
                                    insertedVnodeQueue
                                );
                                api.insertBefore(
                                    parentElm,
                                    oldEndVnode.elm,
                                    oldStartVnode.elm
                                );
                                oldEndVnode = oldCh[--oldEndIdx];
                                newStartVnode = newCh[++newStartIdx];
                            } else {
                                if (oldKeyToIdx === undefined) {
                                    oldKeyToIdx = createKeyToOldIdx(
                                        oldCh,
                                        oldStartIdx,
                                        oldEndIdx
                                    );
                                }
                                idxInOld = oldKeyToIdx[newStartVnode.key];
                                if (isUndef(idxInOld)) {
                                    api.insertBefore(
                                        parentElm,
                                        createElm(
                                            newStartVnode,
                                            insertedVnodeQueue
                                        ),
                                        oldStartVnode.elm
                                    );
                                    newStartVnode = newCh[++newStartIdx];
                                } else {
                                    elmToMove = oldCh[idxInOld];
                                    if (elmToMove.sel !== newStartVnode.sel) {
                                        api.insertBefore(
                                            parentElm,
                                            createElm(
                                                newStartVnode,
                                                insertedVnodeQueue
                                            ),
                                            oldStartVnode.elm
                                        );
                                    } else {
                                        patchVnode(
                                            elmToMove,
                                            newStartVnode,
                                            insertedVnodeQueue
                                        );
                                        oldCh[idxInOld] = undefined;
                                        api.insertBefore(
                                            parentElm,
                                            elmToMove.elm,
                                            oldStartVnode.elm
                                        );
                                    }
                                    newStartVnode = newCh[++newStartIdx];
                                }
                            }
                        }
                        if (oldStartIdx > oldEndIdx) {
                            before =
                                newCh[newEndIdx + 1] == null
                                    ? null
                                    : newCh[newEndIdx + 1].elm;
                            addVnodes(
                                parentElm,
                                before,
                                newCh,
                                newStartIdx,
                                newEndIdx,
                                insertedVnodeQueue
                            );
                        } else if (newStartIdx > newEndIdx) {
                            removeVnodes(
                                parentElm,
                                oldCh,
                                oldStartIdx,
                                oldEndIdx
                            );
                        }
                    }
                    function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
                        var i, hook;
                        if (
                            isDef((i = vnode.data)) &&
                            isDef((hook = i.hook)) &&
                            isDef((i = hook.prepatch))
                        ) {
                            i(oldVnode, vnode);
                        }
                        var elm = (vnode.elm = oldVnode.elm);
                        var oldCh = oldVnode.children;
                        var ch = vnode.children;
                        if (oldVnode === vnode) return;
                        if (vnode.data !== undefined) {
                            for (i = 0; i < cbs.update.length; ++i)
                                cbs.update[i](oldVnode, vnode);
                            i = vnode.data.hook;
                            if (isDef(i) && isDef((i = i.update)))
                                i(oldVnode, vnode);
                        }
                        if (isUndef(vnode.text)) {
                            if (isDef(oldCh) && isDef(ch)) {
                                if (oldCh !== ch)
                                    updateChildren(
                                        elm,
                                        oldCh,
                                        ch,
                                        insertedVnodeQueue
                                    );
                            } else if (isDef(ch)) {
                                if (isDef(oldVnode.text))
                                    api.setTextContent(elm, '');
                                addVnodes(
                                    elm,
                                    null,
                                    ch,
                                    0,
                                    ch.length - 1,
                                    insertedVnodeQueue
                                );
                            } else if (isDef(oldCh)) {
                                removeVnodes(elm, oldCh, 0, oldCh.length - 1);
                            } else if (isDef(oldVnode.text)) {
                                api.setTextContent(elm, '');
                            }
                        } else if (oldVnode.text !== vnode.text) {
                            api.setTextContent(elm, vnode.text);
                        }
                        if (isDef(hook) && isDef((i = hook.postpatch))) {
                            i(oldVnode, vnode);
                        }
                    }
                    return function patch(oldVnode, vnode) {
                        var i, elm, parent;
                        var insertedVnodeQueue = [];
                        for (i = 0; i < cbs.pre.length; ++i) cbs.pre[i]();
                        if (!isVnode(oldVnode)) {
                            oldVnode = emptyNodeAt(oldVnode);
                        }
                        if (sameVnode(oldVnode, vnode)) {
                            patchVnode(oldVnode, vnode, insertedVnodeQueue);
                        } else {
                            elm = oldVnode.elm;
                            parent = api.parentNode(elm);
                            createElm(vnode, insertedVnodeQueue);
                            if (parent !== null) {
                                api.insertBefore(
                                    parent,
                                    vnode.elm,
                                    api.nextSibling(elm)
                                );
                                removeVnodes(parent, [oldVnode], 0, 0);
                            }
                        }
                        for (i = 0; i < insertedVnodeQueue.length; ++i) {
                            insertedVnodeQueue[i].data.hook.insert(
                                insertedVnodeQueue[i]
                            );
                        }
                        for (i = 0; i < cbs.post.length; ++i) cbs.post[i]();
                        return vnode;
                    };
                }
                exports.init = init;
            },
            {
                './h': 126,
                './htmldomapi': 127,
                './is': 128,
                './thunk': 135,
                './vnode': 137
            }
        ],
        135: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                var h_1 = require('./h');
                function copyToThunk(vnode, thunk) {
                    thunk.elm = vnode.elm;
                    vnode.data.fn = thunk.data.fn;
                    vnode.data.args = thunk.data.args;
                    thunk.data = vnode.data;
                    thunk.children = vnode.children;
                    thunk.text = vnode.text;
                    thunk.elm = vnode.elm;
                }
                function init(thunk) {
                    var cur = thunk.data;
                    var vnode = cur.fn.apply(undefined, cur.args);
                    copyToThunk(vnode, thunk);
                }
                function prepatch(oldVnode, thunk) {
                    var i,
                        old = oldVnode.data,
                        cur = thunk.data;
                    var oldArgs = old.args,
                        args = cur.args;
                    if (old.fn !== cur.fn || oldArgs.length !== args.length) {
                        copyToThunk(cur.fn.apply(undefined, args), thunk);
                        return;
                    }
                    for (i = 0; i < args.length; ++i) {
                        if (oldArgs[i] !== args[i]) {
                            copyToThunk(cur.fn.apply(undefined, args), thunk);
                            return;
                        }
                    }
                    copyToThunk(oldVnode, thunk);
                }
                exports.thunk = function thunk(sel, key, fn, args) {
                    if (args === undefined) {
                        args = fn;
                        fn = key;
                        key = undefined;
                    }
                    return h_1.h(sel, {
                        key: key,
                        hook: { init: init, prepatch: prepatch },
                        fn: fn,
                        args: args
                    });
                };
                exports.default = exports.thunk;
            },
            { './h': 126 }
        ],
        136: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                var vnode_1 = require('./vnode');
                var htmldomapi_1 = require('./htmldomapi');
                function toVNode(node, domApi) {
                    var api =
                        domApi !== undefined ? domApi : htmldomapi_1.default;
                    var text;
                    if (api.isElement(node)) {
                        var id = node.id ? '#' + node.id : '';
                        var cn = node.getAttribute('class');
                        var c = cn ? '.' + cn.split(' ').join('.') : '';
                        var sel = api.tagName(node).toLowerCase() + id + c;
                        var attrs = {};
                        var children = [];
                        var name_1;
                        var i = void 0,
                            n = void 0;
                        var elmAttrs = node.attributes;
                        var elmChildren = node.childNodes;
                        for (i = 0, n = elmAttrs.length; i < n; i++) {
                            name_1 = elmAttrs[i].nodeName;
                            if (name_1 !== 'id' && name_1 !== 'class') {
                                attrs[name_1] = elmAttrs[i].nodeValue;
                            }
                        }
                        for (i = 0, n = elmChildren.length; i < n; i++) {
                            children.push(toVNode(elmChildren[i]));
                        }
                        return vnode_1.default(
                            sel,
                            { attrs: attrs },
                            children,
                            undefined,
                            node
                        );
                    } else if (api.isText(node)) {
                        text = api.getTextContent(node);
                        return vnode_1.default(
                            undefined,
                            undefined,
                            undefined,
                            text,
                            node
                        );
                    } else if (api.isComment(node)) {
                        text = api.getTextContent(node);
                        return vnode_1.default('!', {}, [], text, node);
                    } else {
                        return vnode_1.default('', {}, [], undefined, node);
                    }
                }
                exports.toVNode = toVNode;
                exports.default = toVNode;
            },
            { './htmldomapi': 127, './vnode': 137 }
        ],
        137: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                function vnode(sel, data, children, text, elm) {
                    var key = data === undefined ? undefined : data.key;
                    return {
                        sel: sel,
                        data: data,
                        children: children,
                        text: text,
                        elm: elm,
                        key: key
                    };
                }
                exports.vnode = vnode;
                exports.default = vnode;
            },
            {}
        ],
        138: [
            function(require, module, exports) {
                // Copyright Joyent, Inc. and other Node contributors.
                //
                // Permission is hereby granted, free of charge, to any person obtaining a
                // copy of this software and associated documentation files (the
                // "Software"), to deal in the Software without restriction, including
                // without limitation the rights to use, copy, modify, merge, publish,
                // distribute, sublicense, and/or sell copies of the Software, and to permit
                // persons to whom the Software is furnished to do so, subject to the
                // following conditions:
                //
                // The above copyright notice and this permission notice shall be included
                // in all copies or substantial portions of the Software.
                //
                // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
                // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
                // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
                // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
                // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
                // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
                // USE OR OTHER DEALINGS IN THE SOFTWARE.

                module.exports = Stream;

                var EE = require('events').EventEmitter;
                var inherits = require('inherits');

                inherits(Stream, EE);
                Stream.Readable = require('readable-stream/readable.js');
                Stream.Writable = require('readable-stream/writable.js');
                Stream.Duplex = require('readable-stream/duplex.js');
                Stream.Transform = require('readable-stream/transform.js');
                Stream.PassThrough = require('readable-stream/passthrough.js');

                // Backwards-compat with node 0.4.x
                Stream.Stream = Stream;

                // old-style streams.  Note that the pipe method (the only relevant
                // part of this class) is overridden in the Readable class.

                function Stream() {
                    EE.call(this);
                }

                Stream.prototype.pipe = function(dest, options) {
                    var source = this;

                    function ondata(chunk) {
                        if (dest.writable) {
                            if (false === dest.write(chunk) && source.pause) {
                                source.pause();
                            }
                        }
                    }

                    source.on('data', ondata);

                    function ondrain() {
                        if (source.readable && source.resume) {
                            source.resume();
                        }
                    }

                    dest.on('drain', ondrain);

                    // If the 'end' option is not supplied, dest.end() will be called when
                    // source gets the 'end' or 'close' events.  Only dest.end() once.
                    if (!dest._isStdio && (!options || options.end !== false)) {
                        source.on('end', onend);
                        source.on('close', onclose);
                    }

                    var didOnEnd = false;
                    function onend() {
                        if (didOnEnd) return;
                        didOnEnd = true;

                        dest.end();
                    }

                    function onclose() {
                        if (didOnEnd) return;
                        didOnEnd = true;

                        if (typeof dest.destroy === 'function') dest.destroy();
                    }

                    // don't leave dangling pipes when there are errors.
                    function onerror(er) {
                        cleanup();
                        if (EE.listenerCount(this, 'error') === 0) {
                            throw er; // Unhandled stream error in pipe.
                        }
                    }

                    source.on('error', onerror);
                    dest.on('error', onerror);

                    // remove all the event listeners that were added.
                    function cleanup() {
                        source.removeListener('data', ondata);
                        dest.removeListener('drain', ondrain);

                        source.removeListener('end', onend);
                        source.removeListener('close', onclose);

                        source.removeListener('error', onerror);
                        dest.removeListener('error', onerror);

                        source.removeListener('end', cleanup);
                        source.removeListener('close', cleanup);

                        dest.removeListener('close', cleanup);
                    }

                    source.on('end', cleanup);
                    source.on('close', cleanup);

                    dest.on('close', cleanup);

                    dest.emit('pipe', source);

                    // Allow for unix-like usage: A.pipe(B).pipe(C)
                    return dest;
                };
            },
            {
                events: 99,
                inherits: 101,
                'readable-stream/duplex.js': 106,
                'readable-stream/passthrough.js': 115,
                'readable-stream/readable.js': 116,
                'readable-stream/transform.js': 117,
                'readable-stream/writable.js': 118
            }
        ],
        139: [
            function(require, module, exports) {
                'use strict';

                var Buffer = require('safe-buffer').Buffer;

                var isEncoding =
                    Buffer.isEncoding ||
                    function(encoding) {
                        encoding = '' + encoding;
                        switch (encoding && encoding.toLowerCase()) {
                            case 'hex':
                            case 'utf8':
                            case 'utf-8':
                            case 'ascii':
                            case 'binary':
                            case 'base64':
                            case 'ucs2':
                            case 'ucs-2':
                            case 'utf16le':
                            case 'utf-16le':
                            case 'raw':
                                return true;
                            default:
                                return false;
                        }
                    };

                function _normalizeEncoding(enc) {
                    if (!enc) return 'utf8';
                    var retried;
                    while (true) {
                        switch (enc) {
                            case 'utf8':
                            case 'utf-8':
                                return 'utf8';
                            case 'ucs2':
                            case 'ucs-2':
                            case 'utf16le':
                            case 'utf-16le':
                                return 'utf16le';
                            case 'latin1':
                            case 'binary':
                                return 'latin1';
                            case 'base64':
                            case 'ascii':
                            case 'hex':
                                return enc;
                            default:
                                if (retried) return; // undefined
                                enc = ('' + enc).toLowerCase();
                                retried = true;
                        }
                    }
                }

                // Do not cache `Buffer.isEncoding` when checking encoding names as some
                // modules monkey-patch it to support additional encodings
                function normalizeEncoding(enc) {
                    var nenc = _normalizeEncoding(enc);
                    if (
                        typeof nenc !== 'string' &&
                        (Buffer.isEncoding === isEncoding || !isEncoding(enc))
                    )
                        throw new Error('Unknown encoding: ' + enc);
                    return nenc || enc;
                }

                // StringDecoder provides an interface for efficiently splitting a series of
                // buffers into a series of JS strings without breaking apart multi-byte
                // characters.
                exports.StringDecoder = StringDecoder;
                function StringDecoder(encoding) {
                    this.encoding = normalizeEncoding(encoding);
                    var nb;
                    switch (this.encoding) {
                        case 'utf16le':
                            this.text = utf16Text;
                            this.end = utf16End;
                            nb = 4;
                            break;
                        case 'utf8':
                            this.fillLast = utf8FillLast;
                            nb = 4;
                            break;
                        case 'base64':
                            this.text = base64Text;
                            this.end = base64End;
                            nb = 3;
                            break;
                        default:
                            this.write = simpleWrite;
                            this.end = simpleEnd;
                            return;
                    }
                    this.lastNeed = 0;
                    this.lastTotal = 0;
                    this.lastChar = Buffer.allocUnsafe(nb);
                }

                StringDecoder.prototype.write = function(buf) {
                    if (buf.length === 0) return '';
                    var r;
                    var i;
                    if (this.lastNeed) {
                        r = this.fillLast(buf);
                        if (r === undefined) return '';
                        i = this.lastNeed;
                        this.lastNeed = 0;
                    } else {
                        i = 0;
                    }
                    if (i < buf.length)
                        return r ? r + this.text(buf, i) : this.text(buf, i);
                    return r || '';
                };

                StringDecoder.prototype.end = utf8End;

                // Returns only complete characters in a Buffer
                StringDecoder.prototype.text = utf8Text;

                // Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
                StringDecoder.prototype.fillLast = function(buf) {
                    if (this.lastNeed <= buf.length) {
                        buf.copy(
                            this.lastChar,
                            this.lastTotal - this.lastNeed,
                            0,
                            this.lastNeed
                        );
                        return this.lastChar.toString(
                            this.encoding,
                            0,
                            this.lastTotal
                        );
                    }
                    buf.copy(
                        this.lastChar,
                        this.lastTotal - this.lastNeed,
                        0,
                        buf.length
                    );
                    this.lastNeed -= buf.length;
                };

                // Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
                // continuation byte.
                function utf8CheckByte(byte) {
                    if (byte <= 0x7f) return 0;
                    else if (byte >> 5 === 0x06) return 2;
                    else if (byte >> 4 === 0x0e) return 3;
                    else if (byte >> 3 === 0x1e) return 4;
                    return -1;
                }

                // Checks at most 3 bytes at the end of a Buffer in order to detect an
                // incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
                // needed to complete the UTF-8 character (if applicable) are returned.
                function utf8CheckIncomplete(self, buf, i) {
                    var j = buf.length - 1;
                    if (j < i) return 0;
                    var nb = utf8CheckByte(buf[j]);
                    if (nb >= 0) {
                        if (nb > 0) self.lastNeed = nb - 1;
                        return nb;
                    }
                    if (--j < i) return 0;
                    nb = utf8CheckByte(buf[j]);
                    if (nb >= 0) {
                        if (nb > 0) self.lastNeed = nb - 2;
                        return nb;
                    }
                    if (--j < i) return 0;
                    nb = utf8CheckByte(buf[j]);
                    if (nb >= 0) {
                        if (nb > 0) {
                            if (nb === 2) nb = 0;
                            else self.lastNeed = nb - 3;
                        }
                        return nb;
                    }
                    return 0;
                }

                // Validates as many continuation bytes for a multi-byte UTF-8 character as
                // needed or are available. If we see a non-continuation byte where we expect
                // one, we "replace" the validated continuation bytes we've seen so far with
                // UTF-8 replacement characters ('\ufffd'), to match v8's UTF-8 decoding
                // behavior. The continuation byte check is included three times in the case
                // where all of the continuation bytes for a character exist in the same buffer.
                // It is also done this way as a slight performance increase instead of using a
                // loop.
                function utf8CheckExtraBytes(self, buf, p) {
                    if ((buf[0] & 0xc0) !== 0x80) {
                        self.lastNeed = 0;
                        return '\ufffd'.repeat(p);
                    }
                    if (self.lastNeed > 1 && buf.length > 1) {
                        if ((buf[1] & 0xc0) !== 0x80) {
                            self.lastNeed = 1;
                            return '\ufffd'.repeat(p + 1);
                        }
                        if (self.lastNeed > 2 && buf.length > 2) {
                            if ((buf[2] & 0xc0) !== 0x80) {
                                self.lastNeed = 2;
                                return '\ufffd'.repeat(p + 2);
                            }
                        }
                    }
                }

                // Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
                function utf8FillLast(buf) {
                    var p = this.lastTotal - this.lastNeed;
                    var r = utf8CheckExtraBytes(this, buf, p);
                    if (r !== undefined) return r;
                    if (this.lastNeed <= buf.length) {
                        buf.copy(this.lastChar, p, 0, this.lastNeed);
                        return this.lastChar.toString(
                            this.encoding,
                            0,
                            this.lastTotal
                        );
                    }
                    buf.copy(this.lastChar, p, 0, buf.length);
                    this.lastNeed -= buf.length;
                }

                // Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
                // partial character, the character's bytes are buffered until the required
                // number of bytes are available.
                function utf8Text(buf, i) {
                    var total = utf8CheckIncomplete(this, buf, i);
                    if (!this.lastNeed) return buf.toString('utf8', i);
                    this.lastTotal = total;
                    var end = buf.length - (total - this.lastNeed);
                    buf.copy(this.lastChar, 0, end);
                    return buf.toString('utf8', i, end);
                }

                // For UTF-8, a replacement character for each buffered byte of a (partial)
                // character needs to be added to the output.
                function utf8End(buf) {
                    var r = buf && buf.length ? this.write(buf) : '';
                    if (this.lastNeed)
                        return (
                            r + '\ufffd'.repeat(this.lastTotal - this.lastNeed)
                        );
                    return r;
                }

                // UTF-16LE typically needs two bytes per character, but even if we have an even
                // number of bytes available, we need to check if we end on a leading/high
                // surrogate. In that case, we need to wait for the next two bytes in order to
                // decode the last character properly.
                function utf16Text(buf, i) {
                    if ((buf.length - i) % 2 === 0) {
                        var r = buf.toString('utf16le', i);
                        if (r) {
                            var c = r.charCodeAt(r.length - 1);
                            if (c >= 0xd800 && c <= 0xdbff) {
                                this.lastNeed = 2;
                                this.lastTotal = 4;
                                this.lastChar[0] = buf[buf.length - 2];
                                this.lastChar[1] = buf[buf.length - 1];
                                return r.slice(0, -1);
                            }
                        }
                        return r;
                    }
                    this.lastNeed = 1;
                    this.lastTotal = 2;
                    this.lastChar[0] = buf[buf.length - 1];
                    return buf.toString('utf16le', i, buf.length - 1);
                }

                // For UTF-16LE we do not explicitly append special replacement characters if we
                // end on a partial character, we simply let v8 handle that.
                function utf16End(buf) {
                    var r = buf && buf.length ? this.write(buf) : '';
                    if (this.lastNeed) {
                        var end = this.lastTotal - this.lastNeed;
                        return r + this.lastChar.toString('utf16le', 0, end);
                    }
                    return r;
                }

                function base64Text(buf, i) {
                    var n = (buf.length - i) % 3;
                    if (n === 0) return buf.toString('base64', i);
                    this.lastNeed = 3 - n;
                    this.lastTotal = 3;
                    if (n === 1) {
                        this.lastChar[0] = buf[buf.length - 1];
                    } else {
                        this.lastChar[0] = buf[buf.length - 2];
                        this.lastChar[1] = buf[buf.length - 1];
                    }
                    return buf.toString('base64', i, buf.length - n);
                }

                function base64End(buf) {
                    var r = buf && buf.length ? this.write(buf) : '';
                    if (this.lastNeed)
                        return (
                            r +
                            this.lastChar.toString(
                                'base64',
                                0,
                                3 - this.lastNeed
                            )
                        );
                    return r;
                }

                // Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
                function simpleWrite(buf) {
                    return buf.toString(this.encoding);
                }

                function simpleEnd(buf) {
                    return buf && buf.length ? this.write(buf) : '';
                }
            },
            { 'safe-buffer': 119 }
        ],
        140: [
            function(require, module, exports) {
                module.exports = require('./lib/index');
            },
            { './lib/index': 141 }
        ],
        141: [
            function(require, module, exports) {
                (function(global) {
                    'use strict';

                    Object.defineProperty(exports, '__esModule', {
                        value: true
                    });

                    var _ponyfill = require('./ponyfill');

                    var _ponyfill2 = _interopRequireDefault(_ponyfill);

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : { default: obj };
                    }

                    var root; /* global window */

                    if (typeof self !== 'undefined') {
                        root = self;
                    } else if (typeof window !== 'undefined') {
                        root = window;
                    } else if (typeof global !== 'undefined') {
                        root = global;
                    } else if (typeof module !== 'undefined') {
                        root = module;
                    } else {
                        root = Function('return this')();
                    }

                    var result = (0, _ponyfill2['default'])(root);
                    exports['default'] = result;
                }.call(
                    this,
                    typeof global !== 'undefined'
                        ? global
                        : typeof self !== 'undefined'
                          ? self
                          : typeof window !== 'undefined' ? window : {}
                ));
            },
            { './ponyfill': 142 }
        ],
        142: [
            function(require, module, exports) {
                'use strict';

                Object.defineProperty(exports, '__esModule', {
                    value: true
                });
                exports['default'] = symbolObservablePonyfill;
                function symbolObservablePonyfill(root) {
                    var result;
                    var _Symbol = root.Symbol;

                    if (typeof _Symbol === 'function') {
                        if (_Symbol.observable) {
                            result = _Symbol.observable;
                        } else {
                            result = _Symbol('observable');
                            _Symbol.observable = result;
                        }
                    } else {
                        result = '@@observable';
                    }

                    return result;
                }
            },
            {}
        ],
        143: [
            function(require, module, exports) {
                (function(process) {
                    var Stream = require('stream');

                    // through
                    //
                    // a stream that does nothing but re-emit the input.
                    // useful for aggregating a series of changing but not ending streams into one stream)

                    exports = module.exports = through;
                    through.through = through;

                    //create a readable writable stream.

                    function through(write, end, opts) {
                        write =
                            write ||
                            function(data) {
                                this.queue(data);
                            };
                        end =
                            end ||
                            function() {
                                this.queue(null);
                            };

                        var ended = false,
                            destroyed = false,
                            buffer = [],
                            _ended = false;
                        var stream = new Stream();
                        stream.readable = stream.writable = true;
                        stream.paused = false;

                        //  stream.autoPause   = !(opts && opts.autoPause   === false)
                        stream.autoDestroy = !(
                            opts && opts.autoDestroy === false
                        );

                        stream.write = function(data) {
                            write.call(this, data);
                            return !stream.paused;
                        };

                        function drain() {
                            while (buffer.length && !stream.paused) {
                                var data = buffer.shift();
                                if (null === data) return stream.emit('end');
                                else stream.emit('data', data);
                            }
                        }

                        stream.queue = stream.push = function(data) {
                            //    console.error(ended)
                            if (_ended) return stream;
                            if (data === null) _ended = true;
                            buffer.push(data);
                            drain();
                            return stream;
                        };

                        //this will be registered as the first 'end' listener
                        //must call destroy next tick, to make sure we're after any
                        //stream piped from here.
                        //this is only a problem if end is not emitted synchronously.
                        //a nicer way to do this is to make sure this is the last listener for 'end'

                        stream.on('end', function() {
                            stream.readable = false;
                            if (!stream.writable && stream.autoDestroy)
                                process.nextTick(function() {
                                    stream.destroy();
                                });
                        });

                        function _end() {
                            stream.writable = false;
                            end.call(stream);
                            if (!stream.readable && stream.autoDestroy)
                                stream.destroy();
                        }

                        stream.end = function(data) {
                            if (ended) return;
                            ended = true;
                            if (arguments.length) stream.write(data);
                            _end(); // will emit or queue
                            return stream;
                        };

                        stream.destroy = function() {
                            if (destroyed) return;
                            destroyed = true;
                            ended = true;
                            buffer.length = 0;
                            stream.writable = stream.readable = false;
                            stream.emit('close');
                            return stream;
                        };

                        stream.pause = function() {
                            if (stream.paused) return;
                            stream.paused = true;
                            return stream;
                        };

                        stream.resume = function() {
                            if (stream.paused) {
                                stream.paused = false;
                                stream.emit('resume');
                            }
                            drain();
                            //may have become paused again,
                            //as drain emits 'data'.
                            if (!stream.paused) stream.emit('drain');
                            return stream;
                        };
                        return stream;
                    }
                }.call(this, require('_process')));
            },
            { _process: 105, stream: 138 }
        ],
        144: [
            function(require, module, exports) {
                (function(global) {
                    /**
 * Module exports.
 */

                    module.exports = deprecate;

                    /**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

                    function deprecate(fn, msg) {
                        if (config('noDeprecation')) {
                            return fn;
                        }

                        var warned = false;
                        function deprecated() {
                            if (!warned) {
                                if (config('throwDeprecation')) {
                                    throw new Error(msg);
                                } else if (config('traceDeprecation')) {
                                    console.trace(msg);
                                } else {
                                    console.warn(msg);
                                }
                                warned = true;
                            }
                            return fn.apply(this, arguments);
                        }

                        return deprecated;
                    }

                    /**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

                    function config(name) {
                        // accessing global.localStorage can trigger a DOMException in sandboxed iframes
                        try {
                            if (!global.localStorage) return false;
                        } catch (_) {
                            return false;
                        }
                        var val = global.localStorage[name];
                        if (null == val) return false;
                        return String(val).toLowerCase() === 'true';
                    }
                }.call(
                    this,
                    typeof global !== 'undefined'
                        ? global
                        : typeof self !== 'undefined'
                          ? self
                          : typeof window !== 'undefined' ? window : {}
                ));
            },
            {}
        ],
        145: [
            function(require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                var index_1 = require('../index');
                var DelayOperator = /** @class */ (function() {
                    function DelayOperator(dt, ins) {
                        this.dt = dt;
                        this.ins = ins;
                        this.type = 'delay';
                        this.out = null;
                    }
                    DelayOperator.prototype._start = function(out) {
                        this.out = out;
                        this.ins._add(this);
                    };
                    DelayOperator.prototype._stop = function() {
                        this.ins._remove(this);
                        this.out = null;
                    };
                    DelayOperator.prototype._n = function(t) {
                        var u = this.out;
                        if (!u) return;
                        var id = setInterval(function() {
                            u._n(t);
                            clearInterval(id);
                        }, this.dt);
                    };
                    DelayOperator.prototype._e = function(err) {
                        var u = this.out;
                        if (!u) return;
                        var id = setInterval(function() {
                            u._e(err);
                            clearInterval(id);
                        }, this.dt);
                    };
                    DelayOperator.prototype._c = function() {
                        var u = this.out;
                        if (!u) return;
                        var id = setInterval(function() {
                            u._c();
                            clearInterval(id);
                        }, this.dt);
                    };
                    return DelayOperator;
                })();
                /**
 * Delays periodic events by a given time period.
 *
 * Marble diagram:
 *
 * ```text
 * 1----2--3--4----5|
 *     delay(60)
 * ---1----2--3--4----5|
 * ```
 *
 * Example:
 *
 * ```js
 * import fromDiagram from 'xstream/extra/fromDiagram'
 * import delay from 'xstream/extra/delay'
 *
 * const stream = fromDiagram('1----2--3--4----5|')
 *  .compose(delay(60))
 *
 * stream.addListener({
 *   next: i => console.log(i),
 *   error: err => console.error(err),
 *   complete: () => console.log('completed')
 * })
 * ```
 *
 * ```text
 * > 1  (after 60 ms)
 * > 2  (after 160 ms)
 * > 3  (after 220 ms)
 * > 4  (after 280 ms)
 * > 5  (after 380 ms)
 * > completed
 * ```
 *
 * @param {number} period The amount of silence required in milliseconds.
 * @return {Stream}
 */
                function delay(period) {
                    return function delayOperator(ins) {
                        return new index_1.Stream(
                            new DelayOperator(period, ins)
                        );
                    };
                }
                exports.default = delay;
            },
            { '../index': 146 }
        ],
        146: [
            function(require, module, exports) {
                'use strict';
                var __extends =
                    (this && this.__extends) ||
                    (function() {
                        var extendStatics =
                            Object.setPrototypeOf ||
                            ({ __proto__: [] } instanceof Array &&
                                function(d, b) {
                                    d.__proto__ = b;
                                }) ||
                            function(d, b) {
                                for (var p in b)
                                    if (b.hasOwnProperty(p)) d[p] = b[p];
                            };
                        return function(d, b) {
                            extendStatics(d, b);
                            function __() {
                                this.constructor = d;
                            }
                            d.prototype =
                                b === null
                                    ? Object.create(b)
                                    : ((__.prototype = b.prototype), new __());
                        };
                    })();
                Object.defineProperty(exports, '__esModule', { value: true });
                var symbol_observable_1 = require('symbol-observable');
                var NO = {};
                exports.NO = NO;
                function noop() {}
                function cp(a) {
                    var l = a.length;
                    var b = Array(l);
                    for (var i = 0; i < l; ++i) b[i] = a[i];
                    return b;
                }
                function and(f1, f2) {
                    return function andFn(t) {
                        return f1(t) && f2(t);
                    };
                }
                function _try(c, t, u) {
                    try {
                        return c.f(t);
                    } catch (e) {
                        u._e(e);
                        return NO;
                    }
                }
                var NO_IL = {
                    _n: noop,
                    _e: noop,
                    _c: noop
                };
                exports.NO_IL = NO_IL;
                // mutates the input
                function internalizeProducer(producer) {
                    producer._start = function _start(il) {
                        il.next = il._n;
                        il.error = il._e;
                        il.complete = il._c;
                        this.start(il);
                    };
                    producer._stop = producer.stop;
                }
                var StreamSub = /** @class */ (function() {
                    function StreamSub(_stream, _listener) {
                        this._stream = _stream;
                        this._listener = _listener;
                    }
                    StreamSub.prototype.unsubscribe = function() {
                        this._stream.removeListener(this._listener);
                    };
                    return StreamSub;
                })();
                var Observer = /** @class */ (function() {
                    function Observer(_listener) {
                        this._listener = _listener;
                    }
                    Observer.prototype.next = function(value) {
                        this._listener._n(value);
                    };
                    Observer.prototype.error = function(err) {
                        this._listener._e(err);
                    };
                    Observer.prototype.complete = function() {
                        this._listener._c();
                    };
                    return Observer;
                })();
                var FromObservable = /** @class */ (function() {
                    function FromObservable(observable) {
                        this.type = 'fromObservable';
                        this.ins = observable;
                        this.active = false;
                    }
                    FromObservable.prototype._start = function(out) {
                        this.out = out;
                        this.active = true;
                        this._sub = this.ins.subscribe(new Observer(out));
                        if (!this.active) this._sub.unsubscribe();
                    };
                    FromObservable.prototype._stop = function() {
                        if (this._sub) this._sub.unsubscribe();
                        this.active = false;
                    };
                    return FromObservable;
                })();
                var Merge = /** @class */ (function() {
                    function Merge(insArr) {
                        this.type = 'merge';
                        this.insArr = insArr;
                        this.out = NO;
                        this.ac = 0;
                    }
                    Merge.prototype._start = function(out) {
                        this.out = out;
                        var s = this.insArr;
                        var L = s.length;
                        this.ac = L;
                        for (var i = 0; i < L; i++) s[i]._add(this);
                    };
                    Merge.prototype._stop = function() {
                        var s = this.insArr;
                        var L = s.length;
                        for (var i = 0; i < L; i++) s[i]._remove(this);
                        this.out = NO;
                    };
                    Merge.prototype._n = function(t) {
                        var u = this.out;
                        if (u === NO) return;
                        u._n(t);
                    };
                    Merge.prototype._e = function(err) {
                        var u = this.out;
                        if (u === NO) return;
                        u._e(err);
                    };
                    Merge.prototype._c = function() {
                        if (--this.ac <= 0) {
                            var u = this.out;
                            if (u === NO) return;
                            u._c();
                        }
                    };
                    return Merge;
                })();
                var CombineListener = /** @class */ (function() {
                    function CombineListener(i, out, p) {
                        this.i = i;
                        this.out = out;
                        this.p = p;
                        p.ils.push(this);
                    }
                    CombineListener.prototype._n = function(t) {
                        var p = this.p,
                            out = this.out;
                        if (out === NO) return;
                        if (p.up(t, this.i)) {
                            var a = p.vals;
                            var l = a.length;
                            var b = Array(l);
                            for (var i = 0; i < l; ++i) b[i] = a[i];
                            out._n(b);
                        }
                    };
                    CombineListener.prototype._e = function(err) {
                        var out = this.out;
                        if (out === NO) return;
                        out._e(err);
                    };
                    CombineListener.prototype._c = function() {
                        var p = this.p;
                        if (p.out === NO) return;
                        if (--p.Nc === 0) p.out._c();
                    };
                    return CombineListener;
                })();
                var Combine = /** @class */ (function() {
                    function Combine(insArr) {
                        this.type = 'combine';
                        this.insArr = insArr;
                        this.out = NO;
                        this.ils = [];
                        this.Nc = this.Nn = 0;
                        this.vals = [];
                    }
                    Combine.prototype.up = function(t, i) {
                        var v = this.vals[i];
                        var Nn = !this.Nn ? 0 : v === NO ? --this.Nn : this.Nn;
                        this.vals[i] = t;
                        return Nn === 0;
                    };
                    Combine.prototype._start = function(out) {
                        this.out = out;
                        var s = this.insArr;
                        var n = (this.Nc = this.Nn = s.length);
                        var vals = (this.vals = new Array(n));
                        if (n === 0) {
                            out._n([]);
                            out._c();
                        } else {
                            for (var i = 0; i < n; i++) {
                                vals[i] = NO;
                                s[i]._add(new CombineListener(i, out, this));
                            }
                        }
                    };
                    Combine.prototype._stop = function() {
                        var s = this.insArr;
                        var n = s.length;
                        var ils = this.ils;
                        for (var i = 0; i < n; i++) s[i]._remove(ils[i]);
                        this.out = NO;
                        this.ils = [];
                        this.vals = [];
                    };
                    return Combine;
                })();
                var FromArray = /** @class */ (function() {
                    function FromArray(a) {
                        this.type = 'fromArray';
                        this.a = a;
                    }
                    FromArray.prototype._start = function(out) {
                        var a = this.a;
                        for (var i = 0, n = a.length; i < n; i++) out._n(a[i]);
                        out._c();
                    };
                    FromArray.prototype._stop = function() {};
                    return FromArray;
                })();
                var FromPromise = /** @class */ (function() {
                    function FromPromise(p) {
                        this.type = 'fromPromise';
                        this.on = false;
                        this.p = p;
                    }
                    FromPromise.prototype._start = function(out) {
                        var prod = this;
                        this.on = true;
                        this.p
                            .then(
                                function(v) {
                                    if (prod.on) {
                                        out._n(v);
                                        out._c();
                                    }
                                },
                                function(e) {
                                    out._e(e);
                                }
                            )
                            .then(noop, function(err) {
                                setTimeout(function() {
                                    throw err;
                                });
                            });
                    };
                    FromPromise.prototype._stop = function() {
                        this.on = false;
                    };
                    return FromPromise;
                })();
                var Periodic = /** @class */ (function() {
                    function Periodic(period) {
                        this.type = 'periodic';
                        this.period = period;
                        this.intervalID = -1;
                        this.i = 0;
                    }
                    Periodic.prototype._start = function(out) {
                        var self = this;
                        function intervalHandler() {
                            out._n(self.i++);
                        }
                        this.intervalID = setInterval(
                            intervalHandler,
                            this.period
                        );
                    };
                    Periodic.prototype._stop = function() {
                        if (this.intervalID !== -1)
                            clearInterval(this.intervalID);
                        this.intervalID = -1;
                        this.i = 0;
                    };
                    return Periodic;
                })();
                var Debug = /** @class */ (function() {
                    function Debug(ins, arg) {
                        this.type = 'debug';
                        this.ins = ins;
                        this.out = NO;
                        this.s = noop;
                        this.l = '';
                        if (typeof arg === 'string') this.l = arg;
                        else if (typeof arg === 'function') this.s = arg;
                    }
                    Debug.prototype._start = function(out) {
                        this.out = out;
                        this.ins._add(this);
                    };
                    Debug.prototype._stop = function() {
                        this.ins._remove(this);
                        this.out = NO;
                    };
                    Debug.prototype._n = function(t) {
                        var u = this.out;
                        if (u === NO) return;
                        var s = this.s,
                            l = this.l;
                        if (s !== noop) {
                            try {
                                s(t);
                            } catch (e) {
                                u._e(e);
                            }
                        } else if (l) console.log(l + ':', t);
                        else console.log(t);
                        u._n(t);
                    };
                    Debug.prototype._e = function(err) {
                        var u = this.out;
                        if (u === NO) return;
                        u._e(err);
                    };
                    Debug.prototype._c = function() {
                        var u = this.out;
                        if (u === NO) return;
                        u._c();
                    };
                    return Debug;
                })();
                var Drop = /** @class */ (function() {
                    function Drop(max, ins) {
                        this.type = 'drop';
                        this.ins = ins;
                        this.out = NO;
                        this.max = max;
                        this.dropped = 0;
                    }
                    Drop.prototype._start = function(out) {
                        this.out = out;
                        this.dropped = 0;
                        this.ins._add(this);
                    };
                    Drop.prototype._stop = function() {
                        this.ins._remove(this);
                        this.out = NO;
                    };
                    Drop.prototype._n = function(t) {
                        var u = this.out;
                        if (u === NO) return;
                        if (this.dropped++ >= this.max) u._n(t);
                    };
                    Drop.prototype._e = function(err) {
                        var u = this.out;
                        if (u === NO) return;
                        u._e(err);
                    };
                    Drop.prototype._c = function() {
                        var u = this.out;
                        if (u === NO) return;
                        u._c();
                    };
                    return Drop;
                })();
                var EndWhenListener = /** @class */ (function() {
                    function EndWhenListener(out, op) {
                        this.out = out;
                        this.op = op;
                    }
                    EndWhenListener.prototype._n = function() {
                        this.op.end();
                    };
                    EndWhenListener.prototype._e = function(err) {
                        this.out._e(err);
                    };
                    EndWhenListener.prototype._c = function() {
                        this.op.end();
                    };
                    return EndWhenListener;
                })();
                var EndWhen = /** @class */ (function() {
                    function EndWhen(o, ins) {
                        this.type = 'endWhen';
                        this.ins = ins;
                        this.out = NO;
                        this.o = o;
                        this.oil = NO_IL;
                    }
                    EndWhen.prototype._start = function(out) {
                        this.out = out;
                        this.o._add(
                            (this.oil = new EndWhenListener(out, this))
                        );
                        this.ins._add(this);
                    };
                    EndWhen.prototype._stop = function() {
                        this.ins._remove(this);
                        this.o._remove(this.oil);
                        this.out = NO;
                        this.oil = NO_IL;
                    };
                    EndWhen.prototype.end = function() {
                        var u = this.out;
                        if (u === NO) return;
                        u._c();
                    };
                    EndWhen.prototype._n = function(t) {
                        var u = this.out;
                        if (u === NO) return;
                        u._n(t);
                    };
                    EndWhen.prototype._e = function(err) {
                        var u = this.out;
                        if (u === NO) return;
                        u._e(err);
                    };
                    EndWhen.prototype._c = function() {
                        this.end();
                    };
                    return EndWhen;
                })();
                var Filter = /** @class */ (function() {
                    function Filter(passes, ins) {
                        this.type = 'filter';
                        this.ins = ins;
                        this.out = NO;
                        this.f = passes;
                    }
                    Filter.prototype._start = function(out) {
                        this.out = out;
                        this.ins._add(this);
                    };
                    Filter.prototype._stop = function() {
                        this.ins._remove(this);
                        this.out = NO;
                    };
                    Filter.prototype._n = function(t) {
                        var u = this.out;
                        if (u === NO) return;
                        var r = _try(this, t, u);
                        if (r === NO || !r) return;
                        u._n(t);
                    };
                    Filter.prototype._e = function(err) {
                        var u = this.out;
                        if (u === NO) return;
                        u._e(err);
                    };
                    Filter.prototype._c = function() {
                        var u = this.out;
                        if (u === NO) return;
                        u._c();
                    };
                    return Filter;
                })();
                var FlattenListener = /** @class */ (function() {
                    function FlattenListener(out, op) {
                        this.out = out;
                        this.op = op;
                    }
                    FlattenListener.prototype._n = function(t) {
                        this.out._n(t);
                    };
                    FlattenListener.prototype._e = function(err) {
                        this.out._e(err);
                    };
                    FlattenListener.prototype._c = function() {
                        this.op.inner = NO;
                        this.op.less();
                    };
                    return FlattenListener;
                })();
                var Flatten = /** @class */ (function() {
                    function Flatten(ins) {
                        this.type = 'flatten';
                        this.ins = ins;
                        this.out = NO;
                        this.open = true;
                        this.inner = NO;
                        this.il = NO_IL;
                    }
                    Flatten.prototype._start = function(out) {
                        this.out = out;
                        this.open = true;
                        this.inner = NO;
                        this.il = NO_IL;
                        this.ins._add(this);
                    };
                    Flatten.prototype._stop = function() {
                        this.ins._remove(this);
                        if (this.inner !== NO) this.inner._remove(this.il);
                        this.out = NO;
                        this.open = true;
                        this.inner = NO;
                        this.il = NO_IL;
                    };
                    Flatten.prototype.less = function() {
                        var u = this.out;
                        if (u === NO) return;
                        if (!this.open && this.inner === NO) u._c();
                    };
                    Flatten.prototype._n = function(s) {
                        var u = this.out;
                        if (u === NO) return;
                        var _a = this,
                            inner = _a.inner,
                            il = _a.il;
                        if (inner !== NO && il !== NO_IL) inner._remove(il);
                        (this.inner = s)._add(
                            (this.il = new FlattenListener(u, this))
                        );
                    };
                    Flatten.prototype._e = function(err) {
                        var u = this.out;
                        if (u === NO) return;
                        u._e(err);
                    };
                    Flatten.prototype._c = function() {
                        this.open = false;
                        this.less();
                    };
                    return Flatten;
                })();
                var Fold = /** @class */ (function() {
                    function Fold(f, seed, ins) {
                        var _this = this;
                        this.type = 'fold';
                        this.ins = ins;
                        this.out = NO;
                        this.f = function(t) {
                            return f(_this.acc, t);
                        };
                        this.acc = this.seed = seed;
                    }
                    Fold.prototype._start = function(out) {
                        this.out = out;
                        this.acc = this.seed;
                        out._n(this.acc);
                        this.ins._add(this);
                    };
                    Fold.prototype._stop = function() {
                        this.ins._remove(this);
                        this.out = NO;
                        this.acc = this.seed;
                    };
                    Fold.prototype._n = function(t) {
                        var u = this.out;
                        if (u === NO) return;
                        var r = _try(this, t, u);
                        if (r === NO) return;
                        u._n((this.acc = r));
                    };
                    Fold.prototype._e = function(err) {
                        var u = this.out;
                        if (u === NO) return;
                        u._e(err);
                    };
                    Fold.prototype._c = function() {
                        var u = this.out;
                        if (u === NO) return;
                        u._c();
                    };
                    return Fold;
                })();
                var Last = /** @class */ (function() {
                    function Last(ins) {
                        this.type = 'last';
                        this.ins = ins;
                        this.out = NO;
                        this.has = false;
                        this.val = NO;
                    }
                    Last.prototype._start = function(out) {
                        this.out = out;
                        this.has = false;
                        this.ins._add(this);
                    };
                    Last.prototype._stop = function() {
                        this.ins._remove(this);
                        this.out = NO;
                        this.val = NO;
                    };
                    Last.prototype._n = function(t) {
                        this.has = true;
                        this.val = t;
                    };
                    Last.prototype._e = function(err) {
                        var u = this.out;
                        if (u === NO) return;
                        u._e(err);
                    };
                    Last.prototype._c = function() {
                        var u = this.out;
                        if (u === NO) return;
                        if (this.has) {
                            u._n(this.val);
                            u._c();
                        } else
                            u._e(
                                new Error(
                                    'last() failed because input stream completed'
                                )
                            );
                    };
                    return Last;
                })();
                var MapOp = /** @class */ (function() {
                    function MapOp(project, ins) {
                        this.type = 'map';
                        this.ins = ins;
                        this.out = NO;
                        this.f = project;
                    }
                    MapOp.prototype._start = function(out) {
                        this.out = out;
                        this.ins._add(this);
                    };
                    MapOp.prototype._stop = function() {
                        this.ins._remove(this);
                        this.out = NO;
                    };
                    MapOp.prototype._n = function(t) {
                        var u = this.out;
                        if (u === NO) return;
                        var r = _try(this, t, u);
                        if (r === NO) return;
                        u._n(r);
                    };
                    MapOp.prototype._e = function(err) {
                        var u = this.out;
                        if (u === NO) return;
                        u._e(err);
                    };
                    MapOp.prototype._c = function() {
                        var u = this.out;
                        if (u === NO) return;
                        u._c();
                    };
                    return MapOp;
                })();
                var Remember = /** @class */ (function() {
                    function Remember(ins) {
                        this.type = 'remember';
                        this.ins = ins;
                        this.out = NO;
                    }
                    Remember.prototype._start = function(out) {
                        this.out = out;
                        this.ins._add(out);
                    };
                    Remember.prototype._stop = function() {
                        this.ins._remove(this.out);
                        this.out = NO;
                    };
                    return Remember;
                })();
                var ReplaceError = /** @class */ (function() {
                    function ReplaceError(replacer, ins) {
                        this.type = 'replaceError';
                        this.ins = ins;
                        this.out = NO;
                        this.f = replacer;
                    }
                    ReplaceError.prototype._start = function(out) {
                        this.out = out;
                        this.ins._add(this);
                    };
                    ReplaceError.prototype._stop = function() {
                        this.ins._remove(this);
                        this.out = NO;
                    };
                    ReplaceError.prototype._n = function(t) {
                        var u = this.out;
                        if (u === NO) return;
                        u._n(t);
                    };
                    ReplaceError.prototype._e = function(err) {
                        var u = this.out;
                        if (u === NO) return;
                        try {
                            this.ins._remove(this);
                            (this.ins = this.f(err))._add(this);
                        } catch (e) {
                            u._e(e);
                        }
                    };
                    ReplaceError.prototype._c = function() {
                        var u = this.out;
                        if (u === NO) return;
                        u._c();
                    };
                    return ReplaceError;
                })();
                var StartWith = /** @class */ (function() {
                    function StartWith(ins, val) {
                        this.type = 'startWith';
                        this.ins = ins;
                        this.out = NO;
                        this.val = val;
                    }
                    StartWith.prototype._start = function(out) {
                        this.out = out;
                        this.out._n(this.val);
                        this.ins._add(out);
                    };
                    StartWith.prototype._stop = function() {
                        this.ins._remove(this.out);
                        this.out = NO;
                    };
                    return StartWith;
                })();
                var Take = /** @class */ (function() {
                    function Take(max, ins) {
                        this.type = 'take';
                        this.ins = ins;
                        this.out = NO;
                        this.max = max;
                        this.taken = 0;
                    }
                    Take.prototype._start = function(out) {
                        this.out = out;
                        this.taken = 0;
                        if (this.max <= 0) out._c();
                        else this.ins._add(this);
                    };
                    Take.prototype._stop = function() {
                        this.ins._remove(this);
                        this.out = NO;
                    };
                    Take.prototype._n = function(t) {
                        var u = this.out;
                        if (u === NO) return;
                        var m = ++this.taken;
                        if (m < this.max) u._n(t);
                        else if (m === this.max) {
                            u._n(t);
                            u._c();
                        }
                    };
                    Take.prototype._e = function(err) {
                        var u = this.out;
                        if (u === NO) return;
                        u._e(err);
                    };
                    Take.prototype._c = function() {
                        var u = this.out;
                        if (u === NO) return;
                        u._c();
                    };
                    return Take;
                })();
                var Stream = /** @class */ (function() {
                    function Stream(producer) {
                        this._prod = producer || NO;
                        this._ils = [];
                        this._stopID = NO;
                        this._dl = NO;
                        this._d = false;
                        this._target = NO;
                        this._err = NO;
                    }
                    Stream.prototype._n = function(t) {
                        var a = this._ils;
                        var L = a.length;
                        if (this._d) this._dl._n(t);
                        if (L == 1) a[0]._n(t);
                        else if (L == 0) return;
                        else {
                            var b = cp(a);
                            for (var i = 0; i < L; i++) b[i]._n(t);
                        }
                    };
                    Stream.prototype._e = function(err) {
                        if (this._err !== NO) return;
                        this._err = err;
                        var a = this._ils;
                        var L = a.length;
                        this._x();
                        if (this._d) this._dl._e(err);
                        if (L == 1) a[0]._e(err);
                        else if (L == 0) return;
                        else {
                            var b = cp(a);
                            for (var i = 0; i < L; i++) b[i]._e(err);
                        }
                        if (!this._d && L == 0) throw this._err;
                    };
                    Stream.prototype._c = function() {
                        var a = this._ils;
                        var L = a.length;
                        this._x();
                        if (this._d) this._dl._c();
                        if (L == 1) a[0]._c();
                        else if (L == 0) return;
                        else {
                            var b = cp(a);
                            for (var i = 0; i < L; i++) b[i]._c();
                        }
                    };
                    Stream.prototype._x = function() {
                        if (this._ils.length === 0) return;
                        if (this._prod !== NO) this._prod._stop();
                        this._err = NO;
                        this._ils = [];
                    };
                    Stream.prototype._stopNow = function() {
                        // WARNING: code that calls this method should
                        // first check if this._prod is valid (not `NO`)
                        this._prod._stop();
                        this._err = NO;
                        this._stopID = NO;
                    };
                    Stream.prototype._add = function(il) {
                        var ta = this._target;
                        if (ta !== NO) return ta._add(il);
                        var a = this._ils;
                        a.push(il);
                        if (a.length > 1) return;
                        if (this._stopID !== NO) {
                            clearTimeout(this._stopID);
                            this._stopID = NO;
                        } else {
                            var p = this._prod;
                            if (p !== NO) p._start(this);
                        }
                    };
                    Stream.prototype._remove = function(il) {
                        var _this = this;
                        var ta = this._target;
                        if (ta !== NO) return ta._remove(il);
                        var a = this._ils;
                        var i = a.indexOf(il);
                        if (i > -1) {
                            a.splice(i, 1);
                            if (this._prod !== NO && a.length <= 0) {
                                this._err = NO;
                                this._stopID = setTimeout(function() {
                                    return _this._stopNow();
                                });
                            } else if (a.length === 1) {
                                this._pruneCycles();
                            }
                        }
                    };
                    // If all paths stemming from `this` stream eventually end at `this`
                    // stream, then we remove the single listener of `this` stream, to
                    // force it to end its execution and dispose resources. This method
                    // assumes as a precondition that this._ils has just one listener.
                    Stream.prototype._pruneCycles = function() {
                        if (this._hasNoSinks(this, []))
                            this._remove(this._ils[0]);
                    };
                    // Checks whether *there is no* path starting from `x` that leads to an end
                    // listener (sink) in the stream graph, following edges A->B where B is a
                    // listener of A. This means these paths constitute a cycle somehow. Is given
                    // a trace of all visited nodes so far.
                    Stream.prototype._hasNoSinks = function(x, trace) {
                        if (trace.indexOf(x) !== -1) return true;
                        else if (x.out === this) return true;
                        else if (x.out && x.out !== NO)
                            return this._hasNoSinks(x.out, trace.concat(x));
                        else if (x._ils) {
                            for (var i = 0, N = x._ils.length; i < N; i++)
                                if (
                                    !this._hasNoSinks(
                                        x._ils[i],
                                        trace.concat(x)
                                    )
                                )
                                    return false;
                            return true;
                        } else return false;
                    };
                    Stream.prototype.ctor = function() {
                        return this instanceof MemoryStream
                            ? MemoryStream
                            : Stream;
                    };
                    /**
     * Adds a Listener to the Stream.
     *
     * @param {Listener} listener
     */
                    Stream.prototype.addListener = function(listener) {
                        listener._n = listener.next || noop;
                        listener._e = listener.error || noop;
                        listener._c = listener.complete || noop;
                        this._add(listener);
                    };
                    /**
     * Removes a Listener from the Stream, assuming the Listener was added to it.
     *
     * @param {Listener<T>} listener
     */
                    Stream.prototype.removeListener = function(listener) {
                        this._remove(listener);
                    };
                    /**
     * Adds a Listener to the Stream returning a Subscription to remove that
     * listener.
     *
     * @param {Listener} listener
     * @returns {Subscription}
     */
                    Stream.prototype.subscribe = function(listener) {
                        this.addListener(listener);
                        return new StreamSub(this, listener);
                    };
                    /**
     * Add interop between most.js and RxJS 5
     *
     * @returns {Stream}
     */
                    Stream.prototype[symbol_observable_1.default] = function() {
                        return this;
                    };
                    /**
     * Creates a new Stream given a Producer.
     *
     * @factory true
     * @param {Producer} producer An optional Producer that dictates how to
     * start, generate events, and stop the Stream.
     * @return {Stream}
     */
                    Stream.create = function(producer) {
                        if (producer) {
                            if (
                                typeof producer.start !== 'function' ||
                                typeof producer.stop !== 'function'
                            )
                                throw new Error(
                                    'producer requires both start and stop functions'
                                );
                            internalizeProducer(producer); // mutates the input
                        }
                        return new Stream(producer);
                    };
                    /**
     * Creates a new MemoryStream given a Producer.
     *
     * @factory true
     * @param {Producer} producer An optional Producer that dictates how to
     * start, generate events, and stop the Stream.
     * @return {MemoryStream}
     */
                    Stream.createWithMemory = function(producer) {
                        if (producer) internalizeProducer(producer); // mutates the input
                        return new MemoryStream(producer);
                    };
                    /**
     * Creates a Stream that does nothing when started. It never emits any event.
     *
     * Marble diagram:
     *
     * ```text
     *          never
     * -----------------------
     * ```
     *
     * @factory true
     * @return {Stream}
     */
                    Stream.never = function() {
                        return new Stream({ _start: noop, _stop: noop });
                    };
                    /**
     * Creates a Stream that immediately emits the "complete" notification when
     * started, and that's it.
     *
     * Marble diagram:
     *
     * ```text
     * empty
     * -|
     * ```
     *
     * @factory true
     * @return {Stream}
     */
                    Stream.empty = function() {
                        return new Stream({
                            _start: function(il) {
                                il._c();
                            },
                            _stop: noop
                        });
                    };
                    /**
     * Creates a Stream that immediately emits an "error" notification with the
     * value you passed as the `error` argument when the stream starts, and that's
     * it.
     *
     * Marble diagram:
     *
     * ```text
     * throw(X)
     * -X
     * ```
     *
     * @factory true
     * @param error The error event to emit on the created stream.
     * @return {Stream}
     */
                    Stream.throw = function(error) {
                        return new Stream({
                            _start: function(il) {
                                il._e(error);
                            },
                            _stop: noop
                        });
                    };
                    /**
     * Creates a stream from an Array, Promise, or an Observable.
     *
     * @factory true
     * @param {Array|PromiseLike|Observable} input The input to make a stream from.
     * @return {Stream}
     */
                    Stream.from = function(input) {
                        if (
                            typeof input[symbol_observable_1.default] ===
                            'function'
                        )
                            return Stream.fromObservable(input);
                        else if (typeof input.then === 'function')
                            return Stream.fromPromise(input);
                        else if (Array.isArray(input))
                            return Stream.fromArray(input);
                        throw new TypeError(
                            'Type of input to from() must be an Array, Promise, or Observable'
                        );
                    };
                    /**
     * Creates a Stream that immediately emits the arguments that you give to
     * *of*, then completes.
     *
     * Marble diagram:
     *
     * ```text
     * of(1,2,3)
     * 123|
     * ```
     *
     * @factory true
     * @param a The first value you want to emit as an event on the stream.
     * @param b The second value you want to emit as an event on the stream. One
     * or more of these values may be given as arguments.
     * @return {Stream}
     */
                    Stream.of = function() {
                        var items = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            items[_i] = arguments[_i];
                        }
                        return Stream.fromArray(items);
                    };
                    /**
     * Converts an array to a stream. The returned stream will emit synchronously
     * all the items in the array, and then complete.
     *
     * Marble diagram:
     *
     * ```text
     * fromArray([1,2,3])
     * 123|
     * ```
     *
     * @factory true
     * @param {Array} array The array to be converted as a stream.
     * @return {Stream}
     */
                    Stream.fromArray = function(array) {
                        return new Stream(new FromArray(array));
                    };
                    /**
     * Converts a promise to a stream. The returned stream will emit the resolved
     * value of the promise, and then complete. However, if the promise is
     * rejected, the stream will emit the corresponding error.
     *
     * Marble diagram:
     *
     * ```text
     * fromPromise( ----42 )
     * -----------------42|
     * ```
     *
     * @factory true
     * @param {PromiseLike} promise The promise to be converted as a stream.
     * @return {Stream}
     */
                    Stream.fromPromise = function(promise) {
                        return new Stream(new FromPromise(promise));
                    };
                    /**
     * Converts an Observable into a Stream.
     *
     * @factory true
     * @param {any} observable The observable to be converted as a stream.
     * @return {Stream}
     */
                    Stream.fromObservable = function(obs) {
                        if (obs.endWhen) return obs;
                        return new Stream(new FromObservable(obs));
                    };
                    /**
     * Creates a stream that periodically emits incremental numbers, every
     * `period` milliseconds.
     *
     * Marble diagram:
     *
     * ```text
     *     periodic(1000)
     * ---0---1---2---3---4---...
     * ```
     *
     * @factory true
     * @param {number} period The interval in milliseconds to use as a rate of
     * emission.
     * @return {Stream}
     */
                    Stream.periodic = function(period) {
                        return new Stream(new Periodic(period));
                    };
                    Stream.prototype._map = function(project) {
                        return new (this.ctor())(new MapOp(project, this));
                    };
                    /**
     * Transforms each event from the input Stream through a `project` function,
     * to get a Stream that emits those transformed events.
     *
     * Marble diagram:
     *
     * ```text
     * --1---3--5-----7------
     *    map(i => i * 10)
     * --10--30-50----70-----
     * ```
     *
     * @param {Function} project A function of type `(t: T) => U` that takes event
     * `t` of type `T` from the input Stream and produces an event of type `U`, to
     * be emitted on the output Stream.
     * @return {Stream}
     */
                    Stream.prototype.map = function(project) {
                        return this._map(project);
                    };
                    /**
     * It's like `map`, but transforms each input event to always the same
     * constant value on the output Stream.
     *
     * Marble diagram:
     *
     * ```text
     * --1---3--5-----7-----
     *       mapTo(10)
     * --10--10-10----10----
     * ```
     *
     * @param projectedValue A value to emit on the output Stream whenever the
     * input Stream emits any value.
     * @return {Stream}
     */
                    Stream.prototype.mapTo = function(projectedValue) {
                        var s = this.map(function() {
                            return projectedValue;
                        });
                        var op = s._prod;
                        op.type = 'mapTo';
                        return s;
                    };
                    /**
     * Only allows events that pass the test given by the `passes` argument.
     *
     * Each event from the input stream is given to the `passes` function. If the
     * function returns `true`, the event is forwarded to the output stream,
     * otherwise it is ignored and not forwarded.
     *
     * Marble diagram:
     *
     * ```text
     * --1---2--3-----4-----5---6--7-8--
     *     filter(i => i % 2 === 0)
     * ------2--------4---------6----8--
     * ```
     *
     * @param {Function} passes A function of type `(t: T) => boolean` that takes
     * an event from the input stream and checks if it passes, by returning a
     * boolean.
     * @return {Stream}
     */
                    Stream.prototype.filter = function(passes) {
                        var p = this._prod;
                        if (p instanceof Filter)
                            return new Stream(
                                new Filter(and(p.f, passes), p.ins)
                            );
                        return new Stream(new Filter(passes, this));
                    };
                    /**
     * Lets the first `amount` many events from the input stream pass to the
     * output stream, then makes the output stream complete.
     *
     * Marble diagram:
     *
     * ```text
     * --a---b--c----d---e--
     *    take(3)
     * --a---b--c|
     * ```
     *
     * @param {number} amount How many events to allow from the input stream
     * before completing the output stream.
     * @return {Stream}
     */
                    Stream.prototype.take = function(amount) {
                        return new (this.ctor())(new Take(amount, this));
                    };
                    /**
     * Ignores the first `amount` many events from the input stream, and then
     * after that starts forwarding events from the input stream to the output
     * stream.
     *
     * Marble diagram:
     *
     * ```text
     * --a---b--c----d---e--
     *       drop(3)
     * --------------d---e--
     * ```
     *
     * @param {number} amount How many events to ignore from the input stream
     * before forwarding all events from the input stream to the output stream.
     * @return {Stream}
     */
                    Stream.prototype.drop = function(amount) {
                        return new Stream(new Drop(amount, this));
                    };
                    /**
     * When the input stream completes, the output stream will emit the last event
     * emitted by the input stream, and then will also complete.
     *
     * Marble diagram:
     *
     * ```text
     * --a---b--c--d----|
     *       last()
     * -----------------d|
     * ```
     *
     * @return {Stream}
     */
                    Stream.prototype.last = function() {
                        return new Stream(new Last(this));
                    };
                    /**
     * Prepends the given `initial` value to the sequence of events emitted by the
     * input stream. The returned stream is a MemoryStream, which means it is
     * already `remember()`'d.
     *
     * Marble diagram:
     *
     * ```text
     * ---1---2-----3---
     *   startWith(0)
     * 0--1---2-----3---
     * ```
     *
     * @param initial The value or event to prepend.
     * @return {MemoryStream}
     */
                    Stream.prototype.startWith = function(initial) {
                        return new MemoryStream(new StartWith(this, initial));
                    };
                    /**
     * Uses another stream to determine when to complete the current stream.
     *
     * When the given `other` stream emits an event or completes, the output
     * stream will complete. Before that happens, the output stream will behaves
     * like the input stream.
     *
     * Marble diagram:
     *
     * ```text
     * ---1---2-----3--4----5----6---
     *   endWhen( --------a--b--| )
     * ---1---2-----3--4--|
     * ```
     *
     * @param other Some other stream that is used to know when should the output
     * stream of this operator complete.
     * @return {Stream}
     */
                    Stream.prototype.endWhen = function(other) {
                        return new (this.ctor())(new EndWhen(other, this));
                    };
                    /**
     * "Folds" the stream onto itself.
     *
     * Combines events from the past throughout
     * the entire execution of the input stream, allowing you to accumulate them
     * together. It's essentially like `Array.prototype.reduce`. The returned
     * stream is a MemoryStream, which means it is already `remember()`'d.
     *
     * The output stream starts by emitting the `seed` which you give as argument.
     * Then, when an event happens on the input stream, it is combined with that
     * seed value through the `accumulate` function, and the output value is
     * emitted on the output stream. `fold` remembers that output value as `acc`
     * ("accumulator"), and then when a new input event `t` happens, `acc` will be
     * combined with that to produce the new `acc` and so forth.
     *
     * Marble diagram:
     *
     * ```text
     * ------1-----1--2----1----1------
     *   fold((acc, x) => acc + x, 3)
     * 3-----4-----5--7----8----9------
     * ```
     *
     * @param {Function} accumulate A function of type `(acc: R, t: T) => R` that
     * takes the previous accumulated value `acc` and the incoming event from the
     * input stream and produces the new accumulated value.
     * @param seed The initial accumulated value, of type `R`.
     * @return {MemoryStream}
     */
                    Stream.prototype.fold = function(accumulate, seed) {
                        return new MemoryStream(
                            new Fold(accumulate, seed, this)
                        );
                    };
                    /**
     * Replaces an error with another stream.
     *
     * When (and if) an error happens on the input stream, instead of forwarding
     * that error to the output stream, *replaceError* will call the `replace`
     * function which returns the stream that the output stream will replicate.
     * And, in case that new stream also emits an error, `replace` will be called
     * again to get another stream to start replicating.
     *
     * Marble diagram:
     *
     * ```text
     * --1---2-----3--4-----X
     *   replaceError( () => --10--| )
     * --1---2-----3--4--------10--|
     * ```
     *
     * @param {Function} replace A function of type `(err) => Stream` that takes
     * the error that occurred on the input stream or on the previous replacement
     * stream and returns a new stream. The output stream will behave like the
     * stream that this function returns.
     * @return {Stream}
     */
                    Stream.prototype.replaceError = function(replace) {
                        return new (this.ctor())(
                            new ReplaceError(replace, this)
                        );
                    };
                    /**
     * Flattens a "stream of streams", handling only one nested stream at a time
     * (no concurrency).
     *
     * If the input stream is a stream that emits streams, then this operator will
     * return an output stream which is a flat stream: emits regular events. The
     * flattening happens without concurrency. It works like this: when the input
     * stream emits a nested stream, *flatten* will start imitating that nested
     * one. However, as soon as the next nested stream is emitted on the input
     * stream, *flatten* will forget the previous nested one it was imitating, and
     * will start imitating the new nested one.
     *
     * Marble diagram:
     *
     * ```text
     * --+--------+---------------
     *   \        \
     *    \       ----1----2---3--
     *    --a--b----c----d--------
     *           flatten
     * -----a--b------1----2---3--
     * ```
     *
     * @return {Stream}
     */
                    Stream.prototype.flatten = function() {
                        var p = this._prod;
                        return new Stream(new Flatten(this));
                    };
                    /**
     * Passes the input stream to a custom operator, to produce an output stream.
     *
     * *compose* is a handy way of using an existing function in a chained style.
     * Instead of writing `outStream = f(inStream)` you can write
     * `outStream = inStream.compose(f)`.
     *
     * @param {function} operator A function that takes a stream as input and
     * returns a stream as well.
     * @return {Stream}
     */
                    Stream.prototype.compose = function(operator) {
                        return operator(this);
                    };
                    /**
     * Returns an output stream that behaves like the input stream, but also
     * remembers the most recent event that happens on the input stream, so that a
     * newly added listener will immediately receive that memorised event.
     *
     * @return {MemoryStream}
     */
                    Stream.prototype.remember = function() {
                        return new MemoryStream(new Remember(this));
                    };
                    /**
     * Returns an output stream that identically behaves like the input stream,
     * but also runs a `spy` function for each event, to help you debug your app.
     *
     * *debug* takes a `spy` function as argument, and runs that for each event
     * happening on the input stream. If you don't provide the `spy` argument,
     * then *debug* will just `console.log` each event. This helps you to
     * understand the flow of events through some operator chain.
     *
     * Please note that if the output stream has no listeners, then it will not
     * start, which means `spy` will never run because no actual event happens in
     * that case.
     *
     * Marble diagram:
     *
     * ```text
     * --1----2-----3-----4--
     *         debug
     * --1----2-----3-----4--
     * ```
     *
     * @param {function} labelOrSpy A string to use as the label when printing
     * debug information on the console, or a 'spy' function that takes an event
     * as argument, and does not need to return anything.
     * @return {Stream}
     */
                    Stream.prototype.debug = function(labelOrSpy) {
                        return new (this.ctor())(new Debug(this, labelOrSpy));
                    };
                    /**
     * *imitate* changes this current Stream to emit the same events that the
     * `other` given Stream does. This method returns nothing.
     *
     * This method exists to allow one thing: **circular dependency of streams**.
     * For instance, let's imagine that for some reason you need to create a
     * circular dependency where stream `first$` depends on stream `second$`
     * which in turn depends on `first$`:
     *
     * <!-- skip-example -->
     * ```js
     * import delay from 'xstream/extra/delay'
     *
     * var first$ = second$.map(x => x * 10).take(3);
     * var second$ = first$.map(x => x + 1).startWith(1).compose(delay(100));
     * ```
     *
     * However, that is invalid JavaScript, because `second$` is undefined
     * on the first line. This is how *imitate* can help solve it:
     *
     * ```js
     * import delay from 'xstream/extra/delay'
     *
     * var secondProxy$ = xs.create();
     * var first$ = secondProxy$.map(x => x * 10).take(3);
     * var second$ = first$.map(x => x + 1).startWith(1).compose(delay(100));
     * secondProxy$.imitate(second$);
     * ```
     *
     * We create `secondProxy$` before the others, so it can be used in the
     * declaration of `first$`. Then, after both `first$` and `second$` are
     * defined, we hook `secondProxy$` with `second$` with `imitate()` to tell
     * that they are "the same". `imitate` will not trigger the start of any
     * stream, it just binds `secondProxy$` and `second$` together.
     *
     * The following is an example where `imitate()` is important in Cycle.js
     * applications. A parent component contains some child components. A child
     * has an action stream which is given to the parent to define its state:
     *
     * <!-- skip-example -->
     * ```js
     * const childActionProxy$ = xs.create();
     * const parent = Parent({...sources, childAction$: childActionProxy$});
     * const childAction$ = parent.state$.map(s => s.child.action$).flatten();
     * childActionProxy$.imitate(childAction$);
     * ```
     *
     * Note, though, that **`imitate()` does not support MemoryStreams**. If we
     * would attempt to imitate a MemoryStream in a circular dependency, we would
     * either get a race condition (where the symptom would be "nothing happens")
     * or an infinite cyclic emission of values. It's useful to think about
     * MemoryStreams as cells in a spreadsheet. It doesn't make any sense to
     * define a spreadsheet cell `A1` with a formula that depends on `B1` and
     * cell `B1` defined with a formula that depends on `A1`.
     *
     * If you find yourself wanting to use `imitate()` with a
     * MemoryStream, you should rework your code around `imitate()` to use a
     * Stream instead. Look for the stream in the circular dependency that
     * represents an event stream, and that would be a candidate for creating a
     * proxy Stream which then imitates the target Stream.
     *
     * @param {Stream} target The other stream to imitate on the current one. Must
     * not be a MemoryStream.
     */
                    Stream.prototype.imitate = function(target) {
                        if (target instanceof MemoryStream)
                            throw new Error(
                                'A MemoryStream was given to imitate(), but it only ' +
                                    'supports a Stream. Read more about this restriction here: ' +
                                    'https://github.com/staltz/xstream#faq'
                            );
                        this._target = target;
                        for (
                            var ils = this._ils, N = ils.length, i = 0;
                            i < N;
                            i++
                        )
                            target._add(ils[i]);
                        this._ils = [];
                    };
                    /**
     * Forces the Stream to emit the given value to its listeners.
     *
     * As the name indicates, if you use this, you are most likely doing something
     * The Wrong Way. Please try to understand the reactive way before using this
     * method. Use it only when you know what you are doing.
     *
     * @param value The "next" value you want to broadcast to all listeners of
     * this Stream.
     */
                    Stream.prototype.shamefullySendNext = function(value) {
                        this._n(value);
                    };
                    /**
     * Forces the Stream to emit the given error to its listeners.
     *
     * As the name indicates, if you use this, you are most likely doing something
     * The Wrong Way. Please try to understand the reactive way before using this
     * method. Use it only when you know what you are doing.
     *
     * @param {any} error The error you want to broadcast to all the listeners of
     * this Stream.
     */
                    Stream.prototype.shamefullySendError = function(error) {
                        this._e(error);
                    };
                    /**
     * Forces the Stream to emit the "completed" event to its listeners.
     *
     * As the name indicates, if you use this, you are most likely doing something
     * The Wrong Way. Please try to understand the reactive way before using this
     * method. Use it only when you know what you are doing.
     */
                    Stream.prototype.shamefullySendComplete = function() {
                        this._c();
                    };
                    /**
     * Adds a "debug" listener to the stream. There can only be one debug
     * listener, that's why this is 'setDebugListener'. To remove the debug
     * listener, just call setDebugListener(null).
     *
     * A debug listener is like any other listener. The only difference is that a
     * debug listener is "stealthy": its presence/absence does not trigger the
     * start/stop of the stream (or the producer inside the stream). This is
     * useful so you can inspect what is going on without changing the behavior
     * of the program. If you have an idle stream and you add a normal listener to
     * it, the stream will start executing. But if you set a debug listener on an
     * idle stream, it won't start executing (not until the first normal listener
     * is added).
     *
     * As the name indicates, we don't recommend using this method to build app
     * logic. In fact, in most cases the debug operator works just fine. Only use
     * this one if you know what you're doing.
     *
     * @param {Listener<T>} listener
     */
                    Stream.prototype.setDebugListener = function(listener) {
                        if (!listener) {
                            this._d = false;
                            this._dl = NO;
                        } else {
                            this._d = true;
                            listener._n = listener.next || noop;
                            listener._e = listener.error || noop;
                            listener._c = listener.complete || noop;
                            this._dl = listener;
                        }
                    };
                    /**
     * Blends multiple streams together, emitting events from all of them
     * concurrently.
     *
     * *merge* takes multiple streams as arguments, and creates a stream that
     * behaves like each of the argument streams, in parallel.
     *
     * Marble diagram:
     *
     * ```text
     * --1----2-----3--------4---
     * ----a-----b----c---d------
     *            merge
     * --1-a--2--b--3-c---d--4---
     * ```
     *
     * @factory true
     * @param {Stream} stream1 A stream to merge together with other streams.
     * @param {Stream} stream2 A stream to merge together with other streams. Two
     * or more streams may be given as arguments.
     * @return {Stream}
     */
                    Stream.merge = function merge() {
                        var streams = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            streams[_i] = arguments[_i];
                        }
                        return new Stream(new Merge(streams));
                    };
                    /**
     * Combines multiple input streams together to return a stream whose events
     * are arrays that collect the latest events from each input stream.
     *
     * *combine* internally remembers the most recent event from each of the input
     * streams. When any of the input streams emits an event, that event together
     * with all the other saved events are combined into an array. That array will
     * be emitted on the output stream. It's essentially a way of joining together
     * the events from multiple streams.
     *
     * Marble diagram:
     *
     * ```text
     * --1----2-----3--------4---
     * ----a-----b-----c--d------
     *          combine
     * ----1a-2a-2b-3b-3c-3d-4d--
     * ```
     *
     * @factory true
     * @param {Stream} stream1 A stream to combine together with other streams.
     * @param {Stream} stream2 A stream to combine together with other streams.
     * Multiple streams, not just two, may be given as arguments.
     * @return {Stream}
     */
                    Stream.combine = function combine() {
                        var streams = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            streams[_i] = arguments[_i];
                        }
                        return new Stream(new Combine(streams));
                    };
                    return Stream;
                })();
                exports.Stream = Stream;
                var MemoryStream = /** @class */ (function(_super) {
                    __extends(MemoryStream, _super);
                    function MemoryStream(producer) {
                        var _this = _super.call(this, producer) || this;
                        _this._has = false;
                        return _this;
                    }
                    MemoryStream.prototype._n = function(x) {
                        this._v = x;
                        this._has = true;
                        _super.prototype._n.call(this, x);
                    };
                    MemoryStream.prototype._add = function(il) {
                        var ta = this._target;
                        if (ta !== NO) return ta._add(il);
                        var a = this._ils;
                        a.push(il);
                        if (a.length > 1) {
                            if (this._has) il._n(this._v);
                            return;
                        }
                        if (this._stopID !== NO) {
                            if (this._has) il._n(this._v);
                            clearTimeout(this._stopID);
                            this._stopID = NO;
                        } else if (this._has) il._n(this._v);
                        else {
                            var p = this._prod;
                            if (p !== NO) p._start(this);
                        }
                    };
                    MemoryStream.prototype._stopNow = function() {
                        this._has = false;
                        _super.prototype._stopNow.call(this);
                    };
                    MemoryStream.prototype._x = function() {
                        this._has = false;
                        _super.prototype._x.call(this);
                    };
                    MemoryStream.prototype.map = function(project) {
                        return this._map(project);
                    };
                    MemoryStream.prototype.mapTo = function(projectedValue) {
                        return _super.prototype.mapTo.call(
                            this,
                            projectedValue
                        );
                    };
                    MemoryStream.prototype.take = function(amount) {
                        return _super.prototype.take.call(this, amount);
                    };
                    MemoryStream.prototype.endWhen = function(other) {
                        return _super.prototype.endWhen.call(this, other);
                    };
                    MemoryStream.prototype.replaceError = function(replace) {
                        return _super.prototype.replaceError.call(
                            this,
                            replace
                        );
                    };
                    MemoryStream.prototype.remember = function() {
                        return this;
                    };
                    MemoryStream.prototype.debug = function(labelOrSpy) {
                        return _super.prototype.debug.call(this, labelOrSpy);
                    };
                    return MemoryStream;
                })(Stream);
                exports.MemoryStream = MemoryStream;
                exports.default = Stream;
            },
            { 'symbol-observable': 140 }
        ]
    },
    {},
    [1]
);
