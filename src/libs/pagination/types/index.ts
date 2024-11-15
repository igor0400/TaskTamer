import { InlineBtnType } from 'src/general';

export interface CreatePaginationProps {
  userId: string;
  items: InlineBtnType[];
  pageItemsCount?: number;
  rowLen?: number;
  isEmptyFill?: boolean;
  isShowCount?: boolean;
  dontHideNavbar?: boolean;
}

export interface ChangePaginationPageProps {
  userId: string;
  page?: number;
}
