import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import SiyaUsers from './pages/SiyaUsers'
import Inventory from './pages/Inventory'
import ManagerClientContacts from './pages/ManagerClientContacts'

// Placeholder components until real ones are implemented
const Placeholder = ({ title }) => (
    <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-muted-foreground">Content for {title} will be loaded here.</p>
    </div>
)

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<SiyaUsers />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="contacts" element={<ManagerClientContacts />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </Router>
    )
}

export default App
