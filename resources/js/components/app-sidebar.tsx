import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BadgeDollarSign, LayoutGrid, Router, Shield, Users } from 'lucide-react';
import AppLogo from './app-logo';

// 1️⃣ I-define muna kung anong itsura ng user
interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: 'superadmin' | 'admin' | 'user';
    status: 'active' | 'inactive';
}

// 2️⃣ Tapos define mo ang shared props
interface SharedProps {
    auth: {
        user: AuthUser | null;
    };
}

export function AppSidebar() {
    // 3️⃣ Gamitin mo siya dito
    const { props } = usePage<{ auth: { user: AuthUser | null } }>();
    const user = props.auth?.user;
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Customer',
            href: '/customer',
            icon: Users,
        },
        {
            title: 'Plans',
            href: '/plans',
            icon: Router,
        },
        {
            title: 'Sales',
            href: '/sales',
            icon: BadgeDollarSign,
        },
        ...(user?.role === 'superadmin'
            ? [
                  {
                      title: 'User Management',
                      href: '/user-management',
                      icon: Shield,
                  },
              ]
            : []),
    ];

    const footerNavItems: NavItem[] = [];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
