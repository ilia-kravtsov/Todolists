import {appActions, RequestStatusType} from "app/app.reducer";
import {handleServerNetworkError} from "utils/handleServerNetworkError";
import {AppThunk} from "app/store";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {clearTasksAndTodolists} from "common/actions/common.actions";
import {todolistsAPI, TodolistType} from "features/TodolistsList/todolistsAPI";
import {createAppAsyncThunk, handleServerAppError} from "utils";
import {ResultCode} from "features/TodolistsList/tasks.reducer";

const initialState: TodolistDomainType[] = [];

const slice = createSlice({
    name: "todo",
    initialState,
    reducers: {
        // removeTodolist: (state, action: PayloadAction<{ id: string }>) => {
        //     const index = state.findIndex((todo) => todo.id === action.payload.id);
        //     if (index !== -1) state.splice(index, 1);
        //     // return state.filter(tl => tl.id !== action.payload.id)
        // },
        // addTodolist: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
        //     const newTodolist: TodolistDomainType = {...action.payload.todolist, filter: "all", entityStatus: "idle"};
        //     state.unshift(newTodolist);
        // },
        // changeTodolistTitle: (state, action: PayloadAction<{ id: string; title: string }>) => {
        //     const todo = state.find((todo) => todo.id === action.payload.id);
        //     if (todo) {
        //         todo.title = action.payload.title;
        //     }
        // },
        changeTodolistFilter: (state, action: PayloadAction<{ id: string; filter: FilterValuesType }>) => {
            const todo = state.find((todo) => todo.id === action.payload.id);
            if (todo) {
                todo.filter = action.payload.filter;
            }
        },
        changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string; entityStatus: RequestStatusType }>) => {
            const todo = state.find((todo) => todo.id === action.payload.id);
            if (todo) {
                todo.entityStatus = action.payload.entityStatus;
            }
        },
        // setTodolists: (state, action: PayloadAction<{ todolists: TodolistType[] }>) => {
        //     return action.payload.todolists.map((tl) => ({...tl, filter: "all", entityStatus: "idle"}));
        //     // return action.payload.forEach(t => ({...t, filter: 'active', entityStatus: 'idle'}))
        // },
    },
    extraReducers: (builder) => {
        builder
            .addCase(clearTasksAndTodolists, () => {
            return [];
        })
            .addCase(fetchTodolists.fulfilled, (state, action) => {
                return action.payload.todolists.map((tl) => ({...tl, filter: "all", entityStatus: "idle"}));
            })
            .addCase(removeTodolist.fulfilled, (state, action) => {
                const index = state.findIndex((todo) => todo.id === action.payload.id);
                if (index !== -1) state.splice(index, 1);
            })
            .addCase(addTodolist.fulfilled, (state, action) => {
                const newTodolist: TodolistDomainType = {...action.payload.todolist, filter: "all", entityStatus: "idle"};
                state.unshift(newTodolist);
            })
            .addCase(changeTodolistTitle.fulfilled, (state, action) => {
                const todo = state.find((todo) => todo.id === action.payload.id);
                if (todo) todo.title = action.payload.title;
            })
    },
});

// thunks
// export const fetchTodolistsTC = (): AppThunk => {
//     return (dispatch) => {
//         dispatch(appActions.setAppStatus({status: "loading"}));
//         todolistsAPI
//             .getTodolists()
//             .then((res) => {
//                 dispatch(todolistsActions.setTodolists({todolists: res.data}));
//                 dispatch(appActions.setAppStatus({status: "succeeded"}));
//             })
//             .catch((error) => {
//                 handleServerNetworkError(error, dispatch);
//             });
//     };
// };

const fetchTodolists = createAppAsyncThunk<{ todolists: TodolistType[] }, undefined>(`${slice.name}/fetchTodolists`,
    async (arg, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI
        try {
            dispatch(appActions.setAppStatus({status: "loading"}));
            const res = await todolistsAPI.getTodolists()
           // dispatch(todolistsActions.setTodolists({todolists: res.data}));
            dispatch(appActions.setAppStatus({status: "succeeded"}));
            return {todolists: res.data}
        } catch (e) {
            handleServerNetworkError(e, dispatch);
            return rejectWithValue(null)
        }
    })

type RemoveTodolist = {id: string}

const removeTodolist = createAppAsyncThunk<RemoveTodolist,string>(`${slice.name}/removeTodolist`,
    async (id: string, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI

        try {
            dispatch(appActions.setAppStatus({ status: "loading" }));
            dispatch(todolistsActions.changeTodolistEntityStatus({ id, entityStatus: "loading" }));
            const res = await todolistsAPI.deleteTodolist(id);
            if (res.data.resultCode === ResultCode.success) {
                dispatch(appActions.setAppStatus({ status: "succeeded" }));
                return { id };
            } else {
                handleServerAppError(res.data, dispatch);
                return rejectWithValue(null)
            }
        } catch (e) {
            handleServerNetworkError(e, dispatch);
            return rejectWithValue(null);
        }
    })

// export const removeTodolistTC = (id: string): AppThunk => {
//     return (dispatch) => {
//         //изменим глобальный статус приложения, чтобы вверху полоса побежала
//         dispatch(appActions.setAppStatus({status: "loading"}));
//         //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
//         dispatch(todolistsActions.changeTodolistEntityStatus({id, entityStatus: "loading"}));
//         todolistsAPI.deleteTodolist(id).then((res) => {
//             dispatch(todolistsActions.removeTodolist({id}));
//             //скажем глобально приложению, что асинхронная операция завершена
//             dispatch(appActions.setAppStatus({status: "succeeded"}));
//         });
//     };
// };

const addTodolist = createAppAsyncThunk<{todolist: TodolistType},string>(`${slice.name}/addTodolist`,
    async (title: string, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI
        try {
            dispatch(appActions.setAppStatus({status: "loading"}));
            const res = await todolistsAPI.createTodolist(title)
            if (res.data.resultCode === ResultCode.success) {
                // dispatch(todolistsActions.addTodolist({todolist: res.data.data.item}));
                dispatch(appActions.setAppStatus({status: "succeeded"}));
                return {todolist: res.data.data.item}
            } else {
                handleServerAppError(res.data, dispatch);
                return rejectWithValue(null)
            }
        } catch (e) {
            handleServerNetworkError(e, dispatch);
            return rejectWithValue(null);
        }
    })
// export const addTodolistTC = (title: string): AppThunk => {
//     return (dispatch) => {
//         dispatch(appActions.setAppStatus({status: "loading"}));
//         todolistsAPI.createTodolist(title).then((res) => {
//             dispatch(todolistsActions.addTodolist({todolist: res.data.data.item}));
//             dispatch(appActions.setAppStatus({status: "succeeded"}));
//         });
//     };
// };
// export const changeTodolistTitleTC = (id: string, title: string): AppThunk => {
//     return (dispatch) => {
//         todolistsAPI.updateTodolist(id, title).then((res) => {
//             dispatch(todolistsActions.changeTodolistTitle({id, title}));
//         });
//     };
// };

type payload = { id: string, title: string };

const changeTodolistTitle = createAppAsyncThunk<payload,payload>(`${slice.name}/changeTodolistTitle`,
    async (arg, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI
        const {id, title} = arg
        try {
            dispatch(appActions.setAppStatus({status: "loading"}));
            const res = await todolistsAPI.updateTodolist(id, title)
            if (res.data.resultCode === ResultCode.success) {
                // dispatch(todolistsActions.changeTodolistTitle({id, title}));
                dispatch(appActions.setAppStatus({status: "succeeded"}));
                return {id, title}
            } else {
                handleServerAppError(res.data, dispatch);
                return rejectWithValue(null)
            }
        } catch (e) {
            handleServerNetworkError(e, dispatch);
            return rejectWithValue(null);
        }
    })

// types
export type FilterValuesType = "all" | "active" | "completed";
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType;
    entityStatus: RequestStatusType;
};

export const todolistsReducer = slice.reducer;
export const todolistsActions = slice.actions;
export const todolistsThunks = {fetchTodolists, removeTodolist, addTodolist, changeTodolistTitle}