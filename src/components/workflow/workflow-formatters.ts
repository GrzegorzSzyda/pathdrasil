import type { TaskSummary } from '../../../shared/api/tasks'

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const compactDateFormatter = new Intl.RelativeTimeFormat('pl-PL', {
  numeric: 'auto',
})

export const providerName = (provider: TaskSummary['provider']): string =>
  provider === 'github' ? 'GitHub' : 'GitLab'

export const formatDate = (value: string): string =>
  dateFormatter.format(new Date(value))

export const formatCompactDate = (value: string): string => {
  const minutes = Math.round((new Date(value).getTime() - Date.now()) / 60_000)
  if (Math.abs(minutes) < 60)
    return compactDateFormatter.format(minutes, 'minute')

  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return compactDateFormatter.format(hours, 'hour')

  return compactDateFormatter.format(Math.round(hours / 24), 'day')
}
