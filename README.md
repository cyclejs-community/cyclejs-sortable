# cyclejs-sortable
Makes all children of a selected component sortable

Full documentation: https://supermanitu.github.io/cyclejs-sortable/

##Required Polyfills
The code uses a few ES6 features, so you might need an es6 polyfill like `babel-polyfill`

The use the code in IE you have to add a CustomEvent constructor polyfill like https://www.npmjs.com/package/custom-event

## Usage

```
function main(sources)
{
    return {
        DOM: xs.of(div([
            div(['one']),
            div(['two']),
            div(['three']),
            div(['four'])
        ]))
        .compose(makeSortable(DOM))
    }
}
```

## Options

`restrictMovementArea`: A selector that defines the area in which the children can be dragged

`handle`: A sector to define a handle for moving the items

`ghostClass`: A classname to be applied to the ghost
