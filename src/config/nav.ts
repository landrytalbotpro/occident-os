import {
  LayoutDashboard,
  Users,
  UserCheck,
  KanbanSquare,
  CalendarDays,
  CheckSquare,
  Package,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Aparece en la barra inferior móvil */
  mobile?: boolean;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard, mobile: true },
  { href: "/crm/prospects", label: "Prospects", icon: Users, mobile: true },
  { href: "/crm/clients", label: "Clientes", icon: UserCheck },
  { href: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { href: "/agenda", label: "Agenda", icon: CalendarDays, mobile: true },
  { href: "/tasks", label: "Tareas", icon: CheckSquare, mobile: true },
  { href: "/catalog", label: "Catálogo", icon: Package },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function titleFor(pathname: string) {
  return navItems.find((i) => isActive(pathname, i.href))?.label ?? "OCCIDENT OS";
}
