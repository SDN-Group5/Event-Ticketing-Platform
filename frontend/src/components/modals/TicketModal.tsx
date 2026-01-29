import React from 'react';
import { Modal } from '../../components/common/Modal';

interface TicketModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <div className="text-center">
                {/* Ticket Visual */}
                <div className="relative bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-6 border border-white/10 mb-6">
                    {/* Notches */}
                    <div className="absolute top-1/2 left-0 -translate-x-1/2 w-6 h-6 bg-[#1e293b] rounded-full" />
                    <div className="absolute top-1/2 right-0 translate-x-1/2 w-6 h-6 bg-[#1e293b] rounded-full" />

                    <div className="mb-6">
                        <span className="inline-block bg-[#8655f6] text-white text-xs font-bold px-3 py-1 rounded-full mb-3">VIP ACCESS</span>
                        <h2 className="text-2xl font-bold text-white">Neon Nights Festival</h2>
                        <p className="text-gray-400 text-sm mt-1">Sat, Oct 14 • 8:00 PM</p>
                    </div>

                    <div className="border-t border-dashed border-white/10 pt-4 grid grid-cols-2 gap-4 text-sm">
                        <div className="text-left">
                            <p className="text-gray-500 text-xs uppercase">Section</p>
                            <p className="font-bold">Zone A</p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-500 text-xs uppercase">Seat</p>
                            <p className="font-bold">Row 5, Seat 12</p>
                        </div>
                    </div>
                </div>

                {/* QR Code */}
                <div className="bg-white p-4 rounded-xl inline-block mb-6">
                    <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TicketVibe-VIP-12345"
                        alt="QR Code"
                        className="w-32 h-32"
                    />
                </div>

                <p className="text-gray-500 text-sm mb-6">Scan this QR code at the venue entrance</p>

                <div className="flex gap-4">
                    <button className="flex-1 py-3 border border-white/10 rounded-xl font-semibold hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">download</span>
                        Download
                    </button>
                    <button className="flex-1 py-3 bg-[#8655f6] rounded-xl font-bold hover:bg-[#7f0df2] transition-colors flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">share</span>
                        Share
                    </button>
                </div>
            </div>
        </Modal>
    );
};
