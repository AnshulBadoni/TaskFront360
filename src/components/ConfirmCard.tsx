import React, { useState } from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

type ConfirmationType = 'success' | 'warning' | 'error';

interface ConfirmCardProps {
    type: ConfirmationType;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    isOpen: boolean;
}

const ConfirmCard: React.FC<ConfirmCardProps> = ({
    type,
    title,
    message,
    onConfirm,
    onCancel,
    isOpen,
}) => {
    if (!isOpen) return null;

    const getIconAndColor = () => {
        switch (type) {
            case 'success':
                return {
                    icon: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
                    bgColor: 'bg-green-50',
                    textColor: 'text-green-600',
                    buttonColor: 'bg-green-600 hover:bg-green-700',
                };
            case 'warning':
                return {
                    icon: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />,
                    bgColor: 'bg-yellow-50',
                    textColor: 'text-yellow-600',
                    buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
                };
            case 'error':
                return {
                    icon: <XCircleIcon className="h-6 w-6 text-red-500" />,
                    bgColor: 'bg-red-50',
                    textColor: 'text-red-600',
                    buttonColor: 'bg-red-600 hover:bg-red-700',
                };
            default:
                return {
                    icon: <ExclamationTriangleIcon className="h-6 w-6 text-blue-500" />,
                    bgColor: 'bg-blue-50',
                    textColor: 'text-blue-600',
                    buttonColor: 'bg-blue-600 hover:bg-blue-700',
                };
        }
    };

    const { icon, bgColor, textColor, buttonColor } = getIconAndColor();

    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${bgColor} rounded-lg p-6 max-w-md w-full shadow-xl`}>
                <div className="flex items-start">
                    <div className="flex rounded-full size-10 bg-white">
                        <div className='my-auto mx-auto'>
                            {icon}
                        </div>
                    </div>
                    <div className="ml-3 w-0 flex-1 p">
                        <h3 className={`text-lg font-medium capitalize ${textColor}`}>{title}</h3>
                        <div className="mt-2 text-sm text-gray-500">
                            <p>{message}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                    <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className={`inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm ${buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2`}
                        onClick={onConfirm}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmCard;
