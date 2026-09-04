export interface Board {
  id: string;
  html_content: string;
  preview_width: number;
  created_at: string;
}

export interface Comment {
  id: string;
  board_id: string;
  author_name: string;
  pos_x: number; // Percentual 0..100
  pos_y: number; // Percentual 0..100
  text: string;
  created_at: string;
}

export interface NewPinPosition {
  x: number; // Porcentagem 0..100
  y: number; // Porcentagem 0..100
}
