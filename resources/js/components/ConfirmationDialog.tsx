import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, TriangleAlertIcon } from 'lucide-react';
import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
    message: string;
    isLoading?: boolean;
    title?: string;
    confirmLabel?: string;
    confirmColor?: 'red' | 'blue' | 'gray';
}

const ConfirmationDialog: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    message,
    isLoading = false,
    title = 'Confirm Action',
    confirmLabel = 'Confirm',
    confirmColor = 'blue',
}) => {
    const buttonColor =
        confirmColor === 'red'
            ? 'bg-red-500 hover:bg-red-600'
            : confirmColor === 'gray'
              ? 'bg-gray-500 hover:bg-gray-600'
              : 'bg-blue-600 hover:bg-blue-700';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <TriangleAlertIcon className="h-5 w-5 text-yellow-500" />
                        {title}
                    </DialogTitle>
                    <DialogDescription>{message}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <button
                            className="ring-offset-background focus-visible:ring-ring mr-2 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                    </DialogClose>
                    <button
                        className={`ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center rounded-md ${buttonColor} px-4 py-2 text-sm font-medium whitespace-nowrap text-white transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50`}
                        onClick={async () => await onConfirm()} // ✅ dito ang mahalaga
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? `${confirmLabel}...` : confirmLabel}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmationDialog;
