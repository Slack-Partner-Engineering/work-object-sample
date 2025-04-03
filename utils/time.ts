// converts a datetime string to a UNIX timestamp
export const convert_datetime_to_timestamp = (time: string): number => {
  return new Date(time).getTime() / 1000;
}