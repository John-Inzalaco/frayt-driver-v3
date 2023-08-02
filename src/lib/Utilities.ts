export const sleep = (time: number): Promise<void> =>
  new Promise(resolve => setTimeout(() => resolve(), time));

export function upsertArray<T>(array: T[], key: keyof T, element: T): T[] {
  const i = array.findIndex(_element => _element[key] === element[key]);

  if (i > -1) {
    array[i] = element;
  } else {
    array.push(element);
  }

  return array;
}
