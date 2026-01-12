import { Link } from 'react-router-dom';

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
    <div className="text-center py-16 px-6 bg-white border-2 border-dashed border-surface-200 rounded-3xl">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-6">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2 text-surface-900">{title}</h3>
      <p className="text-surface-500 mb-6 max-w-sm mx-auto">{description}</p>
      {action && (
        action.href ? (
          <Link
            to={action.href}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-3 rounded-full text-sm font-medium hover:from-primary-700 hover:to-primary-600 transition-all hover:shadow-lg hover:shadow-primary-500/25"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-3 rounded-full text-sm font-medium hover:from-primary-700 hover:to-primary-600 transition-all hover:shadow-lg hover:shadow-primary-500/25"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
