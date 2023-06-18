import axios from 'axios'

type TodolistType = {
    id: string
    addedDate: string
    order: number
    title: string
}

type CreateTodolistResponseType = {
    resultCode: number
    messages: Array<string>
    fieldsErrors: Array<string>
    data: {
        item: TodolistType
    }
}

type UpdateTodolistResponseType = {
    resultCode: number
    messages: Array<string>
    fieldsErrors: Array<string>
    data: {}
}

type DeleteTodolistResponseType = {
    resultCode: number
    messages: Array<string>
    fieldsErrors: Array<string>
    data: {}
}

export type ResponseType<D = {}> = {
    resultCode: number
    messages: Array<string>
    fieldsErrors: Array<string>
    data: D
}

const instance = axios.create({
    baseURL: 'https://social-network.samuraijs.com/api/1.1/',
    withCredentials: true,
    headers: {
        // Не забываем заменить API-KEY на собственный
        'API-KEY': '3f2a2590-abfa-42fb-bdbe-272bf5fe85c8',
    },
})

export const todolistAPI = {
    getTodolist() {
        return instance.get<Array<TodolistType>>(`https://social-network.samuraijs.com/api/1.1/todo-lists/`)
    },
    createTodolist(title: string) {
        return instance.post<ResponseType<{item: TodolistType}>>(`https://social-network.samuraijs.com/api/1.1/todo-lists/`, {title})
    },
    deleteTodolist(todolistId: string) {
        return instance.delete<ResponseType>(`https://social-network.samuraijs.com/api/1.1/todo-lists/${todolistId}`)
    },
    updateTodolist(todolistId: string, title: string) {
        return instance.put<ResponseType>(`https://social-network.samuraijs.com/api/1.1/todo-lists/${todolistId}`, {title})
    },
}

/* instance.get<Array<TodolistType>>
* типизация нужна для того чтобы в then(res => setState(res.data[0].)) была возможность видеть данные которые
* приходят в then
* */