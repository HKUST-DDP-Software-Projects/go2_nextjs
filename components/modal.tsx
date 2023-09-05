import { ReactNode, useEffect, useRef } from "react";

type ModalProps = {
  isModalOpen: boolean;
  title: string;
  children: ReactNode;
  actionText: string;
  onAction: () => void;
  onCancel: () => void;
};

const Modal = ({
  isModalOpen,
  title,
  children,
  actionText,
  onAction,
  onCancel,
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onCancel();
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isModalOpen, onCancel]);

  return (
    isModalOpen && (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
        <div
          className="bg-white rounded-lg p-4 w-1/2 overflow-y-auto max-h-full"
          ref={modalRef}
        >
          <h3 className="text-lg font-medium mb-4">{title}</h3>
          {children}
          <div className="flex justify-end">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mr-2"
              onClick={onAction}
            >
              {actionText}
            </button>
            <button
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default Modal;
