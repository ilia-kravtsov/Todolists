import {
  AddTodolistActionType,
  RemoveTodolistActionType,
  SetTodolistsActionType,
  todolistsActions,
} from './todolists-reducer'
import {
  TaskPriorities,
  TaskStatuses,
  TaskType,
  todolistsAPI,
  UpdateTaskModelType,
} from '../../api/todolists-api'
import { Dispatch } from 'redux'
import { AppRootStateType, AppThunk } from '../../app/store'
import {
  setAppErrorAC,
  SetAppErrorActionType,
  setAppStatusAC,
  SetAppStatusActionType,
} from '../../app/app-reducer'
import { handleServerAppError, handleServerNetworkError } from '../../utils/error-utils'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const slice = createSlice({
  name: 'tasks',
  initialState: {} as TasksStateType,
  reducers: {
    removeTask: (state, action: PayloadAction<{ taskId: string; todolistId: string }>) => {
      //return { ...state, [action.todolistId]: state[action.todolistId].filter((t) => t.id != action.taskId) }
      let tasksForCurrentTodolist = state[action.payload.todolistId]
      const index = tasksForCurrentTodolist.findIndex((tl) => tl.id === action.payload.taskId)
      if (index !== -1) tasksForCurrentTodolist.splice(index, 1)
    },
    addTask: (state, action: PayloadAction<{ task: TaskType }>) => {
      // return { ...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId]]}
      let tasksForCurrentTodolist = state[action.payload.task.todoListId] as TaskType[]
      tasksForCurrentTodolist.unshift(action.payload.task)
    },
    updateTask: (
      state,
      action: PayloadAction<{
        taskId: string
        model: UpdateDomainTaskModelType
        todolistId: string
      }>,
    ) => {
      let tasks = state[action.payload.todolistId]
      const index = tasks.findIndex((t) => t.id === action.payload.taskId)
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...action.payload.model }
      }
    },
    setTasks: (state, action: PayloadAction<{ tasks: Array<TaskType>; todolistId: string }>) => {
      state[action.payload.todolistId] = action.payload.tasks
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(todolistsActions.addTodolistAC, (state, action) => {
        //return { ...state, [action.payload.todolist.id]: [] }
        state[action.payload.todolist.id] = []
      })
      .addCase(todolistsActions.removeTodolistAC, (state, action) => {
        delete state[action.payload.id]
      })
      .addCase(todolistsActions.setTodolistsAC, (state, action) => {
        action.payload.todolists.forEach((tl: any) => (state[tl.id] = []))
      })
      .addCase(todolistsActions.clearData, (state, action) => {
        return {}
      })
  },
})

export const tasksReducer = slice.reducer
export const tasksActions = slice.actions

// thunks
export const fetchTasksTC =
  (todolistId: string): AppThunk =>
  (dispatch) => {
    dispatch(setAppStatusAC({ status: 'loading' }))
    todolistsAPI.getTasks(todolistId).then((res) => {
      const tasks = res.data.items
      dispatch(tasksActions.setTasks({ tasks, todolistId }))
      dispatch(setAppStatusAC({ status: 'succeeded' }))
    })
  }
export const removeTaskTC =
  (taskId: string, todolistId: string): AppThunk =>
  (dispatch) => {
    todolistsAPI.deleteTask(todolistId, taskId).then((res) => {
      const action = tasksActions.removeTask({ taskId, todolistId })
      dispatch(action)
    })
  }
export const addTaskTC =
  (title: string, todolistId: string): AppThunk =>
  (dispatch) => {
    dispatch(setAppStatusAC({ status: 'loading' }))
    todolistsAPI
      .createTask(todolistId, title)
      .then((res) => {
        if (res.data.resultCode === 0) {
          dispatch(tasksActions.addTask({ task: res.data.data.item }))
          dispatch(setAppStatusAC({ status: 'succeeded' }))
        } else {
          handleServerAppError(res.data, dispatch)
        }
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch)
      })
  }
export const updateTaskTC =
  (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string): AppThunk =>
  (dispatch, getState: () => AppRootStateType) => {
    const state = getState()
    const task = state.tasks[todolistId].find((t) => t.id === taskId)
    if (!task) {
      //throw new Error("task not found in the state");
      console.warn('task not found in the state')
      return
    }

    const apiModel: UpdateTaskModelType = {
      deadline: task.deadline,
      description: task.description,
      priority: task.priority,
      startDate: task.startDate,
      title: task.title,
      status: task.status,
      ...domainModel,
    }

    todolistsAPI
      .updateTask(todolistId, taskId, apiModel)
      .then((res) => {
        if (res.data.resultCode === 0) {
          dispatch(tasksActions.updateTask({ taskId, model: domainModel, todolistId }))
        } else {
          handleServerAppError(res.data, dispatch)
        }
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch)
      })
  }

// types
export type UpdateDomainTaskModelType = {
  title?: string
  description?: string
  status?: TaskStatuses
  priority?: TaskPriorities
  startDate?: string
  deadline?: string
}
export type TasksStateType = {
  [key: string]: Array<TaskType>
}
