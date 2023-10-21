import { RootState, appDispatch } from './store'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux/es/exports'

export const useAppDispatch = () => useDispatch<appDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
