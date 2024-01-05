import {useAppDispatch, useAppSelector} from "../app/store";
import {fetchTodolistsTC, TodolistDomainType} from "../features/TodolistsList/todolists-reducer";
import {TasksStateType} from "../features/TodolistsList/tasks-reducer";
import {useEffect} from "react";

export const useCustomHook = () => {
    const todolists = useAppSelector<Array<TodolistDomainType>>(state => state.todolists)
    const tasks = useAppSelector<TasksStateType>(state => state.tasks)

    const dispatch = useAppDispatch()

    useEffect(() => {
        const thunk = fetchTodolistsTC()
        dispatch(thunk)
    }, [])

    return {
        todolists,
        tasks,
        dispatch
    }
}