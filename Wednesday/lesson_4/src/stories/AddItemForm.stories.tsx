import type {Meta, StoryObj} from '@storybook/react';
import {action} from '@storybook/addon-actions'
import {AddItemForm, AddItemFormPropsType} from "../AddItemForm";
import React, {ChangeEvent, KeyboardEvent, useState} from "react";
import TextField from "@mui/material/TextField/TextField";
import {IconButton} from "@mui/material";
import {AddBox} from "@mui/icons-material";

const meta: Meta<typeof AddItemForm> = {
    title: 'TODOLISTS/AddItemForm',
    component: AddItemForm,
    tags: ['autodocs'],
    argTypes: {
        addItem: {
            description: 'Button clicked inside form',
            action: 'clicked'
        }
    },
};
export default meta
type Story = StoryObj<typeof AddItemForm>;
//_____________________________________________Story
export const AddItemFormStory: Story = {
    args: {
        addItem: action('Button clicked inside form')
    },
};
//_____________________________________________Story
const AddItemFormWithError = (args: AddItemFormPropsType) => {
    let [title, setTitle] = useState("")
    let [error, setError] = useState<string | null>("Title is required")

    const addItem = () => {
        if (title.trim() !== "") {
            args.addItem(title);
            setTitle("");
        } else {
            setError("Title is required");
        }
    }

    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        setTitle(e.currentTarget.value)
    }

    const onKeyPressHandler = (e: KeyboardEvent<HTMLInputElement>) => {
        if (error !== null) {
            setError(null);
        }
        if (e.charCode === 13) {
            addItem();
        }
    }

    return <div>
        <TextField variant="outlined"
                   error={!!error}
                   value={title}
                   onChange={onChangeHandler}
                   onKeyPress={onKeyPressHandler}
                   label="Title"
                   helperText={error}
        />
        <IconButton color="primary" onClick={addItem}>
            <AddBox />
        </IconButton>
    </div>
}
//_____________________________________________Story
export const AddItemFormWithErrorStory: Story = {
    render: (args) => <AddItemFormWithError addItem={args.addItem}/>
}
//_____________________________________________Story