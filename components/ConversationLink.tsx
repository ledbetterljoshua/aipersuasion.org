'use client';

import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import ConversationDrawer from './ConversationDrawer';

interface ConversationLinkProps {
  resultId: string;
  /** Zero-based index into the conversation array to scroll to and highlight. */
  turnNumber: number;
  children: React.ReactNode;
  className?: string;
}

/**
 * Inline link that opens a transcript in a side drawer. The portal is only
 * rendered while open, which can only happen after a client-side click, so
 * server and client markup always match.
 */
export default function ConversationLink({ resultId, turnNumber, children, className = '' }: ConversationLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`underline hover:text-gray-600 cursor-pointer text-left ${className}`}
      >
        {children}
      </button>

      {isOpen &&
        createPortal(
          <ConversationDrawer resultId={resultId} turnNumber={turnNumber} onClose={close} />,
          document.body,
        )}
    </>
  );
}
