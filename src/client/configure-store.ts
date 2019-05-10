import {
  createStore,
  combineReducers,
  applyMiddleware,
  Middleware,
  compose
} from "redux";
import { reducers, StoreShape } from "./reducers";
import { setError } from "./actions/error";

const asyncGeneratorMiddleware: Middleware<{}, {}, any> = ({
  dispatch
}) => next => async action => {
  if (action[Symbol.asyncIterator]) {
    try {
      for await (const _action of action) {
        dispatch(_action);
      }
    } catch (e) {
      dispatch(setError(e));
    }
  } else {
    return next(action);
  }
};

export default function configureStore() {
  const rootReducer = combineReducers<StoreShape>(reducers);
  const composeEnhancers =
    (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const enhancer = composeEnhancers(applyMiddleware(asyncGeneratorMiddleware));

  return createStore(rootReducer, enhancer);
}
