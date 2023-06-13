import React, {ChangeEvent, useState, KeyboardEvent} from 'react';

type EditableSpanType = {
    title: string
    onChange: (newTitle: string) => void
}

export const EditableSpan: React.FC<EditableSpanType> = ({title,onChange}) => {

    let [editMode, setEditMode] = useState<boolean>(false)
    let [newTitle, setNewTitle] = useState<string>(title)

    const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewTitle(e.currentTarget.value)
    }
    const activateEditMode = () => {
        setEditMode(true)
        setNewTitle(title)
    }
    const activateViewMode = () => {
        setEditMode(false)
        onChange(newTitle)
    }
    const onEnterPressHandler = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            activateViewMode()
        }
    }

    return editMode ? <input value={newTitle}
                             autoFocus
                             onChange={onInputChange}
                             onKeyDown={onEnterPressHandler}
                             onBlur={activateViewMode}/>
                    : <span onDoubleClick={activateEditMode}>{title}</span>
};

