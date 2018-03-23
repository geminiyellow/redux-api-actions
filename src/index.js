import { fromJS } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { handleActions } from 'redux-actions';

import { createAPIActionAndReducer } from './action-creator-api';
import { createActionAndReducer } from './action-creator-normal';

/**
 * {
 *   namespace: string,
 *   state: object || null,
 *   component: react-element,
 *   actions: {
 *     [action_name]: {
 *       endpoint: object?,
 *       payload: func?,
 *       meta: func?,
 *       success: func || object,
 *       failure: func || object,
 *       request: func || object,
 *     }
 *   },
 * }
 */
export default (module = {}) => {
  const { namespace, state, component, actions } = module;

  const reduxActions = {};
  let reduxReducers = {};

  // if has key `endpoint`, means this action is a api action else is a normal action
  Object.keys(actions).map(name => {
    const { endpoint } = actions[name];
    const ACTION_TYPE = `${namespace}_${name}`.toUpperCase();

    const creator = endpoint ? createAPIActionAndReducer : createActionAndReducer;
    const { action, reducer } = creator(ACTION_TYPE, actions[name]);

    reduxActions[name] = action;
    reduxReducers = { ...reduxReducers, ...reducer };
  });

  // - Container
  const mapDispatchToProps = dispatch => ({ actions: bindActionCreators(reduxActions, dispatch) });
  const mapStateToProps = state => ({ store: state[namespace.toUpperCase()] });
  const Container = connect(mapStateToProps, mapDispatchToProps)(component);

  // - Reducer
  const Reducer = { [namespace.toUpperCase()]: handleActions(reduxReducers, fromJS(state || {})) };

  return {
    Container,
    Reducer,
  };
}
