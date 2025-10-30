export function getTenantUrlNameFromHostname(hostname: string) {
  return hostname.split('.').slice(0, -2).join('.');
}
