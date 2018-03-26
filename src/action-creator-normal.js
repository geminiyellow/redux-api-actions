import { createAction } from 'redux-actions';
import isFunction from './isFunction';

export default (action, props) => {
  const { before, success } = props;
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
