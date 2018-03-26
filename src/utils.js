import isFunction from 'lodash/isFunction';

const VALID_REDUCER_KEY = ['payload', 'meta', 'reducer'];
const VALID_REDUCER_METHOD_KEY = ['request', 'success', 'failure'];

const func = state => state;
const pickActionType = (type, { meta, payload }) => ({ type, meta, payload });
const normalizeTypeDescriptors = (type, module) =>
  VALID_REDUCER_METHOD_KEY.map((key) => {
    const ACTION_TYPE = `${type}_${key.toUpperCase}`;
    const { payload, meta } = module;
    const descriptor = module[key] || func;
    return isFunction(descriptor)
      ? ACTION_TYPE
      : pickActionType(ACTION_TYPE, { payload, meta, ...descriptor });
  });

const normalizeReducerDescriptors = (type, module) =>
  VALID_REDUCER_METHOD_KEY.reduce((accumulator, key) => {
    const ACTION_TYPE = `${type}_${key.toUpperCase}`;
    const descriptor = module[key] || func;
    accumulator[ACTION_TYPE] = isFunction(descriptor)
      ? descriptor
      : descriptor.reducer;
    return accumulator;
  }, {});

export {
  VALID_REDUCER_KEY,
  VALID_REDUCER_METHOD_KEY,
  normalizeTypeDescriptors,
  normalizeReducerDescriptors,
};
