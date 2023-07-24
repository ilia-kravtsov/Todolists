import { todolistsAPI, TodolistType } from '../../api/todolists-api'
import { Dispatch } from 'redux'
import {
  RequestStatusType,
  SetAppErrorActionType,
  setAppStatusAC,
  SetAppStatusActionType,
} from 'app/app-reducer'
import { handleServerNetworkError } from '../../utils/error-utils'
import { AppThunk } from '../../app/store'
import { createSlice, current, PayloadAction } from '@reduxjs/toolkit'
import { fetchTasksTC } from 'features/TodolistsList/tasks-reducer'

const slice = createSlice({
  name: 'todolists',
  initialState: [] as Array<TodolistDomainType>,
  reducers: {
    removeTodolistAC(state, action: PayloadAction<{ id: string }>) {
      // console.log('state: ', current(state)); - how to see the state in immer
      // recommend way
      const index = state.findIndex((tl) => tl.id === action.payload.id)
      if (index > -1) state.splice(index, 1)
      // 2 variant
      // return state.filter(tl => tl.id != action.payload.id)
      // свойство state изменить мутабельно можно а весь стейт - запрещено
    },
    addTodolistAC(state, action: PayloadAction<{ todolist: TodolistType }>) {
      state.unshift({ ...action.payload.todolist, filter: 'all', entityStatus: 'idle' })
    },
    changeTodolistTitleAC(state, action: PayloadAction<{ id: string; title: string }>) {
      // 1
      // const index = state.findIndex((tl) => tl.id === action.payload.id)
      // if (index !== -1) state[index].title = action.payload.title
      // 2
      const todo = state.find(todo => todo.id === action.payload.id)
      if (todo) todo.title = action.payload.title
    },
    changeTodolistFilterAC(state, action: PayloadAction<{ id: string; filter: FilterValuesType }>) {
      const index = state.findIndex((tl) => tl.id === action.payload.id)
      state[index].filter = action.payload.filter
    },
    changeTodolistEntityStatusAC(state, action: PayloadAction<{ id: string; status: RequestStatusType }>,) {
      const index = state.findIndex((tl) => tl.id === action.payload.id)
      state[index].entityStatus = action.payload.status
    },
    setTodolistsAC(state, action: PayloadAction<{ todolists: Array<TodolistType> }>) {
      //return action.payload.todolists.map((tl) => ({ ...tl, filter: 'all', entityStatus: 'idle' }))
      action.payload.todolists.forEach(tl => state.push({ ...tl, filter: 'all', entityStatus: 'idle' }))
    },
    clearData(state, action) {
      return []
    },
  },
  extraReducers: {},
})

export const todolistsReducer = slice.reducer
export const todolistsActions = slice.actions

// thunks
export const fetchTodolistsTC = (): AppThunk => {
  return (dispatch) => {
    dispatch(setAppStatusAC({ status: 'loading' }))
    todolistsAPI
      .getTodolists()
      .then((res) => {
        dispatch(todolistsActions.setTodolistsAC({ todolists: res.data }))
        dispatch(setAppStatusAC({ status: 'succeeded' }))
        return res.data
      })
      .then((todos) => {
        todos.forEach((tl) => {
          dispatch(fetchTasksTC(tl.id))
        })
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch)
      })
  }
}
export const removeTodolistTC = (todolistId: string) => {
  return (dispatch: Dispatch) => {
    //изменим глобальный статус приложения, чтобы вверху полоса побежала
    dispatch(setAppStatusAC({ status: 'loading' }))
    //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
    dispatch(todolistsActions.changeTodolistEntityStatusAC({ id: todolistId, status: 'loading' }))
    todolistsAPI.deleteTodolist(todolistId).then((res) => {
      dispatch(todolistsActions.removeTodolistAC({ id: todolistId }))
      //скажем глобально приложению, что асинхронная операция завершена
      dispatch(setAppStatusAC({ status: 'succeeded' }))
    })
  }
}
export const addTodolistTC = (title: string) => {
  return (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({ status: 'loading' }))
    todolistsAPI.createTodolist(title).then((res) => {
      dispatch(todolistsActions.addTodolistAC({ todolist: res.data.data.item }))
      dispatch(setAppStatusAC({ status: 'succeeded' }))
    })
  }
}
export const changeTodolistTitleTC = (id: string, title: string) => {
  return (dispatch: Dispatch) => {
    todolistsAPI.updateTodolist(id, title).then((res) => {
      dispatch(todolistsActions.changeTodolistTitleAC({ id, title }))
    })
  }
}

// types
export type AddTodolistActionType = ReturnType<typeof todolistsActions.addTodolistAC>
export type RemoveTodolistActionType = ReturnType<typeof todolistsActions.removeTodolistAC>
export type SetTodolistsActionType = ReturnType<typeof todolistsActions.setTodolistsAC>

export type FilterValuesType = 'all' | 'active' | 'completed'
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType
  entityStatus: RequestStatusType
}
// // actions
// export const removeTodolistAC = (id: string) => ({type: 'REMOVE-TODOLIST', id} as const)
// export const addTodolistAC = (todolist: TodolistType) => ({type: 'ADD-TODOLIST', todolist} as const)
// export const changeTodolistTitleAC = (id: string, title: string) => ({
//     type: 'CHANGE-TODOLIST-TITLE',
//     id,
//     title
// } as const)
// export const changeTodolistFilterAC = (id: string, filter: FilterValuesType) => ({
//     type: 'CHANGE-TODOLIST-FILTER',
//     id,
//     filter
// } as const)
// export const changeTodolistEntityStatusAC = (id: string, status: RequestStatusType) => ({
//     type: 'CHANGE-TODOLIST-ENTITY-STATUS', id, status } as const)
// export const setTodolistsAC = (todolists: Array<TodolistType>) => ({type: 'SET-TODOLISTS', todolists} as const)

// type ThunkDispatch = Dispatch<ActionTypes | SetAppStatusActionType | SetAppErrorActionType>
// type ActionsType =
//     | RemoveTodolistActionType
//     | AddTodolistActionType
//     | ReturnType<typeof changeTodolistTitleAC>
//     | ReturnType<typeof changeTodolistFilterAC>
//     | SetTodolistsActionType
//     | ReturnType<typeof changeTodolistEntityStatusAC>
/*
export const todolistsReducer = (state: Array<TodolistDomainType> = initialState, action: ActionsType): Array<TodolistDomainType> => {
    switch (action.type) {
        case 'REMOVE-TODOLIST':
            return state.filter(tl => tl.id != action.id)
        case 'ADD-TODOLIST':
            return [{...action.todolist, filter: 'all', entityStatus: 'idle'}, ...state]
        case 'CHANGE-TODOLIST-TITLE':
            return state.map(tl => tl.id === action.id ? {...tl, title: action.title} : tl)
        case 'CHANGE-TODOLIST-FILTER':
            return state.map(tl => tl.id === action.id ? {...tl, filter: action.filter} : tl)
        case 'CHANGE-TODOLIST-ENTITY-STATUS':
            return state.map(tl => tl.id === action.id ? {...tl, entityStatus: action.status} : tl)
        case 'SET-TODOLISTS':
            return action.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        default:
            return state
    }
}

// actions
// export const removeTodolistAC = (id: string) => ({type: 'REMOVE-TODOLIST', id} as const)
// export const addTodolistAC = (todolist: TodolistType) => ({type: 'ADD-TODOLIST', todolist} as const)
// export const changeTodolistTitleAC = (id: string, title: string) => ({
//     type: 'CHANGE-TODOLIST-TITLE',
//     id,
//     title
// } as const)
// export const changeTodolistFilterAC = (id: string, filter: FilterValuesType) => ({
//     type: 'CHANGE-TODOLIST-FILTER',
//     id,
//     filter
// } as const)
// export const changeTodolistEntityStatusAC = (id: string, status: RequestStatusType) => ({
//     type: 'CHANGE-TODOLIST-ENTITY-STATUS', id, status } as const)
// export const setTodolistsAC = (todolists: Array<TodolistType>) => ({type: 'SET-TODOLISTS', todolists} as const)
 */
