import { notification } from 'antd';

type NotificationType = 'success' | 'info' | 'warning' | 'error' | 'open';

const openNotification = (type: NotificationType, message: string): void => {
  notification[type]({
    message: <div className={`text-white`}>{message}</div>,
    duration: 3,
  });
};

export default openNotification;