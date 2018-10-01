import { fromJS } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { handleActions } from 'redux-actions';

import createAPIActionAndReducer from './action-creator-api';
import createActionAndReducer from './action-creator-normal';

export default (module = {}) => {
  const {
    namespace, state, component, actions,
    mapStateToProps: stateToProps,
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

  // - Container
  const mapDispatchToProps = dispatch => ({ actions: bindActionCreators(reduxActions, dispatch) });
  const mapStateToProps = stateToProps
    ? (store, props) => stateToProps(store, props, NAMESPACE)
    : (store => ({ store: store[NAMESPACE] }));
  const Container = connect(mapStateToProps, mapDispatchToProps)(component);

  // - Reducer
  const Reducer = { [NAMESPACE]: handleActions(reduxReducers, fromJS(state || {})) };

  return {
    Container,
    Reducer,
    NAMESPACE,
  };
};
