import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	selectedDistributionOption: null,
	confirmed: false,
	space: null,
	spaceEntrance: null,
	rotation: 0,
};

export const distributionSlice = createSlice({
	name: "distribution",
	initialState,
	reducers: {
		setDistributionOption: (state, action) => {
			state.selectedDistributionOption = action.payload;
		},
		setDistributionConfirmed: (state, action) => {
			state.confirmed = action.payload;
		},
		setDistributionConfig: (state, action) => {
			const { space, spaceEntrance, rotation } = action.payload;
			state.space = space;
			state.spaceEntrance = spaceEntrance;
			state.rotation = rotation;
		},
	},
});

export const {
	setDistributionConfirmed,
	setDistributionOption,
	setDistributionConfig,
} = distributionSlice.actions;
