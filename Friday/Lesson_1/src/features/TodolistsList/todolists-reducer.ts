import { todolistsAPI, TodolistType } from "../../api/todolists-api";
import { Dispatch } from "redux";
import { appActions, RequestStatusType } from "../../app/app-reducer";
import { handleServerNetworkError } from "../../utils/error-utils";
import { AppThunk } from "../../app/store";
import { createSlice, current, PayloadAction } from "@reduxjs/toolkit";
import { clearTasksAndTodolistsState } from "common/actions/common_actions";

const initialState: Array<TodolistDomainType> = [];

const slice = createSlice({
  name: "todolists",
  initialState: [] as TodolistDomainType[],
  reducers: {
    removeTodolist: (state, action: PayloadAction<{ id: string }>) => {
      //     return state.filter((tl) => tl.id != action.id);
      console.log(current(state));
      const index = state.findIndex((todo) => todo.id === action.payload.id);
      if (index !== -1) state.splice(index, 1);
    },
    addTodolist: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
      // return [{ ...action.todolist, filter: "all", entityStatus: "idle" }, ...state];
      // const newTodolist = { ...action.payload.todolist, filter: "all", entityStatus: "idle" };
      state.unshift({ ...action.payload.todolist, filter: "all", entityStatus: "idle" });
    },
    changeTodolistTitle: (state, action: PayloadAction<{ id: string; title: string }>) => {
      // 1
      // const index = state.findIndex((todo) => todo.id === action.payload.id);
      // if (index !== -1) state[index].title = action.payload.title;
      //2
      const todolist = state.find((todo) => todo.id === action.payload.id);
      if (todolist) todolist.title = action.payload.title;
    },
    changeTodolistFilter: (state, action: PayloadAction<{ id: string; filter: FilterValuesType }>) => {
      const todolist = state.find((todo) => todo.id === action.payload.id);
      if (todolist) todolist.filter = action.payload.filter;
    },
    changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string; entityStatus: RequestStatusType }>) => {
      const todolist = state.find((todo) => todo.id === action.payload.id);
      if (todolist) todolist.entityStatus = action.payload.entityStatus;
    },
    setTodolists: (state, action: PayloadAction<{ todolists: Array<TodolistType> }>) => {
      // return потому что изменяем весь state, state = action.payload - не сработает
      // 1 variant
      // return action.payload.todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }));
      // 2 variant
      action.payload.todolists.forEach((tl) => {
        state.push({ ...tl, filter: "all", entityStatus: "idle" });
      });
    },
    // clearTodolists: () => {
    //   return [];
    // },
  },
  extraReducers: (builder) => {
    builder.addCase(clearTasksAndTodolistsState.type, () => {
      return [];
    });
  },
});

export const todolistsReducer = slice.reducer;
export const todolistsActions = slice.actions;

// thunks
export const fetchTodolistsTC = (): AppThunk => {
  return (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    todolistsAPI
      .getTodolists()
      .then((res) => {
        dispatch(todolistsActions.setTodolists({ todolists: res.data }));
        dispatch(appActions.setAppStatus({ status: "succeeded" }));
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };
};
export const removeTodolistTC = (todolistId: string): AppThunk => {
  return (dispatch) => {
    //изменим глобальный статус приложения, чтобы вверху полоса побежала
    dispatch(appActions.setAppStatus({ status: "loading" }));
    //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
    dispatch(todolistsActions.changeTodolistEntityStatus({ id: todolistId, entityStatus: "loading" }));
    todolistsAPI.deleteTodolist(todolistId).then((res) => {
      dispatch(todolistsActions.removeTodolist({ id: todolistId }));
      //скажем глобально приложению, что асинхронная операция завершена
      dispatch(appActions.setAppStatus({ status: "succeeded" }));
    });
  };
};
export const addTodolistTC = (title: string): AppThunk => {
  return (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    todolistsAPI.createTodolist(title).then((res) => {
      dispatch(todolistsActions.addTodolist({ todolist: res.data.data.item }));
      dispatch(appActions.setAppStatus({ status: "succeeded" }));
    });
  };
};
export const changeTodolistTitleTC = (id: string, title: string): AppThunk => {
  return (dispatch) => {
    todolistsAPI.updateTodolist(id, title).then((res) => {
      dispatch(todolistsActions.changeTodolistTitle({ id, title }));
    });
  };
};

export type FilterValuesType = "all" | "active" | "completed";
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType;
  entityStatus: RequestStatusType;
};

/*
export const todolistsReducer = (
  state: Array<TodolistDomainType> = initialState,
  action: ActionsType,
): Array<TodolistDomainType> => {
  switch (action.type) {
    case "REMOVE-TODOLIST":
      return state.filter((tl) => tl.id != action.id);
    case "ADD-TODOLIST":
      return [{ ...action.todolist, filter: "all", entityStatus: "idle" }, ...state];

    case "CHANGE-TODOLIST-TITLE":
      return state.map((tl) => (tl.id === action.id ? { ...tl, title: action.title } : tl));
    case "CHANGE-TODOLIST-FILTER":
      return state.map((tl) => (tl.id === action.id ? { ...tl, filter: action.filter } : tl));
    case "CHANGE-TODOLIST-ENTITY-STATUS":
      return state.map((tl) => (tl.id === action.id ? { ...tl, entityStatus: action.status } : tl));
    case "SET-TODOLISTS":
      return action.todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }));
    default:
      return state;
  }
};
 */
