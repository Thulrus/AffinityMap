export interface Person {
  id: string;
  name: string;
  tags: string[];
}

export interface MinisteringAssignment {
  ministerId: string;
  partnerId: string;
  recipientIds: string[];
}

export interface Position {
  x: number;
  y: number;
}

export interface PersonCard {
  person: Person;
  position: Position;
  type: 'minister' | 'recipient';
}

export interface CardPosition {
  id: string;
  position: Position;
  type: 'minister' | 'recipient';
}

export interface ExportData {
  version: string;
  people: Person[];
  positions: CardPosition[];
  exportDate: string;
}
