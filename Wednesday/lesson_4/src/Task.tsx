import Checkbox from '@mui/material/Checkbox/Checkbox'
import React, {ChangeEvent, useCallback} from 'react'
import {EditableSpan} from './EditableSpan'
import {TaskType} from './Todolist'
import {IconButton} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {useDispatch} from "react-redux";
import {changeTaskStatusAC, changeTaskTitleAC, removeTaskAC} from "./state/tasks-reducer";

type TaskPropsType = {
    task: TaskType
    todolistId: string
}
export const Task = React.memo((props: TaskPropsType) => {

    const dispatch = useDispatch()

    const onClickHandler = () => dispatch(removeTaskAC(props.task.id, props.todolistId)) //props.removeTask(props.task.id, props.todolistId)
    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        let newIsDoneValue = e.currentTarget.checked
        dispatch(changeTaskStatusAC(props.task.id, newIsDoneValue, props.todolistId))
        //props.changeTaskStatus(props.task.id, newIsDoneValue, props.todolistId)
    }
    const onTitleChangeHandler = useCallback((newValue: string) => {
        dispatch(changeTaskTitleAC(props.task.id, newValue, props.todolistId))
       // props.changeTaskTitle(props.task.id, newValue, props.todolistId)
    }, [dispatch]);


    return <div key={props.task.id} className={props.task.isDone ? 'is-done' : ''}>
        <Checkbox
            checked={props.task.isDone}
            color="primary"
            onChange={onChangeHandler}
        />

        <EditableSpan value={props.task.title} onChange={onTitleChangeHandler}/>
        <IconButton onClick={onClickHandler}>
            <Delete/>
        </IconButton>
    </div>
})
