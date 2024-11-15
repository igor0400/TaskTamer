import { Action, Command, Ctx, Update } from 'nestjs-telegraf';
import { MailingsService } from './mailings.service';
import { GeneralMiddlewares } from 'src/general/general.middlewares';
import { Context } from 'telegraf';
import { getCtxData } from 'src/libs/common';

@Update()
export class MailingsUpdate {
  constructor(
    private readonly middlewares: GeneralMiddlewares,
    private readonly mailingsService: MailingsService,
  ) {}

  @Command('mailing')
  async mailingCommand(@Ctx() ctx: Context) {
    await this.middlewares.commandMiddleware(ctx, (ctx: Context) =>
      this.mailingsService.changeToStartCreateMailing(ctx),
    );
  }

  @Action(/.*::cancel_mailing/)
  async cancelMailingBtn(@Ctx() ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.mailingsService.cancelMailing(ctx),
    );
  }

  @Action(/.*::apply_mailing/)
  async acceptMailingBtn(@Ctx() ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.mailingsService.acceptMailing(ctx),
    );
  }

  @Action('mailing_templates')
  async mailingTemplatesBtn(@Ctx() ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.mailingsService.changeToMailingTemplates(ctx),
    );
  }

  @Action(/.*::mailing_template_page/)
  async mailingTemplatePageBtn(@Ctx() ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.mailingsService.changeToMailingTemplate(ctx),
    );
  }

  @Action(/.*::mailing_confirm_by_template/)
  async mailingConfirmByTemplateBtn(@Ctx() ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.mailingsService.mailingConfirmByTemplate(ctx),
    );
  }

  @Action('back_create_mailing_template')
  async backCreateMailingTemplateBtn(@Ctx() ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.mailingsService.changeToStartCreateMailing(ctx, true),
    );
  }

  @Action('create_mailing_template')
  async createMailingTemplateBtn(@Ctx() ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.mailingsService.changeToStartCreateMailingTemplate(ctx),
    );
  }

  @Action('create_global_mailing_template')
  async createGlobalMailingTemplateBtn(@Ctx() ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.mailingsService.changeToSelectMailingTemplateType(ctx),
    );
  }

  @Action(/.*::delete_mailing_template_confirm/)
  async deleteMailingTemplateConfirmBtn(@Ctx() ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.mailingsService.changeToDeleteMailingTemplateConfirm(ctx),
    );
  }

  @Action(/.*::delete_mailing_template/)
  async deleteMailingTemplateBtn(@Ctx() ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.mailingsService.changeToDeleteMailingTemplate(ctx),
    );
  }

  @Action(/.*::create_typed_mailing_template/)
  async createTypedMailingTemplateBtn(@Ctx() ctx: Context) {
    const { dataValue } = getCtxData(ctx);

    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.mailingsService.changeToStartCreateMailingTemplate(ctx, dataValue),
    );
  }
}
