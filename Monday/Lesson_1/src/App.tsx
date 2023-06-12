import React from 'react';
import './App.css';
import {TaskType, Todolist} from "./Todolist";
import {v1} from "uuid";

function App() {

    const tasks1: Array<TaskType> = [
        { id: v1(), title: "HTML&CSS", isDone: true },
        { id: v1(), title: "JS", isDone: true },
        { id: v1(), title: "ReactJS", isDone: false }
    ]
    const tasks2: Array<TaskType> = [
        { id: v1(), title: "Hello world", isDone: true },
        { id: v1(), title: "I am Happy", isDone: false },
        { id: v1(), title: "Yo", isDone: false }
    ]

    return (
        <div className="App">
            <Todolist title={'what to learn'} tasks={tasks1}/>
            <Todolist title={'what to buy'} tasks={tasks2}/>
        </div>
    );
}

export default App;
