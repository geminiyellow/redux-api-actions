import { fromJS } from 'immutable';
import { compose } from 'redux';
import { handleActions } from 'redux-actions';

import createAPIActionAndReducer from './action-creator-api';
import createActionAndReducer from './action-creator-normal';
import { normalizeEnhancers } from './utils';

export default (module = {}) => {
  const {
    namespace, state, component, actions,
    connect: connecOptions,
    enhancers: enhancerOptions,
  } = module;

  const NAMESPACE = namespace.toUpperCase();
  const { reduxActions, reduxReducers } = Object.keys(actions).reduce((accumulator, name) => {
    const { endpoint } = actions[name];
    const ACTION_TYPE = `${NAMESPACE}_${name.toUpperCase()}`;

    const creator = endpoint ? createAPIActionAndReducer : createActionAndReducer;
    const { action, reducer } = creator(ACTION_TYPE, actions[name]);

    accumulator.reduxActions[name] = action;
    accumulator.reduxReducers = { ...accumulator.reduxReducers, ...reducer };

    return accumulator;
  }, { reduxActions: [], reduxReducers: {} });

  // - Actions
  const Actions = reduxActions;

  // - Container
  const Container = compose(...normalizeEnhancers(
    connecOptions,
    enhancerOptions,
    Actions,
    NAMESPACE,
  ))(component);

  // - Reducer
  const Reducer = { [NAMESPACE]: handleActions(reduxReducers, fromJS(state || {})) };

  return {
    Container,
    Reducer,
    Actions,
    NAMESPACE,
  };
};
