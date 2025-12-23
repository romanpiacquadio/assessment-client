'use client';

import React from 'react';
import ReactDOM from 'react-dom';
import { AnalysisStatusModalContent } from './analysis-status-modal-content';

interface AnalysisStatusModalProps {
  isViewingPartialFeedback: boolean;
  partialFeedbackDimension: string | null;
  setPartialFeedbackDimension: (dimension: string | null) => void;
  setIsViewingPartialFeedback: (isViewingPartialFeedback: boolean) => void;
}

export const AnalysisStatusModal = ({
  isViewingPartialFeedback,
  partialFeedbackDimension,
  setPartialFeedbackDimension,
  setIsViewingPartialFeedback,
}: AnalysisStatusModalProps) => {
  return (
    <>
      {/* Create modalas child of the root element */}
      {typeof window !== 'undefined' &&
        (() => {
          const modalRoot =
            typeof document !== 'undefined'
              ? document.getElementById('modal-root') ||
                (() => {
                  const root = document.createElement('div');
                  root.id = 'modal-root';
                  document.body.appendChild(root);
                  return root;
                })()
              : null;

          if (!modalRoot) return null;

          const handleClose = () => {
            const modalRoot = document.getElementById('modal-root');
            if (modalRoot) {
              modalRoot.remove();
            }
          };

          return ReactDOM.createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="relative mx-auto w-full max-w-6xl rounded-xl bg-white shadow-lg dark:bg-gray-900">
                <div className="p-6">
                  <AnalysisStatusModalContent
                    className="mt-1"
                    isViewingPartialFeedback={isViewingPartialFeedback}
                    partialFeedbackDimension={partialFeedbackDimension}
                    setPartialFeedbackDimension={setPartialFeedbackDimension}
                    onUserClosePartialFeedback={setIsViewingPartialFeedback}
                    onCloseClick={handleClose}
                  />
                </div>
              </div>
            </div>,
            modalRoot
          );
        })()}
    </>
  );
};
