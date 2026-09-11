/** Public assets share the deployment prefix on GitHub Pages. */
export function asset(path: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${path}`;
}
