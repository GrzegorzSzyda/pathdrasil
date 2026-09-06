import { TreeStructureIcon } from '@phosphor-icons/react'

export const Header = (): React.JSX.Element => {
  return (
    <header className="flex items-center gap-3" aria-label="Pathdrasil">
      <span className="text-brand grid size-11 place-items-center">
        <TreeStructureIcon size={32} weight="bold" />
      </span>
      <span className="text-heading text-lg font-semibold tracking-tight">
        Pathdrasil
      </span>
    </header>
  )
}
