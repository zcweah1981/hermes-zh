export function normalizeDocSlug(input: string[]) {
  const joined = input.join('/')
  return joined.startsWith('/') ? joined : `/${joined}`
}
