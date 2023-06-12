import React from 'react';

export type TaskType = {
    id: string
    title: string
    isDone: boolean
}

export type TodolistType = {
    title: string
    tasks: Array<TaskType>
}

export const Todolist: React.FC<TodolistType> = ({title, tasks}) => {
    return (
        <div>
            <h3>{title}</h3>
            <div>
                <input/>
                <button>+</button>
            </div>
            <ul>
                {tasks.map(t => {
                    return (
                        <li><input type="checkbox" checked={t.isDone}/> <span>{t.title}</span></li>
                    )})}
            </ul>
            <div>
                <button>All</button>
                <button>Active</button>
                <button>Completed</button>
            </div>
        </div>
    );
};

