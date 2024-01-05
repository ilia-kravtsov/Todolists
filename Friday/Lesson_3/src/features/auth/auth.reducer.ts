import {createSlice} from "@reduxjs/toolkit";
import {appActions} from "app/app.reducer";
import {authAPI, LoginParamsType} from "features/auth/auth.api";
import {clearTasksAndTodolists} from "common/actions";
import {createAppAsyncThunk, handleServerAppError, handleServerNetworkError} from "common/utils";
import {thunkTryCatch} from "common/utils/thunk-try-catch";

const slice = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: false,
  },
  reducers: {},
    extraReducers: builder => {
      builder
          .addCase(login.fulfilled, (state, action) => {
              state.isLoggedIn = true;
          })
          .addCase(logout.fulfilled, (state, action) => {
              state.isLoggedIn = action.payload.isLoggedIn;
          })
          .addCase(initializeApp.fulfilled, (state, action) => {
              state.isLoggedIn = action.payload.isLoggedIn;
          })
    }
});

const login = createAppAsyncThunk<undefined, LoginParamsType>(`${slice.name}/login`,
    async (arg, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
        try {
            dispatch(appActions.setAppStatus({ status: "loading" }));
            const res = await authAPI.login(arg)
                    if (res.data.resultCode === 0) {
                        dispatch(appActions.setAppStatus({ status: "succeeded" }));
                        return undefined
                    } else {
                        // ❗ Если у нас fieldsErrors есть значит мы будем отображать эти ошибки
                        // в конкретном поле в компоненте (пункт 7)
                        // ❗ Если у нас fieldsErrors нет значит отобразим  ошибку глобально

                        const isShowAppError = !res.data.fieldsErrors.length
                        handleServerAppError(res.data, dispatch, isShowAppError);
                        return rejectWithValue(res.data); // попадет в promise .catch() после вызова login
                    }
        } catch (e) {
            handleServerNetworkError(e, dispatch);
            return rejectWithValue(null);
        }
})

const logout = createAppAsyncThunk<LoginOut, void>(`${slice.name}/logout`,
    async (_, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        const res = await authAPI
            .logout()
                if (res.data.resultCode === 0) {
                    dispatch(clearTasksAndTodolists());
                    dispatch(appActions.setAppStatus({ status: "succeeded" }));
                    return { isLoggedIn: false }
                } else {
                    handleServerAppError(res.data, dispatch);
                    return rejectWithValue(null);
                }
    } catch (e) {
        handleServerNetworkError(e, dispatch);
        return rejectWithValue(null);
    }
})

type LoginOut = {
    isLoggedIn: boolean
}

const initializeApp = createAppAsyncThunk<{ isLoggedIn: boolean }, void>(`${slice.name}/initializeApp`,
    async (_, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI
        return thunkTryCatch(thunkAPI, async () => {
            const res = await authAPI.me()
            if (res.data.resultCode === 0) {
                // dispatch(authActions.setIsLoggedIn({ isLoggedIn: true }));
                return { isLoggedIn: true } // придет и в addCase и в Promise от dispatch(authThunks.initializeApp())
            } else {
                handleServerAppError(res.data, dispatch);
                return rejectWithValue(null);
            }
        }).finally(() => {
            dispatch(appActions.setAppInitialized({ isInitialized: true }));
        })


    })
export const authReducer = slice.reducer;
export const authThunks = {login, logout, initializeApp}