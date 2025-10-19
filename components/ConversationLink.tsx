'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import ConversationDrawer from './ConversationDrawer';

interface ConversationLinkProps {
  resultId: string;
  turnNumber: number;
  children: React.ReactNode;
  className?: string;
}

export default function ConversationLink({ resultId, turnNumber, children, className = '' }: ConversationLinkProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`underline hover:text-gray-600 cursor-pointer ${className}`}
      >
        {children}
      </button>

      {typeof document !== 'undefined' && createPortal(
        <ConversationDrawer
          resultId={resultId}
          turnNumber={turnNumber}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />,
        document.body
      )}
    </>
  );
}
