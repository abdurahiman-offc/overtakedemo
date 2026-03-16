import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

export function ConfirmDeleteModal({ isOpen, onClose, onConfirm, title, message }: ConfirmDeleteModalProps) {
    const [confirmText, setConfirmText] = useState('');

    useEffect(() => {
        if (isOpen) {
            setConfirmText('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirmText.toLowerCase() === 'delete') {
            onConfirm();
            onClose();
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-fadeIn">
            <div className="w-full max-w-md flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-100/50 px-6 py-4">
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle size={20} />
                        <h2 className="text-lg font-bold">{title}</h2>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                        {message}
                    </p>

                    <form onSubmit={handleConfirm} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Type <span className="text-red-600">delete</span> to confirm
                            </label>
                            <input
                                autoFocus
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="Type 'delete' here..."
                                className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-50/50 transition-all font-medium"
                            />
                        </div>

                        <div className="flex items-center gap-3 mt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={confirmText.toLowerCase() !== 'delete'}
                                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Delete Permanently
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
}
