import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./features/counterSlice";
import courseReducer from "./features/courseSlice";
import plannerReducer from "./features/plannerSlice";

const store = configureStore({
  reducer: {
    counterReducer,
    courseReducer,
    plannerReducer,
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
