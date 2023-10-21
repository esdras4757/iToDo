import { Descriptions, notification } from 'antd'
import { ReactNode } from 'react'

type NotificationType = 'success' | 'info' | 'warning' | 'error' | 'open';

const openNotification = <T extends ReactNode>(
  type: NotificationType,
  message: string,
  duration: number = 3,
  description?:T
): void => {
  notification[type]({
    message: <div className={`${type == 'info' ? 'text-dark' : 'text-white'}`}>{message}</div>,
    description,
    duration
  })
}

export default openNotification
