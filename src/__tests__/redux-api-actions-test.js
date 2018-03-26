import { expect } from 'chai';
import { fromJS } from 'immutable';
import { JSDOM } from 'jsdom';
import PropTypes from 'prop-types';
/* eslint-disable react/prop-types */
import React, { Children } from 'react';
import TestUtils from 'react-dom/test-utils';
import { combineReducers, createStore } from 'redux';

import creator from '../';

class Passthrough extends React.PureComponent {
  render() {
    return <div data={JSON.stringify(this.props)} />;
  }
}

class ProviderMock extends React.PureComponent {
  getChildContext() {
    return { store: this.props.store };
  }

  render() {
    return Children.only(this.props.children);
  }
}

ProviderMock.childContextTypes = {
  store: PropTypes.object.isRequired,
};

const fsa = {
  namespace: 'redux-api-actions',
  state: { example: true },
  component: Passthrough,
  actions: {
    toggle: {
      success: state => state.update('example', example => !example),
    },
  },
};

describe('creator', () => {
  // ================
  const dom = new JSDOM('<!DOCTYPE html><html><head/><body/></html>');
  global.window = dom.window;
  global.document = dom.window.document;
  //

  describe('resulting a module', () => {
    const { NAMESPACE, Reducer, Container } = creator(fsa);
    it('returns a valid NAMESPACE', () => {
      expect(NAMESPACE).to.equal(fsa.namespace.toUpperCase());
    });

    it('returns a valid Reducer', () => {
      expect(Reducer).to.be.an('object');
      expect(Reducer).to.have.property(NAMESPACE);

      const store = fromJS(fsa.state);
      const reducer = Reducer[NAMESPACE];
      const type = `${NAMESPACE}_TOGGLE`;
      expect(reducer(store, { type }).get('example')).to.be.false;
    });

    describe('returns a valid Container', () => {
      const store = createStore(combineReducers({ ...Reducer }));
      const type = `${NAMESPACE}_TOGGLE`;

      const root = (
        <ProviderMock store={store}>
          <Container name={NAMESPACE} />
        </ProviderMock>
      );
      const tree = TestUtils.renderIntoDocument(root);
      const container = TestUtils.findRenderedComponentWithType(tree, Container);
      const stub = TestUtils.findRenderedComponentWithType(container, Passthrough);

      it('should receive the store in the context', () => {
        expect(container.context.store).to.equal(store);
      });

      it('should pass state and props to the given component', () => {

        expect(stub.props.name).to.equal(NAMESPACE);
        expect(stub.props.store).to.equal(store.getState()[NAMESPACE]);
        expect(stub.props.store.get('example')).to.be.true;

        expect(stub.props.actions).to.have.property('toggle');
        expect(stub.props.actions.toggle).to.be.an('function');
      });

      it('should update when the state of the store changes', () => {
        store.dispatch({ type });
        expect(stub.props.store.get('example')).to.be.false;
      });
    });
  });
});
