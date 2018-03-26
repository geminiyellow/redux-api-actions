import invariant from 'invariant';
import isNull from 'lodash/isNull';
import isFunction from 'lodash/isFunction';
import { createAction } from 'redux-actions';

import { isValidReducerDescriptor } from './validation';

export default (action, props) => {
  const { before, success } = props;

  invariant(
    !(isNull(before) || isFunction(before)),
    'Expected before to be a function, undefined or null'
  );

  invariant(
    isValidReducerDescriptor(success),
    'Expected success to be a function, or valid reducer descriptor'
  );

  const isFunc = isFunction(success);
  const { payload, meta } = isFunc ? props : success;

  const type = createAction(action, payload, meta);
  const fsa = (before && isFunction(before)) ?
    (...args) => ({ type, ...before(...args) }) :
    type;

  return ({
    action: fsa,
    reducer: { [action]: isFunc ? success : success.reducer },
  });
};
