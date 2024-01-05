import {handleServerNetworkError} from "utils/handleServerNetworkError";
import {appActions} from "app/app.reducer";
import {todolistsThunks} from "features/TodolistsList/todolists.reducer";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {clearTasksAndTodolists} from "common/actions/common.actions";
import {createAppAsyncThunk} from "utils/createAppAsynsThunk";
import {handleServerAppError} from "utils";
import {
    CreateTaskArgs, TaskPriorities, TaskStatuses,
    TaskType,
    todolistsAPI,
    UpdateTaskArgs,
    UpdateTaskModelType
} from "features/TodolistsList/todolistsAPI";


const initialState: TasksStateType = {};

const slice = createSlice({
    name: "tasks",
    initialState,
    reducers: {
        // removeTask: (state, action: PayloadAction<{ taskId: string; todolistId: string }>) => {
        //     const tasks = state[action.payload.todolistId];
        //     const index = tasks.findIndex((t) => t.id === action.payload.taskId);
        //     if (index !== -1) tasks.splice(index, 1);
        // },
        // addTask: (state, action: PayloadAction<{ task: TaskType }>) => {
        //   const tasks = state[action.payload.task.todoListId];
        //   tasks.unshift(action.payload.task);
        // },
        // updateTask: (
        //     state,
        //     action: PayloadAction<{
        //         taskId: string;
        //         model: UpdateDomainTaskModelType;
        //         todolistId: string;
        //     }>
        // ) => {
        //     const tasks = state[action.payload.todolistId];
        //     const index = tasks.findIndex((t) => t.id === action.payload.taskId);
        //     if (index !== -1) {
        //         tasks[index] = {...tasks[index], ...action.payload.model};
        //     }
        // },
        // setTasks: (state, action: PayloadAction<{ tasks: Array<TaskType>; todolistId: string }>) => {
        //   state[action.payload.todolistId] = action.payload.tasks;
        // },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state[action.payload.todolistId] = action.payload.tasks;
            })
            // .addCase(fetchTasks.rejected, (state, action) => {
            //
            // })
            .addCase(addTask.fulfilled, (state, action) => {
                const tasks = state[action.payload.task.todoListId];
                tasks.unshift(action.payload.task);
            })
            .addCase(updateTask.fulfilled,(state, action) => {
                const tasks = state[action.payload.todolistId];
                const index = tasks.findIndex((t) => t.id === action.payload.taskId);
                if (index !== -1) {
                    tasks[index] = {...tasks[index], ...action.payload.domainModel};
                }
            })
            .addCase(removeTask.fulfilled, (state, action) => {
                const tasks = state[action.payload.todolistId];
                const index = tasks.findIndex((t) => t.id === action.payload.taskId);
                if (index !== -1) tasks.splice(index, 1);
            })
            .addCase(todolistsThunks.addTodolist.fulfilled, (state, action) => {
                state[action.payload.todolist.id] = [];
            })
            .addCase(todolistsThunks.removeTodolist.fulfilled, (state, action) => {
                delete state[action.payload.id];
            })
            .addCase(todolistsThunks.fetchTodolists.fulfilled, (state, action) => {
                action.payload.todolists.forEach((tl) => state[tl.id] = []);
            })
            .addCase(clearTasksAndTodolists, () => {
                return {};
            });
    },
});

// thunks
export const fetchTasks = createAppAsyncThunk<{ tasks: TaskType[], todolistId: string }, string>(`${slice.name}/fetchTasks`,
    async (todolistId: string, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI

        try {
            dispatch(appActions.setAppStatus({status: "loading"}));
            const res = await todolistsAPI.getTasks(todolistId)
            const tasks = res.data.items;
            // dispatch(tasksActions.setTasks({ tasks, todolistId }));
            dispatch(appActions.setAppStatus({status: "succeeded"}));
            return {tasks, todolistId} // возвращаю то значение которое должно попасть в state в addCase он будет в payload
        } catch (e) {
            handleServerNetworkError(e, dispatch)
            return rejectWithValue(null)
        }
    })

// export const fetchTasksTC =
//   (todolistId: string): AppThunk =>
//   (dispatch) => {
//     dispatch(appActions.setAppStatus({ status: "loading" }));
//     todolistsAPI.getTasks(todolistId).then((res) => {
//       const tasks = res.data.items;
//       dispatch(tasksActions.setTasks({ tasks, todolistId }));
//       dispatch(appActions.setAppStatus({ status: "succeeded" }));
//     });
//   };

// export const removeTaskTC =
//     (taskId: string, todolistId: string): AppThunk =>
//         (dispatch) => {
//             todolistsAPI.deleteTask(todolistId, taskId).then(() => {
//                 dispatch(tasksActions.removeTask({taskId, todolistId}));
//             });
//         };

export enum ResultCode {
    success,
    error,
    captcha = 10
}

const ResultCodeConst = {
    success: 0,
    error: 1,
    captcha: 10
} as const

const removeTask = createAppAsyncThunk<{taskId: string, todolistId: string},{taskId: string, todolistId: string}>(`${slice.name}/removeTask`,
    async (arg, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI;
        const {taskId, todolistId} = arg;
        try {
            dispatch(appActions.setAppStatus({status: 'loading'}));
            const res = await todolistsAPI.deleteTask(todolistId, taskId)
            if (res.data.resultCode === ResultCode.success) {
                // dispatch(tasksActions.removeTask({taskId, todolistId}));
                dispatch(appActions.setAppStatus({status: "succeeded"}));
                return {taskId, todolistId}
            } else {
                handleServerAppError(res.data, dispatch);
                return rejectWithValue(null)
            }
        } catch (e) {
            handleServerNetworkError(e, dispatch)
            return rejectWithValue(null)
        }
    })

type ResultCodeConst = (typeof ResultCodeConst)[keyof typeof ResultCodeConst]

const addTask = createAppAsyncThunk<{task: TaskType}, CreateTaskArgs>(
    `${slice.name}/addTask`,
    async (arg, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI;
        try {
            dispatch(appActions.setAppStatus({status: 'loading'}));
            const res = await todolistsAPI.createTask(arg)
            if (res.data.resultCode === ResultCode.success) {
                const task = res.data.data.item;
                // dispatch(tasksActions.addTask({ task }));
                dispatch(appActions.setAppStatus({status: "succeeded"}));
                return {task}
            } else {
                handleServerAppError(res.data, dispatch);
                return rejectWithValue(null)
            }
        } catch (e) {
            handleServerNetworkError(e, dispatch)
            return rejectWithValue(null)
        }
    })

// export const addTaskTC =
//     (title: string, todolistId: string): AppThunk =>
//         (dispatch) => {
//             dispatch(appActions.setAppStatus({status: "loading"}));
//             todolistsAPI
//                 .createTask(todolistId, title)
//                 .then((res) => {
//                     if (res.data.resultCode === 0) {
//                         const task = res.data.data.item;
//                         dispatch(tasksActions.addTask({task}));
//                         dispatch(appActions.setAppStatus({status: "succeeded"}));
//                     } else {
//                         handleServerAppError(res.data, dispatch);
//                     }
//                 })
//                 .catch((error) => {
//                     handleServerNetworkError(error, dispatch);
//                 });
//         };

const updateTask = createAppAsyncThunk<UpdateTaskArgs,UpdateTaskArgs>(`${slice.name}/updateTask`,
    async (arg, thunkAPI) => {
        const {dispatch, rejectWithValue,getState} = thunkAPI;
        const {taskId,domainModel,todolistId} = arg

        const state = getState();
        const task = state.tasks[todolistId].find((t) => t.id === taskId);
        if (!task) {
            //throw new Error("task not found in the state");
            console.warn("task not found in the state");
            return rejectWithValue(null)
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

        try {
            dispatch(appActions.setAppStatus({status: 'loading'}));
            const res = await todolistsAPI
                .updateTask(todolistId, taskId, apiModel)
                    if (res.data.resultCode === 0) {
                        // dispatch(tasksActions.updateTask({taskId, model: domainModel, todolistId}));
                        dispatch(appActions.setAppStatus({status: "succeeded"}));
                        return {taskId, domainModel, todolistId}
                    } else {
                        handleServerAppError(res.data, dispatch);
                        return rejectWithValue(null)
                    }
        } catch (e) {
            handleServerNetworkError(e, dispatch);
            return rejectWithValue(null)
        }
    })

// export const updateTaskTC =
//     (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string): AppThunk =>
//         (dispatch, getState) => {
//             const state = getState();
//             const task = state.tasks[todolistId].find((t) => t.id === taskId);
//             if (!task) {
//                 //throw new Error("task not found in the state");
//                 console.warn("task not found in the state");
//                 return;
//             }
//
//             const apiModel: UpdateTaskModelType = {
//                 deadline: task.deadline,
//                 description: task.description,
//                 priority: task.priority,
//                 startDate: task.startDate,
//                 title: task.title,
//                 status: task.status,
//                 ...domainModel,
//             };
//
//             todolistsAPI
//                 .updateTask(todolistId, taskId, apiModel)
//                 .then((res) => {
//                     if (res.data.resultCode === 0) {
//                         dispatch(tasksActions.updateTask({taskId, model: domainModel, todolistId}));
//                     } else {
//                         handleServerAppError(res.data, dispatch);
//                     }
//                 })
//                 .catch((error) => {
//                     handleServerNetworkError(error, dispatch);
//                 });
//         };

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

export const tasksReducer = slice.reducer;
export const tasksActions = slice.actions;
export const tasksThunks = {fetchTasks, addTask, updateTask, removeTask}