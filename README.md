# NPM addcomp.js

- [Usage](#usage)
- [Quick Guide](#quick-guide)
- [Using The Command Line](#using-the-command-line)
  - [Passing Component Name](#passing-component-name)
  - [Options](#options)
    - [Negating flags](#negating-flags)
- [Override Default Configurations \(addcomp.config.js\)](#override-defualt-configurations-addcompconfigjs)
  - [File structure](#file-structure)
  - [Options](#options-1)
  - [Conflicts](#conflicts)

## Usage

```bash
npx addcomp <...tokens> [options]
```

## Quick Guide
```
Usage: index [options] <tokens...>

Arguments:
  tokens                          component name

Options:
  -s, --add-css                   Create a CSS file
  -no-s, --no-add-css

  -m, --css-as-module             Create css file as a .module.css file
  -no-m, --no-css-as-module

  -i --create-index               Create the component's index.js file
  -no-i, --no-create-index

  -c --add-children-props         Deconstruct children from component's props
  -no-c, --no-add-children-props

  -u --add-use-client             Add "use clinet" directive to component
  -no-u, --no-add-use-client

  -l --use-inline-export          Export component function with declaration
  -no-l, --no-use-inline-export

  -x --add-x                      Append x to component file extension
  -no-x, --no-add-x

  -n --css-name [name]            CSS file name (preset: "COMPONENT_NAME")
  -e --file-ext <ext>             Component file extension
  -h, --help                      display help for command
```

e.g.
```
npx addcomp button group grid -s -no-m -e ts -x
```

changes in project structure
```
.
├── src/
│   └── components/
│       └── ButtonGroupGird/
│           ├── ButtonGroupGird.tsx
│           ├── buttonGroupGird.css
│           └── index.js
├── index.js
└── package.json
```

ButtonGroupGird.tsx
```ts
import React from 'react';
import styles from "buttonGroupGird.css"

function ButtonGroupGird({}) {
  return (
    <div>
      <div>ButtonGroupGird</div>
    </div>
  );
}

export default ButtonGroupGird;
```

index.js
```js
export * from './ButtonGroupGird.tsx'
export { default } from './ButtonGroupGird.tsx'
```

## Using The Command Line

The command line is used to pass the compoent name, as well as, options to customize the creation of the component and its files.

### Passing Component Name

You can pass the component name as a single string or a space seperated word which would automatically be formated.

e.g
```
npx addcomp button group grid
```

This will generate a component with the name `ButtonGroupGrid`.


> note
> 
> Based on how the command line parser works, any value that is not a flag, or a flag parameter is considerend a an argument for the component name
> 
> `npx addcomp button -s group -x -n grid`  =>  ButtonGroup

### Options

| Description                                           | Short Flag | Long Flag              |
|-------------------------------------------------------|------------|------------------------|
| Create a CSS file                                     | -s         | --add-css              |
|                                                       | -no-s      | --no-add-css           |
| Create CSS file as a .module.css file                 | -m         | --css-as-module        |
|                                                       | -no-m      | --no-css-as-module     |
| Create the component's index.js file                  | -i         | --create-index         |
|                                                       | -no-i      | --no-create-index      |
| Deconstruct children from component's props           | -c         | --add-children-props   |
|                                                       | -no-c      | --no-add-children-props|
| Add "use client" directive to component               | -u         | --add-use-client       |
|                                                       | -no-u      | --no-add-use-client    |
| Export component function with declaration            | -l         | --use-inline-export    |
|                                                       | -no-l      | --no-use-inline-export |
| Append x to component file extension                  | -x         | --add-x                |
|                                                       | -no-x      | --no-add-x             |
| CSS file name (preset: "COMPONENT_NAME")              | -n         | --css-name [name]      |
| Component file extension                              | -e         | --file-ext <ext>       |
| Display help for command                              | -h         | --help                 |

#### Negating flags

To negate an option, you can prefix its flag with `no-`.

e.g.
```
-no-s --no-create-index ...
```

## Override Defualt Configurations (addcomp.config.js)

It is also possible to have a `addcomp.config.js` file in project root to override the default options.

### File structure

```js
const configs = {
  CREATE_CSS_FILE: undefined,
  CREATE_CSS_FILE_AS_MODULE: undefined,
  CREATE_COMPONENT_INDEX: undefined,
  ADD_CHILDREN_PROPS: undefined,
  ADD_USE_CLIENT_DIRECTIVE: undefined,
  USE_INLINE_EXPORT: undefined,
  ADD_X_TO_EXTENSION: undefined,
  CSS_FILE_NAME: undefined,
  COMPONENT_FILE_EXTENSION: undefined,
};

export default configs;
```

### Options

| Description                                              | Option                     | Default         | Flag                         |
|----------------------------------------------------------|----------------------------|-----------------|------------------------------|
| Create a CSS file                                        | CREATE_CSS_FILE            | true            | -s, --add-css                |
| Create css file as a .module.css file                    | CREATE_CSS_FILE_AS_MODULE  | true            | -m, --css-as-module          |
| Create the component's index.js file                     | CREATE_COMPONENT_INDEX     | true            | -i, --create-index           |
| Deconstruct children from component's props              | ADD_CHILDREN_PROPS         | false           | -c, --add-children-props     |
| Add "use client" directive to component                  | ADD_USE_CLIENT_DIRECTIVE   | false           | -u, --add-use-client         |
| Export component function with declaration               | USE_INLINE_EXPORT          | false           | -l, --use-inline-export      |
| Append x to component file extension                     | ADD_X_TO_EXTENSION         | false           | -x, --add-x                  |
| CSS file name                                            | CSS_FILE_NAME              | COMPONENT_NAME  | -n, --css-name [name]        |
| Component file extension                                 | COMPONENT_FILE_EXTENSION   | js              | -e, --file-ext <ext>         |


### Conflicts

If there is a conflict between the local `.confg` file and the CLI options, i.e. the same option has two different values in both, then always the CLI option takes priority over the `.config` file option.

e.g.

```
npx addcompt --no-add-css
```

```js
const configs = {
  CREATE_CSS_FILE: true
};

export default configs;
```

Then, `CREATE_CSS_FILE` be resolved to `false`, since the CLI has more priority.
