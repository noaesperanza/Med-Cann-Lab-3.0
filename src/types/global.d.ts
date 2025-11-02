declare module '*.tsx' {
  const content: any;
  export default content;
}

declare module '*.ts' {
  const content: any;
  export default content;
}

declare module '*.md?raw' {
  const content: string;
  export default content;
}

interface Document {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
  type?: string;
  size?: number;
  url?: string;
}

// Override the global Document type to avoid conflicts with DOM Document
declare global {
  interface Document {
    id: number;
    title: string;
    content: string;
    created_at: string;
    updated_at?: string;
    type?: string;
    size?: number;
    url?: string;
  }
}