import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Users, Box, Contact, LayoutDashboard } from 'lucide-react'

const Sidebar = () => {
    const navItems = [
        { to: '/', icon: Users, label: 'Siya Users' },
        { to: '/inventory', icon: Box, label: 'Inventory' },
        { to: '/contacts', icon: Contact, label: 'Client Contacts' },
    ]

    return (
        <aside className="w-64 bg-card h-screen fixed left-0 top-0 border-r border-border flex flex-col">
            <div className="p-6 flex items-center gap-2 border-b border-border">
                <LayoutDashboard className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold text-primary">Admin</h1>
            </div>
            <nav className="flex-1 p-4 flex flex-col gap-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${isActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    )
}

const Layout = () => {
    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 overflow-auto">
                <Outlet />
            </main>
        </div>
    )
}

export default Layout
