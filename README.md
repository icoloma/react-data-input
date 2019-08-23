A library to automatically bind React form elements to state attributes, automatically doing type conversion and validation. [Give it a try](https://koliseoapi.github.io/react-data-input/).

```JavaScript
import { Form, Input, TextArea } from 'react-data-input';

const state = { username: 'Foo', age: 20 };

function save() {
  fetch('save', {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: state
  });
}

function foo(props) {
  return (
    <form onSubmit={save} state={state}>
      <Input type="text" name="username" required maxLength="100" />
      <Input type="number" name="age" min="0" step="1" />
    </form>
  );
});
```

When any of these fields is modified the change will be propagated into `state[props.name]`, transforming into the corresponding type (number, date, boolean). The enclosing `Form` will check that all validations have passed before triggering `onSubmit`.

The list of exported components includes Form, Input (`text`, `number`, `checkbox` and `radio`), TextArea and Select. Radio buttons require a `RadioGroup` ancestor to handle exclusive `checked` state.

## Conversions

Each field will automatically convert values from string to the desired format.

- `text`, `url`, `email`.

```JavaScript
<Input type="text" name="name" />
<TextArea name="description" />
```

- `number` will be converted to int or float depending on the value of `step` (default is `1`):

```JavaScript
<Input type="number" name="age" />
<Input type="number" name="percentage" step="0.01" />
```

- `checkbox` will also work out of the box:

```JavaScript
<Input type="checkbox" name="subscribed" />
```

The default converter can be overriden by a custom implementation:

```JavaScript
const AllowedValues = { one: instanceOne, two: instanceTwo };
const state = { defcon: AllowedValues.one }
const myConverter =

    // transform from String to Object
    toObject: function(value) {
      return AllowedValues[value] || AllowedValues.one;
    },

    // transform from object to String
    toString: function(value) {
      const key = Object.keys(AllowedValues).find((key) => AllowedValues[key] === value);
      return key || 'one';
    }

};

<Input type="text" name="defcon" converter={myConverter} state={state}/>
```

## Validations

The following validations are supported:

- `[required]`
- `[pattern]`
- `[type=number][min]`
- `[type=number][max]`
- `[type=email]`
- `[type=url]`

When the user submits the Form, it will automatically check that all validations have passed before triggering `onSubmit`.
If there are errors the callback will not be invoked and an error message will be displayed instead.

Custom validation is also supported, returning either a Promise or the validation result directly:

```JavaScript
const validator = (value, props) => {
  return fetch('checkValueIsAvailable', {
    body: { username: value }
  });
}

const wrapper = mount(
  <Form onSubmit={save} state={state}>
    <label htmlFor="name">Choose your username</label>
    <Input type="text" name="username" validator={validator} />
  </Form>
);

```

## Internationalization

A different locale can be configured by invoking `Messages.set`:

```JavaScript
import { Messages } from 'react-data-input';

Messages.set({
    required: "Por favor, rellena este campo",
    min: "El valor debe ser mayor o igual que ${min}"
})
```

You can see the full list of values in [Messages.js](https://github.com/koliseoapi/react-data-input/blob/master/src/Messages.js).

## Accessibility

The generated form components and alert messages will generate ARIA attributes (`aria-invalid`, `aria-describedBy` and `role=alert`) to be used by assistive technologies.

## To play with the test suite

```
# To run the test suite based on Mocha
npm run test
npm run coverage

# To fiddle with the browser and a sample form at
# http://localhost:8080/test-page/example.html
npm run dev
```
