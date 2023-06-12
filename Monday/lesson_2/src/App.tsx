import React, {useState} from 'react';
import './App.css';
import {TaskType, Todolist} from './Todolist';
import {fdatasyncSync} from "fs";

export type FilterType = 'all' | 'active' | 'completed'

function App() {

    let [tasks, setTasks] = useState<Array<TaskType>>([
            { id: 1, title: "HTML&CSS", isDone: true },
            { id: 2, title: "JS", isDone: true },
            { id: 3, title: "ReactJS", isDone: false },
    ])
    let [filter, setFilter] = useState<FilterType>('all')

    const removeTask = (id: number) => {
        const newTasks = tasks.filter(t => t.id !== id)
        setTasks(newTasks)
    }
    const changeFilter = (filterValue: FilterType) => {
        setFilter(filterValue)
    }

    const getfilteredTasks = (tasks: Array<TaskType>) => {
        switch (filter) {
            case "completed":
                return tasks.filter(t => t.isDone)
            case "active":
                return tasks.filter(t => !t.isDone)
            default:
                return tasks
        }
    }
    const filteredTasks = getfilteredTasks(tasks)

    return (
        <div className="App">
            <Todolist title="What to learn"
                      tasks={filteredTasks}
                      removeTask={removeTask}
                      changeFilter={changeFilter}
            />
        </div>
    );
}

export default App;
