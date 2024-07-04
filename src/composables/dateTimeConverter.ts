export function formatToDateTime(time) {
  const date = new Date(time);
  if (isNaN(date.getTime())) throw new Error('Neispravan format');

  let minutes = String(date.getMinutes());
  if (Number(minutes) < 10) minutes = `0${minutes}`;

  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}. at ${date.getHours()}:${minutes}`;
}

export function formatToDate(time) {
  const date = new Date(time);
  if (isNaN(date.getTime())) throw new Error('Neispravan format');

  let day: string | number = date.getDate();
  if (day < 10) day = `0${day}`;
  let month: string | number = date.getMonth() + 1;
  if (month < 10) month = `0${month}`;

  return `${day}.${month}.${date.getFullYear()}.`;
}

export function formatToTime(time) {
  const date = new Date(time);
  if (isNaN(date.getTime())) throw new Error('Neispravan format');

  let minutes = String(date.getMinutes());
  if (Number(minutes) < 10) minutes = `0${minutes}`;

  return `${date.getHours()}:${minutes} h`;
}

export function formatToFilterDate(time) {
  const date = new Date(time);
  if (isNaN(date.getTime())) throw new Error('Neispravan format');

  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date.toISOString();
}
