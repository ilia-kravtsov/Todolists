import React, {ChangeEvent, useCallback} from 'react';
import {Checkbox, IconButton} from "@mui/material";
import {EditableSpan} from "./EditableSpan";
import {Delete} from "@mui/icons-material";
import {TaskType} from "./Todolist";

type TaskComponentType = {
    task: TaskType
    onChangeHandler: (e: ChangeEvent<HTMLInputElement>) => void
    onTitleChangeHandler: (newValue: string) => void
    onClickHandler: () => void
}

export const Task: React.FC<TaskComponentType> = ({task,
                                                      onChangeHandler,
                                                      onTitleChangeHandler,
                                                      onClickHandler
                                                  }) => {

    const onTitleChangeHandlerCB = useCallback((newValue: string) => {
        onTitleChangeHandler(newValue)
    },[onTitleChangeHandler])

    return (
        <div key={task.id} className={task.isDone ? "is-done" : ""}>
            <Checkbox
                checked={task.isDone}
                color="primary"
                onChange={onChangeHandler}
            />

            <EditableSpan value={task.title} onChange={onTitleChangeHandlerCB} />
            <IconButton onClick={onClickHandler}>
                <Delete />
            </IconButton>
        </div>
    );
};

