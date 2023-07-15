import { Dispatch } from 'redux'
import {
  SetAppErrorActionType,
  setAppStatusAC,
  SetAppStatusActionType,
} from 'app/app-reducer'
import { authAPI, LoginParamsType } from 'api/todolists-api'
import { handleServerAppError, handleServerNetworkError } from 'utils/error-utils'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk } from 'app/store';

const initialState = {
  isLoggedIn: false,
}

const slice = createSlice({
  name: 'auth',
  initialState: initialState,
  reducers: {
    setIsLoggedInAC(state, action: PayloadAction<{ value: boolean }>) {
      state.isLoggedIn = action.payload.value
    },
  },
})

export const authReducer = slice.reducer
export const authActions = slice.actions

// thunks
export const loginTC = (data: LoginParamsType):AppThunk => (dispatch) => {
  dispatch(setAppStatusAC({ status: 'loading' }))
  authAPI
    .login(data)
    .then((res) => {
      if (res.data.resultCode === 0) {
        dispatch(authActions.setIsLoggedInAC({ value: true }))
        dispatch(setAppStatusAC({ status: 'succeeded' }))
      } else {
        handleServerAppError(res.data, dispatch)
      }
    })
    .catch((error) => {
      handleServerNetworkError(error, dispatch)
    })
}
export const logoutTC = ():AppThunk => (dispatch) => {
  dispatch(setAppStatusAC({ status: 'loading' }))
  authAPI
    .logout()
    .then((res) => {
      if (res.data.resultCode === 0) {
        dispatch(authActions.setIsLoggedInAC({ value: false }))
        dispatch(setAppStatusAC({ status: 'succeeded' }))
      } else {
        handleServerAppError(res.data, dispatch)
      }
    })
    .catch((error) => {
      handleServerNetworkError(error, dispatch)
    })
}

/*
export const authReducer = (state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
    switch (action.type) {
        case 'login/SET-IS-LOGGED-IN':
            return {...state, isLoggedIn: action.value}
        default:
            return state
    }
}


export const setIsLoggedInAC = (value: boolean) =>
    ({type: 'login/SET-IS-LOGGED-IN', value} as const)

type ActionsType = ReturnType<typeof setIsLoggedInAC>

type ThunkDispatch = Dispatch<ActionsType | SetAppStatusActionType | SetAppErrorActionType>
 */
