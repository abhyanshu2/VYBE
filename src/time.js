// "now", "5m", "3h", "2d" style relative time. Takes a JS Date (or null)
export const timeAgo = (d) => {
  if (!d) return 'now'
  const s = Math.max(0, (Date.now() - d.getTime()) / 1000)
  if (s < 60) return 'now'
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  if (s < 604800) return `${Math.floor(s / 86400)}d`
  return d.toLocaleDateString()
}
