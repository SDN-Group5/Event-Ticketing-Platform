import React from 'react';
import { Modal } from '../../components/common/Modal';

interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <div className="text-center">
                <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-3xl text-rose-500">logout</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Sign Out?</h2>
                <p className="text-gray-400 mb-8">Are you sure you want to sign out of your account?</p>
                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border border-white/10 rounded-xl font-semibold hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 bg-rose-500 rounded-xl font-bold hover:bg-rose-600 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </Modal>
    );
};
