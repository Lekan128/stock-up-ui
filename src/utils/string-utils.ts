export function isNullOrWhitespace(str: string | null | undefined): boolean {
  if (str === null || str === undefined) {
    return true;
  }
  return str.trim().length === 0;
}

// export function isNullOrWhitespace(input: string | null | undefined): boolean {
//   return !input?.trim();
// }
