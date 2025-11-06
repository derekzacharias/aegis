import {
  CalendarClock,
  ClipboardCheck,
  Compass,
  Database,
  FileDiff,
  FileText,
  FolderCog,
  GitBranch,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  ListOrdered,
  Lock,
  LucideIcon,
  Network,
  Plug,
  Puzzle,
  RefreshCcw,
  Scale,
  ScrollText,
  Search,
  Server,
  Shield,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
  Workflow
} from 'lucide-react';

const iconRegistry: Record<string, LucideIcon> = {
  Compass,
  Network,
  Layers,
  Server,
  Database,
  Workflow,
  Layout: LayoutDashboard,
  Shield,
  FileCheck: FileText,
  ListOrdered,
  ArrowPath: RefreshCcw,
  Plug,
  FolderCog,
  CalendarClock,
  Sparkles,
  Search,
  FileDiff,
  Users,
  Sliders: FolderCog,
  Lock,
  Puzzle,
  Terminal,
  TreeStructure: GitBranch,
  Balance: Scale,
  ShieldCheck,
  ScrollText,
  LifeBuoy,
  ClipboardCheck
};

export const iconFor = (name?: string): LucideIcon | undefined => {
  if (!name) {
    return undefined;
  }
  return iconRegistry[name] ?? iconRegistry[name.trim()];
};
