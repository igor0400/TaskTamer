import { Injectable } from '@nestjs/common';
import { formatKeyboard } from '../common';
import { PaginationRepository } from './repositories/pagination.repository';
import { ChangePaginationPageProps, CreatePaginationProps } from './types';
import { InlineBtnType } from 'src/general';

@Injectable()
export class PaginationService {
  constructor(private readonly paginationRepository: PaginationRepository) {}

  async create(props: CreatePaginationProps) {
    const { userId, items } = props;

    await this.paginationRepository.destroyByUserId(userId);
    await this.paginationRepository.create({
      ...props,
      items: JSON.stringify(items),
    });

    return this.generateKeyboard(props);
  }

  async changePage({ userId, page }: ChangePaginationPageProps) {
    const pagination = await this.paginationRepository.findByUserId(userId);
    if (!pagination) return;

    const items = JSON.parse(pagination.items);

    return this.generateKeyboard({ ...pagination.dataValues, page, items });
  }

  private generateKeyboard({
    items,
    pageItemsCount = 20,
    rowLen = 5,
    isEmptyFill = false,
    isShowCount = false,
    dontHideNavbar = false,
    page = 0,
  }: CreatePaginationProps & ChangePaginationPageProps) {
    const viewItems = items.slice(
      page * pageItemsCount,
      page * pageItemsCount + pageItemsCount,
    );
    const navItems = [];
    const maxPage = Math.ceil(items.length / pageItemsCount);

    if (items.length > pageItemsCount || dontHideNavbar) {
      navItems.push({
        text: '◀️',
        callback_data: `${page}-${maxPage}-prev::pagination_nav_item`,
      });

      if (isShowCount) {
        navItems.push({
          text: `${page + 1}/${maxPage}`,
          callback_data: 'pagination_pages_count',
        });
      }

      navItems.push({
        text: '▶️',
        callback_data: `${page}-${maxPage}-next::pagination_nav_item`,
      });
    }

    const markedBtns = this.markingBtns(viewItems);

    return [...formatKeyboard(markedBtns, rowLen, isEmptyFill), navItems];
  }

  private markingBtns(btns: InlineBtnType[]): InlineBtnType[] {
    const markedBtns = [];

    for (let btn of btns) {
      markedBtns.push({ ...btn, callback_data: `${btn.callback_data}__pagin` });
    }

    return markedBtns;
  }
}
