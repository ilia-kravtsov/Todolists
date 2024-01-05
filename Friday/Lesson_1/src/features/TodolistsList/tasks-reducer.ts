import { TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType } from "../../api/todolists-api";
import { Dispatch } from "redux";
import { AppRootStateType, AppThunk } from "../../app/store";
import { handleServerAppError, handleServerNetworkError } from "../../utils/error-utils";
import { appActions } from "app/app-reducer";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { todolistsActions } from "features/TodolistsList/todolists-reducer";
import { clearTasksAndTodolistsState } from "common/actions/common_actions";

const initialState: TasksStateType = {};

const slice = createSlice({
  name: "tasks",
  initialState: {} as TasksStateType,
  reducers: {
    removeTask: (state, action: PayloadAction<{ taskId: string; todolistId: string }>) => {
      // return { ...state, [action.todolistId]: state[action.todolistId].filter((t) => t.id != action.taskId) };
      const tasksForTodolist = state[action.payload.todolistId];
      // 1 variant
      const index = tasksForTodolist.findIndex((task) => task.id === action.payload.taskId);
      if (index !== -1) tasksForTodolist.splice(index, 1);
      // 2 variant
      // const taskRemove = tasksForTodolist.find((task) => task.id === action.payload.taskId);
      // if (taskRemove) {
      //   const index = tasksForTodolist.indexOf(taskRemove);
      //   tasksForTodolist.splice(index, 1);
      // }
    },
    addTask: (state, action: PayloadAction<{ task: TaskType }>) => {
      // return { ...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId]] };
      const tasksForTodolist = state[action.payload.task.todoListId];
      tasksForTodolist.unshift(action.payload.task);
    },
    updateTask: (
      state,
      action: PayloadAction<{ taskId: string; model: UpdateDomainTaskModelType; todolistId: string }>,
    ) => {
      /*
        return {...state, [action.todolistId]: state[action.todolistId].map((t) => t.id === action.taskId ? { ...t, ...action.model } : t,)};
       */
      const tasksForTodolist = state[action.payload.todolistId];
      const index = tasksForTodolist.findIndex((task) => task.id === action.payload.taskId);
      if (index !== -1) tasksForTodolist[index] = { ...tasksForTodolist[index], ...action.payload.model };
    },
    setTasks: (state, action: PayloadAction<{ tasks: Array<TaskType>; todolistId: string }>) => {
      // return { ...state, [action.todolistId]: action.tasks };
      state[action.payload.todolistId] = action.payload.tasks;
    },
    // clearTasks: () => {
    //   return {};
    // },
  },
  extraReducers: (builder) => {
    builder
      .addCase(todolistsActions.addTodolist, (state, action) => {
        //   return { ...state, [action.todolist.id]: [] };
        state[action.payload.todolist.id] = [];
      })
      .addCase(todolistsActions.removeTodolist, (state, action) => {
        /*
          const copyState = { ...state };
          delete copyState[action.id];
          return copyState;
       */
        delete state[action.payload.id];
      })
      .addCase(todolistsActions.setTodolists, (state, action) => {
        action.payload.todolists.forEach((tl) => {
          state[tl.id] = [];
        });
      })
      .addCase(clearTasksAndTodolistsState.type, () => {
        return {};
      });
  },
});

export const tasksReducer = slice.reducer;
export const tasksActions = slice.actions;

// thunks
export const fetchTasksTC =
  (todolistId: string): AppThunk =>
  (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    todolistsAPI.getTasks(todolistId).then((res) => {
      const tasks = res.data.items;
      dispatch(tasksActions.setTasks({ tasks, todolistId }));
      dispatch(appActions.setAppStatus({ status: "succeeded" }));
    });
  };
export const removeTaskTC =
  (taskId: string, todolistId: string): AppThunk =>
  (dispatch) => {
    todolistsAPI.deleteTask(todolistId, taskId).then((res) => {
      dispatch(tasksActions.removeTask({ taskId: taskId, todolistId: todolistId }));
    });
  };
export const addTaskTC =
  (title: string, todolistId: string): AppThunk =>
  (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    todolistsAPI
      .createTask(todolistId, title)
      .then((res) => {
        if (res.data.resultCode === 0) {
          const task = res.data.data.item;
          const action = tasksActions.addTask({ task });
          dispatch(action);
          dispatch(appActions.setAppStatus({ status: "succeeded" }));
        } else {
          handleServerAppError(res.data, dispatch);
        }
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };
export const updateTaskTC =
  (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string): AppThunk =>
  (dispatch, getState: () => AppRootStateType) => {
    const state = getState();
    const task = state.tasks[todolistId].find((t) => t.id === taskId);
    if (!task) {
      //throw new Error("task not found in the state");
      console.warn("task not found in the state");
      return;
    }

    const apiModel: UpdateTaskModelType = {
      deadline: task.deadline,
      description: task.description,
      priority: task.priority,
      startDate: task.startDate,
      title: task.title,
      status: task.status,
      ...domainModel,
    };

    todolistsAPI
      .updateTask(todolistId, taskId, apiModel)
      .then((res) => {
        if (res.data.resultCode === 0) {
          const action = tasksActions.updateTask({ taskId, model: domainModel, todolistId });
          dispatch(action);
        } else {
          handleServerAppError(res.data, dispatch);
        }
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };

// types
export type UpdateDomainTaskModelType = {
  title?: string;
  description?: string;
  status?: TaskStatuses;
  priority?: TaskPriorities;
  startDate?: string;
  deadline?: string;
};
export type TasksStateType = {
  [key: string]: Array<TaskType>;
};

// export const tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
//   switch (action.type) {
//     case "REMOVE-TASK":
//       return { ...state, [action.todolistId]: state[action.todolistId].filter((t) => t.id != action.taskId) };
//     case "ADD-TASK":
//       return { ...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId]] };
//     case "UPDATE-TASK":
//       return {
//         ...state,
//         [action.todolistId]: state[action.todolistId].map((t) =>
//           t.id === action.taskId ? { ...t, ...action.model } : t,
//         ),
//       };
//     case "SET-TASKS":
//       return { ...state, [action.todolistId]: action.tasks };
//
//     case "ADD-TODOLIST":
//       return { ...state, [action.todolist.id]: [] };
//     case "REMOVE-TODOLIST":
//       const copyState = { ...state };
//       delete copyState[action.id];
//       return copyState;
//     case "SET-TODOLISTS": {
//       const copyState = { ...state };
//       action.todolists.forEach((tl: any) => {
//         copyState[tl.id] = [];
//       });
//       return copyState;
//     }
//     default:
//       return state;
//   }
// };

// actions

/*
export const removeTaskAC = (taskId: string, todolistId: string) =>
  ({ type: "REMOVE-TASK", taskId, todolistId }) as const;
export const addTaskAC = (task: TaskType) => ({ type: "ADD-TASK", task }) as const;
export const updateTaskAC = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string) =>
  ({ type: "UPDATE-TASK", model, todolistId, taskId }) as const;
export const setTasksAC = (tasks: Array<TaskType>, todolistId: string) =>
  ({ type: "SET-TASKS", tasks, todolistId }) as const;
 */
