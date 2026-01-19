import { memo } from 'react';
import type { Address } from '../services/roomService';

interface AddressListProps {
  addresses: Address[];
  onCopy: (address: string) => void;
  onRemove: (addressId: string) => void;
  copiedAddress: string | null;
  isDeleting?: boolean;
  deletingId?: string;
}

// Hoist static SVG icons
const COPY_ICON = (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CHECK_ICON = (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const X_ICON = (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

/**
 * Address list component for room detail.
 * Memoized with custom comparison to prevent unnecessary re-renders.
 */
function AddressList({
  addresses,
  onCopy,
  onRemove,
  copiedAddress,
  isDeleting = false,
  deletingId,
}: AddressListProps) {
  if (addresses.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-foreground/50">No addresses added yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      {addresses.map((addr) => {
        const isCopied = copiedAddress === addr.address;
        const isDeletingThis = isDeleting && deletingId === addr.id;

        return (
          <div
            key={addr.id}
            className={`flex items-center justify-between p-3 bg-background border border-border group transition-all ${
              isDeletingThis ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-muted border border-border">
                <span className="text-[10px] font-bold text-foreground/50">
                  {addr.address.slice(0, 4)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-mono text-foreground truncate">{addr.address}</p>
                {addr.userName && (
                  <p className="text-[10px] text-foreground/40">{addr.userName}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onCopy(addr.address)}
                className="p-1.5 text-foreground/40 hover:text-neon-cyan transition-colors disabled:opacity-50"
                disabled={isDeleting}
                title="Copy address"
              >
                {isCopied ? (
                  <span className="text-neon-green">{CHECK_ICON}</span>
                ) : (
                  COPY_ICON
                )}
              </button>
              <button
                type="button"
                onClick={() => onRemove(addr.id)}
                className="p-1.5 text-foreground/40 hover:text-neon-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isDeleting}
                title="Remove address"
              >
                {X_ICON}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default memo(AddressList, (prevProps, nextProps) => {
  return (
    prevProps.addresses === nextProps.addresses &&
    prevProps.copiedAddress === nextProps.copiedAddress &&
    prevProps.isDeleting === nextProps.isDeleting &&
    prevProps.deletingId === nextProps.deletingId
  );
});
