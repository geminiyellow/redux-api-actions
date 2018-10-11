import isFunction from 'lodash/isFunction';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

const VALID_REDUCER_KEY = ['payload', 'meta', 'reducer'];
const VALID_REDUCER_METHOD_KEY = ['request', 'success', 'failure'];

const func = state => state;
const pickActionType = (type, { meta, payload }) => ({ type, meta, payload });
const normalizeTypeDescriptors = (type, module) =>
  VALID_REDUCER_METHOD_KEY.map((key) => {
    const ACTION_TYPE = `${type}_${key.toUpperCase()}`;
    const { payload, meta } = module;
    const descriptor = module[key] || func;
    return isFunction(descriptor)
      ? ACTION_TYPE
      : pickActionType(ACTION_TYPE, { payload, meta, ...descriptor });
  });

const normalizeReducerDescriptors = (type, module) =>
  VALID_REDUCER_METHOD_KEY.reduce((accumulator, key) => {
    const ACTION_TYPE = `${type}_${key.toUpperCase()}`;
    const descriptor = module[key] || func;
    accumulator[ACTION_TYPE] = isFunction(descriptor)
      ? descriptor
      : descriptor.reducer;
    return accumulator;
  }, {});

const normalizeEnhancers = (connectOptions, enhancerOptions, actions, namespace) => {
  const {
    mapStateToProps: stateToProps,
    mapDispatchToProps: dispatchToProps,
    mergeProps,
    options,
  } = connectOptions || {};

  const mapDispatchToProps = dispatchToProps
    ? (dispatch, props) => dispatchToProps(dispatch, props, actions)
    : dispatch => ({ actions: bindActionCreators(actions, dispatch) });
  const mapStateToProps = stateToProps
    ? (store, props) => stateToProps(store, props, namespace)
    : (store => ({ store: store[namespace] }));

  const enhancers = (enhancerOptions || []);
  const connectIndex = enhancers.findIndex(enhancer => (typeof enhancer === 'function' && enhancer.name === 'connect'));
  enhancers.splice(
    (connectIndex !== -1 ? connectIndex : 0),
    (connectIndex !== -1 ? 1 : 0),
    connect(mapStateToProps, mapDispatchToProps, mergeProps, options)
  );
  return enhancers;
};

export {
  VALID_REDUCER_KEY,
  VALID_REDUCER_METHOD_KEY,
  normalizeTypeDescriptors,
  normalizeReducerDescriptors,
  normalizeEnhancers,
};
