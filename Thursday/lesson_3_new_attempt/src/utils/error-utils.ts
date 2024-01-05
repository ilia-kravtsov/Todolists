import {setErrorAC, setStatusAC} from "../app/app_reducer";
import {Dispatch} from "redux";
import {ResponseType} from "../api/todolists-api";

export const handleServerAppError = <D>(dispatch: Dispatch, data: ResponseType<D>) => {
    if (data.messages.length) {
        dispatch(setErrorAC(data.messages[0]))
    } else {
        dispatch(setErrorAC('something went wrong, you need to appeal to customer support'))
    }
    dispatch(setStatusAC('failed'))
}

export const handleServerNetworkError = (dispatch: Dispatch, errorMessage: string) => {
    dispatch(setStatusAC('failed'))
    dispatch(setErrorAC(errorMessage))
}