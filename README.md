# redux-api-actions

[![Build Status](https://travis-ci.org/geminiyellow/redux-api-actions.svg?branch=master)](https://travis-ci.org/geminiyellow/redux-api-actions)

Utilities for [redux-api-middleware](https://github.com/agraboso/redux-api-middleware), [redux-actions](https://github.com/redux-utilities/redux-actions) and [react-redux](https://github.com/reactjs/react-redux).

## Table of Contents

* [Getting Started](#getting-started)
  * [Installation](#installation)
  * [Usage](#usage)
* [Documentation](#documentation)

## Getting Started

### Installation

`redux-api-actions` is available on npm.

```bash
npm install --save redux-api-actions
```

### Usage

### **Before use this library**

* Setup up `redux-api-middleware`
  * [See the full API documentation](https://github.com/agraboso/redux-api-middleware).
* `connect` a React component to a Redux store.
  * [See the full API documentation](https://github.com/reactjs/react-redux)

#### **Defining the module**

If you have something looks like this:

* **constants**

```javascript
const namespace = 'count';

export const NAMESPACE = namespace.toUpperCase();
export const TYPE_COUNT = NAMESPACE;
export const TYPE_COUNT_REQUEST = `${TYPE_COUNT}_REQUEST`;
export const TYPE_COUNT_SUCCESS = `${TYPE_COUNT}_SUCCESS`;
export const TYPE_COUNT_FAILURE = `${TYPE_COUNT}_FAILURE`;

export const endpoint = 'http://www.example.com/api/counter'
```

* **redux-actions**

```javascript
import { createActions, handleActions } from 'redux-actions';
import { TYPE_COUNT } from './constants';

const defaultState = { counter: 10 };
export const increment = createAction(TYPE_COUNT);

export const reducer = handleActions({
  [TYPE_COUNT]: state => state.update('counter', v => v + 1),
}, defaultState);
```

* **redux-api-middleware**

```javascript
import { handleActions } from 'redux-actions';
import { RSAA } from 'redux-api-middleware';
import {
  endpoint,
  TYPE_COUNT_REQUEST,
  TYPE_COUNT_SUCCESS,
  TYPE_COUNT_FAILURE,
} from './constants';

export const incrementRemote = amount => ({
  [RSAA]: {
    endpoint: `${endpoint}/${amount}`,
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    types: [
      TYPE_COUNT_REQUEST,
      TYPE_COUNT_SUCCESS,
      TYPE_COUNT_FAILURE,
    ],
  },
});

export const reducer = handleActions({
  [TYPE_COUNT_SUCCESS]: (state, { payload: { amount } }) => state.update('counter', v => amount),
});
```

* **react-redux**

```javascript
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { NAMESPACE } from './constants';

const reduxActions = { increment, incrementRemote };

const mapStateToProps = store => ({ store: store[NAMESPACE] });
const mapDispatchToProps = dispatch => ({ actions: bindActionCreators(reduxActions, dispatch) });
export const Container = connect(mapStateToProps, mapDispatchToProps)(Root);
```

Then, you can merge them into this gist:

* **redux-api-actions**

```javascript
import creator from 'redux-api-actions';
import { endpoint } from './constants';

const { Container, Reducer, NAMESPACE } = creator({
  namespace: 'count',
  state: { counter: 0 },
  component: Root,
  actions: {
    increment: {
      success: state => state.update('counter', v => v + 1),
    },
    incrementRemote: {
      endpoint,
      before: amount => ({ endpoint: `${endpoint}/${amount}` }),
      success: (state, { payload: { amount } }) => state.update('counter', v => amount),
    }
  },
});
```

Looks good, right?

Finally, merge your `Reducer` into your `redux` store as usual.

```javascript
import { createStore, combineReducers } from 'redux';
const store = createStore(
  combineReducers({ ...Reducer }),
  initialState,
);
```

## Documentation

Hey, I'm no good at Writting. So, please help me do this.
And please help me add the test case.

## License

MIT
