// https://github.com/agraboso/redux-api-middleware#rsaa-1
import isFunction from './isFunction';
import { RSAA } from 'redux-api-middleware';

const func = state => state;
const pickActionType = (type, { meta, payload }) => ({ type, meta, payload });

// request: reducer || { meta, payload, reducer }
// method: 'GET',
// headers: { 'Content-Type': 'application/json' },
// credentials: 'same-origin',
export const createAPIActionAndReducer = (action, props) => {
  const { before, payload, meta, endpoint, request = func, success = func, failure = func, ...others } = props;
  const { body, method, headers, credentials, options, bailout, fetch } = others;

  const REQUEST = `${action}_REQUEST`;
  const SUCCESS = `${action}_SUCCESS`;
  const FAILURE = `${action}_FAILURE`;

  const isFuncREQ = isFunction(request);
  const isFuncSUC = isFunction(success);
  const isFuncFAL = isFunction(failure);

  const REQUEST_TYPE = isFuncREQ ? REQUEST : pickActionType(REQUEST, { payload, meta, ...request });
  const SUCCESS_TYPE = isFuncSUC ? SUCCESS : pickActionType(SUCCESS, { payload, meta, ...success });
  const FAILURE_TYPE = isFuncFAL ? FAILURE : pickActionType(FAILURE, { payload, meta, ...failure });
  const types = [REQUEST_TYPE, SUCCESS_TYPE, FAILURE_TYPE];

  const defaultRSAA = {
    endpoint, types, body,

    method: method || 'GET',
    headers: headers || { 'Content-Type': 'application/json' },
    credentials: credentials || 'same-origin',

    options, bailout, fetch,
  };

  const rsaa = (before && isFunction(before)) ?
    (...args) => ({ [RSAA]: { ...defaultRSAA, ...before(...args) } }) :
    { [RSAA]: defaultRSAA };

  return ({
    action: rsaa,
    reducer: {
      [REQUEST]: isFuncREQ ? request : request.reducer,
      [SUCCESS]: isFuncSUC ? success : success.reducer,
      [FAILURE]: isFuncFAL ? failure : failure.reducer,
    }
  });
}
