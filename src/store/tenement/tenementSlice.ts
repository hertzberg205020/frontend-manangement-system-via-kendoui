import type { CreateTenementDataType } from '@/types/tenement';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface TenementState {
  tenementDatum: CreateTenementDataType | null;
}

/**
 * Tenement slice for managing tenement data in the Redux store.
 * This slice includes actions to set and clear tenement data.
 */
const initialState: TenementState = {
  tenementDatum: null,
};

export const tenementSlice = createSlice({
  name: 'tenement',
  initialState,
  reducers: {
    setTenementDatum: (state, action: PayloadAction<CreateTenementDataType>) => {
      state.tenementDatum = action.payload;
    },
    clearTenementDatum: (state) => {
      state.tenementDatum = null;
    },
  },
});

export const { setTenementDatum, clearTenementDatum } = tenementSlice.actions;
export default tenementSlice.reducer;
export type TenementActions = typeof tenementSlice.actions;
export type TenementReducer = typeof tenementSlice.reducer;
