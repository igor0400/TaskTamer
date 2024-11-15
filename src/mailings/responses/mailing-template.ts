import { localBackInlineBtn } from 'src/general';
import { MailingTemplate } from '../models/mailing-template.model';
import { UserRoles } from 'src/roles/models/user-roles.model';
import { isUserAdmin } from 'src/roles/assets';

export const mailingTemplateMessage = ({
  type,
  text,
  title,
}: MailingTemplate) =>
  `<b>${type ? 'Глобальный шаблон' : 'Шаблон'} рассылки "${title}":</b>
  
${text ?? ''}`;

export const mailingTemplateMarkup = (
  { id, type }: MailingTemplate,
  userRoles: UserRoles[],
) => ({
  inline_keyboard: [
    [
      {
        text: '📨 Разослать',
        callback_data: `${id}::mailing_confirm_by_template`,
      },
    ],
    !type || (type && isUserAdmin(userRoles))
      ? [
          {
            text: '🗑 Удалить',
            callback_data: `${id}::delete_mailing_template_confirm`,
          },
        ]
      : [],
    localBackInlineBtn('mailing_templates'),
  ],
});
