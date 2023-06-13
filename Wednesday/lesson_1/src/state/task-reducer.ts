import {v1} from "uuid";
import {TasksStateType} from "../App";
import {AddTodolistActionType, RemoveTodolistActionType} from "./todolists-reducer";

type ActionTasksTypes =
    | ReturnType<typeof removeTaskAC>
    | ReturnType<typeof addTaskAC>
    | ReturnType<typeof changeTaskStatusAC>
    | ReturnType<typeof changeTaskTitleAC>
    | AddTodolistActionType
    | RemoveTodolistActionType

export const tasksReducer = (state: TasksStateType, action: ActionTasksTypes) => {
    switch (action.type) {
        case 'REMOVE-TASK':
            return {...state, [action.todolistId]: state[action.todolistId].filter(t => t.id !== action.taskId)}
        case 'ADD-TASK':
            let newTask = {id: v1(), title: action.newTaskTitle, isDone: false }
            return {...state, [action.todolistId]: [newTask, ...state[action.todolistId]]}
        case 'CHANGE-TASK-STATUS':
            return {...state, [action.todolistId]: state[action.todolistId].map(t => t.id === action.taskId ? {...t, isDone: action.isDone} : t)}
        case 'CHANGE-TASK-TITLE':
            return {...state, [action.todolistId]: state[action.todolistId].map(t => t.id === action.taskId ? {...t, title: action.newTitle} : t)}
        case 'ADD-TODOLIST':
            return {...state, [action.todolistId]: []}
        case 'REMOVE-TODOLIST':
            let stateCopy = {...state}
            delete stateCopy[action.id]
            return stateCopy
        default:
            state
    }
}

export const removeTaskAC = (taskId: string, todolistId: string) => {
    return { type: 'REMOVE-TASK' as const, taskId, todolistId}
}

export const addTaskAC = (newTaskTitle: string, todolistId: string) => {
    return { type: 'ADD-TASK' as const, newTaskTitle, todolistId}
}

export const changeTaskStatusAC = (taskId: string, isDone: boolean, todolistId: string) => {
    return { type: 'CHANGE-TASK-STATUS' as const, taskId, isDone, todolistId}
}

export const changeTaskTitleAC = (taskId: string, todolistId: string, newTitle: string) => {
    return { type: 'CHANGE-TASK-TITLE' as const, taskId, todolistId, newTitle}
}