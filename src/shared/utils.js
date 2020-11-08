export function getRandomArrayItem(array) {
  return array[Math.round(Math.random() * (array.length - 1))];
}

export function getRandomArrayItemSet(array, count) {
  count = count || 1 + Math.round(Math.random() * (array.length - 2));
  const result = [];
  for (let i = 0; i < count; i += 1) {
    const item = array[Math.round(Math.random() * (array.length - 1))];
    if (!result.includes(item)) {
      result.push(item);
    }
  }
  return result;
}
