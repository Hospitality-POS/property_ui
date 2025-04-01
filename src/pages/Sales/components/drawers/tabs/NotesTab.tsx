import { Note } from '@/pages/Sales/types/SalesTypes';
import formatDate from '@/utils/formatDateUtil';
import { Button, Card, Input, List, Typography } from 'antd';
import React from 'react';

const { TextArea } = Input;
const { Paragraph } = Typography;

const NotesTab: React.FC<{
  notes?: Note[];
  noteText: string;
  setNoteText: (text: string) => void;
}> = ({ notes = [], noteText, setNoteText }) => {
  return (
    <Card>
      {notes.length > 0 ? (
        <List
          itemLayout="horizontal"
          dataSource={notes}
          renderItem={(note, index) => (
            <List.Item>
              <List.Item.Meta
                title={`Note ${index + 1} - ${formatDate(
                  note.addedAt || note.createdAt,
                )}`}
                description={note.content || note.text || '(No content)'}
              />
            </List.Item>
          )}
        />
      ) : (
        <Paragraph>No notes available.</Paragraph>
      )}
      <div style={{ marginTop: 16 }}>
        <TextArea
          rows={4}
          placeholder="Add notes here..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
        />
        <Button type="primary" style={{ marginTop: 8 }}>
          Save Notes
        </Button>
      </div>
    </Card>
  );
};

export default NotesTab;
