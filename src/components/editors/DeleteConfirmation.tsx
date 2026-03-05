import React, { useState } from 'react';
import { Modal, Button, Field, Input } from '@grafana/ui';
import { COLORS, FONT } from '../../styles/tokens';

interface Props {
  type: 'node' | 'edge';
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmation: React.FC<Props> = ({ type, onConfirm, onCancel }) => {
  const [input, setInput] = useState('');
  const confirmed = input.toLowerCase() === 'delete';

  const prompt =
    type === 'node' ? 'Are you sure you want to remove this item?' : 'Are you sure you want to remove this connection?';

  return (
    <Modal title="🗑️ Delete" isOpen={true} onDismiss={onCancel}>
      <div style={{ padding: '8px 0' }}>
        <p style={{ margin: '0 0 12px', color: COLORS.textSecondary }}>{prompt}</p>
        <div
          style={{
            background: COLORS.warningBg,
            border: `1px solid ${COLORS.warningBorder}`,
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 12,
          }}
        >
          <p style={{ fontSize: FONT.md, color: COLORS.warning, margin: 0 }}>⚠️ Type Delete to confirm:</p>
        </div>
        <Field label="">
          <Input value={input} onChange={(e) => setInput(e.currentTarget.value)} placeholder="Delete" />
        </Field>
      </div>
      <Modal.ButtonRow>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={!confirmed}>
          Delete
        </Button>
      </Modal.ButtonRow>
    </Modal>
  );
};
