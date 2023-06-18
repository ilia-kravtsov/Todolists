import React, {useEffect, useState} from 'react'
import axios from "axios";
import {log} from "util";
import {todolistAPI} from "./api/todolist-api";

export default {
    title: 'API'
}

const todolistId = '4f4a161a-87b8-4552-bc76-e2ec2795ba57'

export const GetTodolists = () => {
    const [state, setState] = useState<any>(null)
    useEffect(() => {
        todolistAPI.getTodolist()
            .then(res => setState(res.data))
    }, [])
    return <div>{JSON.stringify(state)}</div>
}
export const CreateTodolist = () => {
    const [state, setState] = useState<any>(null)

    const data = {
        title: 'newProdolist'
    }

    useEffect(() => {
        todolistAPI.createTodolist(data.title)
            .then(res => setState(res.data))
    }, [])

    return <div>{JSON.stringify(state)}</div>
}
export const DeleteTodolist = () => {
    const [state, setState] = useState<any>(null)
    useEffect(() => {
        todolistAPI.deleteTodolist(todolistId)
            .then(res => setState(res.data))
    }, [])

    return <div>{JSON.stringify(state)}</div>
}
export const UpdateTodolistTitle = () => {
    const [state, setState] = useState<any>(null)

    const data = {
        title: 'newestProdolist'
    }

    useEffect(() => {
        todolistAPI.updateTodolist(todolistId, data.title)
            .then(res => setState(res.data))
    }, [])

    return <div>{JSON.stringify(state)}</div>
}

