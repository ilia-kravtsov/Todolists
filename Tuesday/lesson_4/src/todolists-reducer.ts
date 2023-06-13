import {TodolistType} from "./App";
import {v1} from "uuid";

type ActionTypes =
    | ReturnType<typeof removeTodolistAC>
    | ReturnType<typeof addTodolistAC>
    | ReturnType<typeof changeTodolistTitleAC>
    | ReturnType<typeof changeTodolistFilterAC>

export const todolistsReducer = (state: Array<TodolistType>, action: ActionTypes) => {
    switch (action.type) {
        case 'REMOVE-TODOLIST':
            return state.filter(t => t.id !== action.id)
        case 'ADD-TODOLIST':
            const newTodolist = {id: v1(), title: action.title, filter: 'all'}
            return [...state, newTodolist]
        case 'CHANGE-TODOLIST-TITLE':
            return state.map(t => t.id === action.id ? {...t, title: action.title}: t)
        case 'CHANGE-TODOLIST-FILTER':
            return state.map(t => t.id === action.id ? {...t, filter: action.filter}: t)
        default:
            return state
    }
}

export const removeTodolistAC = (id: string) => ({type: 'REMOVE-TODOLIST' as const, id})
export const addTodolistAC = (title: string) => ({type: 'ADD-TODOLIST' as const, title})
export const changeTodolistTitleAC = (id: string, title: string) => ({type: 'CHANGE-TODOLIST-TITLE' as const, id, title})
export const changeTodolistFilterAC = (id: string, filter: string) => ({type: 'CHANGE-TODOLIST-FILTER' as const, id, filter})