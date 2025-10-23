export function clone<T>(input: object): T {
  return JSON.parse(JSON.stringify(input));
}
