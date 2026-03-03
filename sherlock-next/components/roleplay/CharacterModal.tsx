'use client';

import React, { useState } from 'react';
import { useChat } from '@/lib/client/contexts';
import { Character } from '@/lib/shared/types';

export default function CharacterModal({ onClose }: { onClose: () => void }) {
    const { addCharacter } = useChat();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [relationship, setRelationship] = useState('');
    const [traits, setTraits] = useState<string[]>([]);
    const [traitInput, setTraitInput] = useState('');
    const [speakingStyle, setSpeakingStyle] = useState('');
    const [sherlockApproach, setSherlockApproach] = useState('');

    const addTrait = () => {
        const t = traitInput.trim();
        if (t && !traits.includes(t)) {
            setTraits([...traits, t]);
            setTraitInput('');
        }
    };

    const removeTrait = (trait: string) => {
        setTraits(traits.filter(t => t !== trait));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !description.trim()) return;

        const newChar: Character = {
            name: name.trim(),
            description: description.trim(),
            relationship: relationship.trim(),
            traits,
            speakingStyle: speakingStyle.trim(),
            sherlockApproach: sherlockApproach.trim(),
        };

        try {
            await fetch('/api/characters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newChar),
            });
            addCharacter(newChar);
            onClose();
        } catch (error) {
            console.error('Error saving character:', error);
        }
    };

    return (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Create Custom Character
                    </h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <div>
                            <label className="label">Name *</label>
                            <input className="input" value={name} onChange={e => setName(e.target.value)} required placeholder="Character name" />
                        </div>
                        <div>
                            <label className="label">Description *</label>
                            <textarea className="input" value={description} onChange={e => setDescription(e.target.value)} required placeholder="Who is this character?" rows={3} style={{ resize: 'vertical' }} />
                        </div>
                        <div>
                            <label className="label">Relationship to Sherlock</label>
                            <input className="input" value={relationship} onChange={e => setRelationship(e.target.value)} placeholder="e.g. Friend, Client, Rival" />
                        </div>
                        <div>
                            <label className="label">Traits</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                                {traits.map(t => (
                                    <span key={t} className="badge badge-blue" style={{ padding: '4px 8px' }}>
                                        {t}
                                        <button type="button" onClick={() => removeTrait(t)} style={{ marginLeft: '4px', fontSize: '12px', color: 'var(--color-blue-600)' }}>×</button>
                                    </span>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <input
                                    className="input"
                                    value={traitInput}
                                    onChange={e => setTraitInput(e.target.value)}
                                    placeholder="Add a trait"
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTrait(); } }}
                                />
                                <button type="button" className="btn btn-primary btn-sm" onClick={addTrait}>+</button>
                            </div>
                        </div>
                        <div>
                            <label className="label">Speaking Style</label>
                            <textarea className="input" value={speakingStyle} onChange={e => setSpeakingStyle(e.target.value)} placeholder="How does this character speak?" rows={2} style={{ resize: 'vertical' }} />
                        </div>
                        <div>
                            <label className="label">Sherlock&apos;s Approach</label>
                            <textarea className="input" value={sherlockApproach} onChange={e => setSherlockApproach(e.target.value)} placeholder="How should Sherlock treat this character?" rows={2} style={{ resize: 'vertical' }} />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Character</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
