// Custom type declarations for lucide-react icons that exist at runtime
// but are not properly exported in the bundled type definitions.
// This file augments the module to fix TypeScript errors.

import type { LucideIcon } from 'lucide-react';

declare module 'lucide-react' {
  // Icons that exist at runtime but TypeScript doesn't recognize
  export const Save: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const Pill: LucideIcon;
  export const Microscope: LucideIcon;
  export const Leaf: LucideIcon;
  export const FlaskConical: LucideIcon;
  export const DollarSign: LucideIcon;
  export const History: LucideIcon;
  export const LayoutGrid: LucideIcon;
  export const List: LucideIcon;
  export const QrCode: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Droplet: LucideIcon;
  export const Server: LucideIcon;
  export const FileSpreadsheet: LucideIcon;
  export const Unlock: LucideIcon;
  export const Smartphone: LucideIcon;
  export const Tablet: LucideIcon;
  export const MinusCircle: LucideIcon;
  export const Briefcase: LucideIcon;
  export const ClipboardList: LucideIcon;
  export const FileCheck: LucideIcon;
  export const FilePlus: LucideIcon;
  export const FileX: LucideIcon;
  export const Folder: LucideIcon;
  export const FolderOpen: LucideIcon;
  export const Globe: LucideIcon;
  export const LinkIcon: LucideIcon;
  export const MapPin: LucideIcon;
  export const Palette: LucideIcon;
  export const Paperclip: LucideIcon;
  export const Phone: LucideIcon;
  export const Printer: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const Scissors: LucideIcon;
  export const Send: LucideIcon;
  export const Share: LucideIcon;
  export const Share2: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const Trash: LucideIcon;
  export const Trash2: LucideIcon;
  export const Upload: LucideIcon;
  export const UserPlus: LucideIcon;
  export const Users: LucideIcon;
  export const Video: LucideIcon;
  export const Wifi: LucideIcon;
  export const XCircle: LucideIcon;
  export const ZoomIn: LucideIcon;
  export const ZoomOut: LucideIcon;
}
