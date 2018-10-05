import { fromJS } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { handleActions } from 'redux-actions';

import createAPIActionAndReducer from './action-creator-api';
import createActionAndReducer from './action-creator-normal';

export default (module = {}) => {
  const {
    namespace, state, component, actions,
    connect: connecOptions,
    enhancers,
  } = module;

  const {
    mapStateToProps: stateToProps,
    mapDispatchToProps: dispatchToProps,
    mergeProps,
    options,
  } = connecOptions || {};

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
  const mapDispatchToProps = dispatchToProps
    ? (dispatch, props) => dispatchToProps(dispatch, props, Actions)
    : dispatch => ({ actions: bindActionCreators(Actions, dispatch) });
  const mapStateToProps = stateToProps
    ? (store, props) => stateToProps(store, props, NAMESPACE)
    : (store => ({ store: store[NAMESPACE] }));
  const Container = compose(
    connect(mapStateToProps, mapDispatchToProps, mergeProps, options),
    ...(enhancers || []),
  )(component);

  // - Reducer
  const Reducer = { [NAMESPACE]: handleActions(reduxReducers, fromJS(state || {})) };

  return {
    Container,
    Reducer,
    Actions,
    NAMESPACE,
  };
};
