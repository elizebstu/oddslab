import Button from './ui/Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-20 px-8 bg-surface-50 border border-surface-200 rounded-[2.5rem] shadow-inner">
      {icon && (
        <div className="w-20 h-20 rounded-3xl bg-white shadow-sm ring-1 ring-black/5 flex items-center justify-center mx-auto mb-8 text-primary-500">
          {icon}
        </div>
      )}
      <h3 className="text-2xl font-display font-bold mb-3 text-surface-900">{title}</h3>
      <p className="text-surface-500 mb-10 max-w-sm mx-auto font-medium leading-relaxed">{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          to={action.href}
          size="lg"
          className="px-10 shadow-glow"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
