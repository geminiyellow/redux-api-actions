import isNil from 'lodash/isNil';
import isFunction from 'lodash/isFunction';
import isPlainObject from 'lodash/isPlainObject';

import { VALID_REDUCER_KEY, VALID_REDUCER_METHOD_KEY } from './utils';

const isValidReducerDescriptor = (reducer) => {
  if (isFunction(reducer)) return true;
  if (!(isPlainObject(reducer))) return false;
  const keys = Object.keys(reducer);
  return VALID_REDUCER_KEY.every(key => keys.indexOf(key) >= 0);
};

const isValidModuleDescriptor = module =>
  isPlainObject(module) &&
  (!module.before || isFunction(module.before)) &&
  VALID_REDUCER_METHOD_KEY.every(key => (
    isNil(module[key]) || isValidReducerDescriptor(module[key])
  ));

export {
  isValidReducerDescriptor,
  isValidModuleDescriptor,
};
