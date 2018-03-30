import invariant from 'invariant';
import isFunction from 'lodash/isFunction';
import { RSAA } from 'redux-api-middleware';

import { isValidModuleDescriptor } from './validation';
import { normalizeTypeDescriptors, normalizeReducerDescriptors } from './utils';

export default (action, props) => {
  invariant(
    isValidModuleDescriptor(props),
    'Expected module descriptor have a valid reducer.'
  );

  const {
    before, // redux-api-actions
    endpoint, options, method, body, headers, credentials, bailout, fetch, // rssa
  } = props;

  invariant(
    !!endpoint,
    'Expected endpoint to be valid api endpoint string.'
  );

  const types = normalizeTypeDescriptors(action, props);
  const defaultRSAA = {
    endpoint,
    types,
    body,
    method: method || 'GET',
    headers: headers || { 'Content-Type': 'application/json' },
    credentials: credentials || 'same-origin',
    options,
    bailout,
    fetch,
  };

  const rsaa = (before && isFunction(before)) ?
    (...args) => ({ [RSAA]: { ...defaultRSAA, ...before(...args) } }) :
    { [RSAA]: defaultRSAA };

  const reducer = normalizeReducerDescriptors(action, props);

  return ({
    action: rsaa,
    reducer,
  });
};
