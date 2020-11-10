import React from 'react';
import { mount } from 'enzyme';
<<<<<<< HEAD
import { act } from 'react-dom/test-utils';
import { MemoryRouter, Route } from 'react-router-dom';
=======
import { MemoryRouter, Route, Routes } from 'react-router-dom';
>>>>>>> RR v6
import SecureRoute from '../../src/SecureRoute';
import Security from '../../src/Security';

describe('<SecureRoute />', () => {
  let authService;
  let authState;
  let mockProps;

  beforeEach(() => {
    authState = {
      isPending: true
    };
    authService = {
      on: jest.fn(),
      updateAuthState: jest.fn(),
      getAuthState: jest.fn().mockImplementation(() => authState),
      login: jest.fn(),
      _oktaAuth: {
        token: {
          isLoginRedirect: jest.fn().mockImplementation(() => false)
        }
      }
    };
    mockProps = { authService };
  });

  describe('With changing authState', () => {
    let emitAuthState;

    beforeEach(() => {
      authService.on = (eventName, cb) => {
        emitAuthState = () => {
          act(cb);
        };
      };
    });

    function updateAuthState(newProps = {}) {
      authState = Object.assign({}, authState, newProps);
      emitAuthState();
    }

    it('calls login() only once until user is authenticated', () => {
      authState.isAuthenticated = false;
      authState.isPending = false;
  
      mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute path="/" />
          </Security>
        </MemoryRouter>
      );
      expect(authService.login).toHaveBeenCalledTimes(1);
      authService.login.mockClear();

      updateAuthState({ isPending: true });
      expect(authService.login).not.toHaveBeenCalled();

      updateAuthState({ isPending: false });
      expect(authService.login).not.toHaveBeenCalled();

      updateAuthState({ isAuthenticated: true });
      expect(authService.login).not.toHaveBeenCalled();

      // If the state returns to unauthenticated, the secure route should still work
      updateAuthState({ isAuthenticated: false });
      expect(authService.login).toHaveBeenCalledTimes(1);
    });
  });

  describe('isAuthenticated: true', () => {

    beforeEach(() => {
      authState.isAuthenticated = true;
      authState.isPending = false;
    });

    it('will render wrapped component using "element"', () => {
      const MyComponent = function() { return <div>hello world</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <Routes>
              <SecureRoute
                element={<MyComponent />}
              />
            </Routes>
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).html()).toBe('<div>hello world</div>');
    });

    it('will render wrapped component as a child', () => {
      const MyComponent = function() { return <div>hello world</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <Routes>
              <SecureRoute>
                <MyComponent/>
              </SecureRoute>
            </Routes>
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).html()).toBe('<div>hello world</div>');
    });
  });

  describe('isAuthenticated: false', () => {

    beforeEach(() => {
      authState.isAuthenticated = false;
      authState.isPending = false;
    });

    it('will not render wrapped component using "element"', () => {
      const MyComponent = function() { return <div>hello world</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <Routes>
              <SecureRoute
                element={<MyComponent />}
              />
            </Routes>
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).length).toBe(0);
    });

    it('will not render wrapped component with children', () => {
       const MyComponent = function() { return <div>hello world</div>; };
       const wrapper = mount(
         <MemoryRouter>
           <Security {...mockProps}>
             <Routes>
              <SecureRoute>
                <MyComponent/>
              </SecureRoute>
             </Routes>
           </Security>
         </MemoryRouter>
       );
       expect(wrapper.find(MyComponent).length).toBe(0);
    });

    describe('isPending: false', () => {

      beforeEach(() => {
        authState.isPending = false;
      });

      it('calls login() if route matches', () => {
        mount(
          <MemoryRouter>
            <Security {...mockProps}>
              <Routes>
                <SecureRoute path="/" />
              </Routes>
            </Security>
          </MemoryRouter>
        );
        expect(authService.login).toHaveBeenCalled();
      });

      it('does not call login() if route does not match', () => {
        mount(
          <MemoryRouter>
            <Security {...mockProps}>
              <Routes>
                <SecureRoute path="/other" />
              </Routes>
            </Security>
          </MemoryRouter>
        );
        expect(authService.login).not.toHaveBeenCalled();
      });
    });

    describe('isPending: true', () => {

      beforeEach(() => {
        authState.isPending = true;
      });

      it('does not call login()', () => {
        mount(
          <MemoryRouter>
            <Security {...mockProps}>
              <Routes>
                <SecureRoute />
              </Routes>
            </Security>
          </MemoryRouter>
        );
        expect(authService.login).not.toHaveBeenCalled();
      });
    });
  });

  describe('when authenticated', () => { 
    const MyComponent = function() { return <div>hello world</div>; };
    beforeEach(() => {
      authState.isPending = false;
      authState.isAuthenticated = true;
    });

    it('should accept a "path" prop and render a component', () => {
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <Routes>
              <SecureRoute
                path='/'
                element={<MyComponent />}
              />
            </Routes>
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(SecureRoute).props().path).toBe('/');
      expect(wrapper.find(MyComponent).html()).toBe('<div>hello world</div>');
    });

    it('should accept a "caseSensitive" prop and pass it to an internal Route', () => {
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <Routes>
              <SecureRoute
                caseSensitive={true}
                path='/'
                element={<MyComponent />}
              />
            </Routes>
          </Security>
        </MemoryRouter>
      );
      const secureRoute = wrapper.find(SecureRoute);
      expect(secureRoute.find(Route).props().caseSensitive).toBe(true);
      expect(wrapper.find(MyComponent).html()).toBe('<div>hello world</div>');
    });

    it('should pass props using the "element" prop', () => {
      authState.isAuthenticated = true;
      const MyComponent = function(props) { return <div>{ props.someProp ? 'has someProp' : 'lacks someProp'}</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <Routes>
              <SecureRoute
                path='/'
                element={<MyComponent someProp={true} />}
              />
            </Routes>
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).html()).toBe('<div>has someProp</div>');
    });

  });
});
