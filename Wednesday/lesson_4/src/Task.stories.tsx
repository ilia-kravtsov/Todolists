import type {Meta, StoryObj} from '@storybook/react';
import {Task} from "./Task";
import {useSelector} from "react-redux";
import {AppRootStateType} from "./state/store";
import {TaskType} from "./Todolist";
import {ReduxStoreProviderDecorator} from "./stories/decorators/ReduxStoreProviderDecorator";

// More on how to set up stories at:
// https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof Task> = {
    title: 'TODOLISTS/Task',
    component: Task,
    // This component will have an automatically generated Autodocs entry:
    // https://storybook.js.org/docs/react/writing-docs/autodocs
    tags: ['autodocs'],
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
    decorators: [ReduxStoreProviderDecorator],
};

export default meta;

type Story = StoryObj<typeof Task>;

const TaskWithRedux = () => {

    let task = useSelector<AppRootStateType, TaskType>(state => state.tasks["todolistId1"][0])
    if (!task) task = {id: 'qwer', title: 'defaultTask', isDone: false}
    return <Task task={task}
                 todolistId={"todolistId1"}
    />
}

export const TaskStory: Story = {
    render: () => <TaskWithRedux/>
}
