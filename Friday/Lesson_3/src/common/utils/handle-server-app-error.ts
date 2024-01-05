import { Dispatch } from "redux";
import { appActions } from "app/app.reducer";
import { BaseResponseType } from "common/types/common.types";

/**
 * Обрабатывает ошибки полученные с сервера
 * @param data - объект ответа от сервера содержащий информацию об ошибке и другие данные
 * @param dispatch - функция отправки действий в хранилище Redux или аналогичном контейнере состояния приложения
 * @param showError - флаг определяющий нужно ли отображать сообщение об ошибке для пользователя
 * @returns функция не возвращает значения
 */
export const handleServerAppError = <D>(data: BaseResponseType<D>, dispatch: Dispatch, showError: boolean = true) => {
  if (showError) {
    // if (data.messages.length) {
    //   dispatch(appActions.setAppError({ error: data.messages[0] }));
    // } else {
    //   dispatch(appActions.setAppError({ error: "Some error occurred" }));
    // }
    dispatch(appActions.setAppError({error: data.messages.length ? data.messages[0] : "Some error occurred"}))
  }
  dispatch(appActions.setAppStatus({ status: "failed" }));
};
