import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface INotification {
  open: boolean;
  message: string;
  failure: boolean;
  actionPath?: string;
}

const initialState: INotification = {
  open: false,
  message: '',
  failure: false,
  actionPath: '',
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification: (
      state,
      action: PayloadAction<{ message: string; failure?: boolean; actionPath?: string }>
    ) => {
      state.open = true;
      state.message = action.payload.message;
      state.failure = action.payload.failure || false;
      state.actionPath = action.payload.actionPath || '';
    },
    closeNotification: (state) => {
      state.open = false;
      state.message = '';
      state.failure = false;
      state.actionPath = '';
    },
  },
});

export const { showNotification, closeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
