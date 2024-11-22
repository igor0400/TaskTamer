import { backBarInlineBtns, InlineBtnType } from 'src/general';
import { BasicNotification } from '../models/basic-notification.model';
import { CreatePaginationProps } from 'src/libs/pagination/types';

export const basicNotificationsMessage = () => `<b>Уведомления</b>

Список уведомлений которые требуют действия:`;

export const basicNotificationsMarkup = async (
  notifications: BasicNotification[],
  createPagination: (
    conf: Omit<CreatePaginationProps, 'userId'>,
  ) => Promise<InlineBtnType[][]>,
) => {
  const notificationsBtns = [];

  for (let { title, id } of notifications) {
    notificationsBtns.push({
      text: title,
      callback_data: `${id}::user_notification`,
    });
  }

  if (!notificationsBtns.length) {
    notificationsBtns.push({
      text: '📭 Список пуст',
      callback_data: 'empty_notifications',
    });
  }

  const pagination = await createPagination({
    items: notificationsBtns,
    pageItemsCount: 10,
    rowLen: 1,
    isShowCount: true,
  });

  return {
    inline_keyboard: [...pagination, ...backBarInlineBtns('back_to_profile')],
  };
};
