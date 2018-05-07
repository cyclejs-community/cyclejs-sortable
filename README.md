# cyclejs-sortable
Makes all children of a selected component sortable

Github Repo: https://github.com/cyclejs-community/cyclejs-sortable

Full documentation: https://cyclejs-community.github.io/cyclejs-sortable/

NPM: https://www.npmjs.com/package/cyclejs-sortable

## Examples

You can check out live versions of the [examples](./examples/) here:
- [simple](./examples/simple/src/index.ts): https://cyclejs-community.github.io/cyclejs-sortable/examples/simple/
- [horizontal](./examples/horizontal/src/index.ts): https://cyclejs-community.github.io/cyclejs-sortable/examples/horizontal/

## Installation

`npm install --save cyclejs-sortable`

## Basic Usage
For more information see the [examples](https://github.com/SuperManitu/cyclejs-sortable/tree/master/examples)

```
const main = isolate(
    makeSortable(Component, { itemSelector: 'div > div' }),
    'myScope'
);

function Component(sources)
{
    return {
        DOM: xs.of(div([
            div(['one']),
            div(['two']),
            div(['three']),
            div(['four'])
        ]));
    }
}
```
