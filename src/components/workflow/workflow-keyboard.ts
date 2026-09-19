import type { KeyboardEvent } from 'react'

type CardNavigation = {
  onNavigate?: (offset: number) => void
  onSetFirst?: () => void
  onSetLast?: () => void
}

export const handleTaskCardKeyDown = (
  event: KeyboardEvent<HTMLButtonElement>,
  navigation: CardNavigation,
): void => {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    navigation.onNavigate?.(1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    navigation.onNavigate?.(-1)
  } else if (event.key === 'Home') {
    event.preventDefault()
    navigation.onSetFirst?.()
  } else if (event.key === 'End') {
    event.preventDefault()
    navigation.onSetLast?.()
  }
}

export const isEditableTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.matches('input, textarea, select, [contenteditable="true"]') ||
    target.isContentEditable)
