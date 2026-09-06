import { Dialog } from './Dialog'
import { Kbd } from './Kbd'

type ShortcutHelpDialogProps = { open: boolean; onClose: () => void }

export const ShortcutHelpDialog = ({
  open,
  onClose,
}: ShortcutHelpDialogProps): React.JSX.Element => (
  <Dialog open={open} onClose={onClose} title="Skróty klawiaturowe">
    <div className="grid gap-3 text-sm">
      {[
        ['N / Enter', 'Rozpocznij tworzenie projektu z pustego widoku'],
        ['?', 'Otwórz tę pomoc'],
        ['Alt ←', 'Wróć do poprzedniej strony'],
        ['Alt →', 'Przejdź dalej, gdy strona jest poprawna'],
        ['Escape', 'Zamknij dialog'],
      ].map(([key, label]) => (
        <div className="flex items-center justify-between gap-4" key={key}>
          <span className="text-muted">{label}</span>
          <Kbd>{key}</Kbd>
        </div>
      ))}
    </div>
  </Dialog>
)
