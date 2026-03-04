'use client';

import React from 'react';

interface ConfirmDeleteModalProps {
    title: string;
    message?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDeleteModal({ title, message, onConfirm, onCancel }: ConfirmDeleteModalProps) {
    return (
        <div className="overlay" onClick={onCancel}>
            <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>{title}</h3>
                </div>
                <div className="modal-body">
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                        {message || 'This action cannot be undone.'}
                    </p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                    <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
                </div>
            </div>
        </div>
    );
}
