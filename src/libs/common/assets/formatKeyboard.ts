import { getEmptyBtns } from 'src/calendar/assets';
import { InlineBtnType } from 'src/general';

export const formatKeyboard = (
  arr: InlineBtnType[],
  rowLen = 2,
  isEmptyFill = false,
) => {
  const keyboardItems = [];
  let prepeadedItems = [];
  let index = 0;

  for (let item of arr) {
    prepeadedItems.push(item);

    if (prepeadedItems.length >= rowLen || index === arr.length - 1) {
      if (isEmptyFill && index === arr.length - 1) {
        prepeadedItems.push(...getEmptyBtns(rowLen - prepeadedItems.length));
      }

      keyboardItems.push(prepeadedItems);
      prepeadedItems = [];
    }
    index++;
  }

  return keyboardItems;
};
