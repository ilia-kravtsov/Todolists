import React, {useState} from 'react';
import './App.css';
import {TaskType, Todolist} from './Todolist';
import {v1} from 'uuid';

export type TodolistsType = {
    id: string
    title: string
    filter: FilterValuesType
}

export type FilterValuesType = "all" | "active" | "completed";

export type TasksStateType = {
    [key: string] : Array<TaskType>
}

function App() {

    let todolistID1 = v1()
    let todolistID2 = v1()

    let [todolists, setTodolists] = useState<Array<TodolistsType>>([
        {id: todolistID1, title: 'What to learn', filter: 'all'},
        {id: todolistID2, title: 'What to buy', filter: 'all'},
    ])

    let [tasks, setTasks] = useState<TasksStateType>({
        [todolistID1]: [
            {id: v1(), title: 'HTML&CSS', isDone: true},
            {id: v1(), title: 'JS', isDone: true},
            {id: v1(), title: 'ReactJS', isDone: false},

        ],
        [todolistID2]: [
            {id: v1(), title: 'Rest API', isDone: true},
            {id: v1(), title: 'GraphQL', isDone: false},
        ]
    })


    function removeTask(taskId: string, todolistId: string) {

        const updatedTasks = tasks[todolistId].filter(t => t.id !== taskId)
        setTasks({...tasks, [todolistId]: updatedTasks})

        // let newTasks = tasks.filter(t => t.id != taskId);
        // setTasks(newTasks);
    }

    function addTask(title: string, todolistId: string) {

        const task = {id: v1(), title: title, isDone: false};
        setTasks({...tasks, [todolistId]: [task, ...tasks[todolistId]]})

        // let task = {id: v1(), title: title, isDone: false};
        // let newTasks = [task, ...tasks];
        // setTasks(newTasks);
    }

    function changeStatus(taskId: string, isDone: boolean, todolistId: string) {

        const updatedTasks = tasks[todolistId].map(t => t.id === taskId ? {...t, isDone} : t)
        setTasks({...tasks, [todolistId]: updatedTasks})

        // let task = tasks.find(t => t.id === taskId);
        // if (task) {
        //     task.isDone = isDone;
        // }
        // setTasks([...tasks]);
    }

    function changeFilter(filter: FilterValuesType, todolistId: string) {
        const newTodolists = todolists.map(t => t.id === todolistId? {...t, filter} : t)
        setTodolists(newTodolists)
    }

    function removeTodolist(todolistId: string) {
        const updatedTodolists = todolists.filter(t => t.id !== todolistId)
        setTodolists(updatedTodolists)
        //setTasks({...tasks, [todolistId]: []})
        delete tasks[todolistId]
        setTasks({...tasks})
    }

    return (
        <div className="App">
            {
                todolists.map(todolist => {

                    let allTodolistTasks = tasks[todolist.id]

                    if (todolist.filter === "active") {
                        allTodolistTasks = allTodolistTasks.filter(t => !t.isDone);
                    }
                    if (todolist.filter === "completed") {
                        allTodolistTasks = allTodolistTasks.filter(t => t.isDone);
                    }

                    return <Todolist key={todolist.id}
                                     todolistId={todolist.id}
                                     title={todolist.title}
                                     tasks={allTodolistTasks}
                                     removeTask={removeTask}
                                     changeFilter={changeFilter}
                                     addTask={addTask}
                                     changeTaskStatus={changeStatus}
                                     removeTodolist={removeTodolist}
                                     filter={todolist.filter}
                    />
                })
            }
            {/*<Todolist title="What to learn"*/}
            {/*          tasks={tasksForTodolist}*/}
            {/*          removeTask={removeTask}*/}
            {/*          changeFilter={changeFilter}*/}
            {/*          addTask={addTask}*/}
            {/*          changeTaskStatus={changeStatus}*/}
            {/*          filter={filter}*/}
            {/*/>*/}
        </div>
    );
}

export default App;

/*
 const newTodolists = todolists.filter(t => t.id === todolistId? t.filter = value : t)
       setTodolists(newTodolists)
 */