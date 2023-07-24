import { appReducer, RequestStatusType, setAppErrorAC, setAppStatusAC } from './app-reducer'

export type InitialStateType = {
  // происходит ли сейчас взаимодействие с сервером
  status: RequestStatusType
  // если ошибка какая-то глобальная произойдёт - мы запишем текст ошибки сюда
  error: string | null
  // true когда приложение проинициализировалось (проверили юзера, настройки получили и т.д.)
  isInitialized: boolean
}
let startState: InitialStateType

beforeEach(() => {
  startState = {
    error: null,
    status: 'idle',
    isInitialized: false,
  }
})

test('correct error message should be set', () => {
  const endState = appReducer(startState, setAppErrorAC({ error: 'some error' }))
  expect(endState.error).toBe('some error')
})

test('correct status should be set', () => {
  const endState = appReducer(startState, setAppStatusAC({ status: 'loading' }))
  expect(endState.status).toBe('loading')
})
