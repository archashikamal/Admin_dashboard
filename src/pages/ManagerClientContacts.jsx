import React, { useEffect } from 'react'
import DataTable from '../components/DataTable'
import { FileText } from 'lucide-react'

const ManagerClientContacts = () => {
    useEffect(() => {
        document.title = 'Contacts | Admin Dashboard'
    }, [])

    const columns = [
        { key: 'id', label: 'ID', editable: false, create: false },
        { key: 'manager_name', label: 'Manager Name' },
        { key: 'manager_phone_number', label: 'Manager Phone' },
        { key: 'manager_email', label: 'Manager Email', type: 'email' },
        { key: 'client_name', label: 'Client Name' },
        { key: 'client_phone_number', label: 'Client Phone' },
        { key: 'client_email', label: 'Client Email', type: 'email' },
        { key: 'location', label: 'Location' },
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: ['pending', 'accepted', 'rejected'],
            render: (val) => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${val === 'accepted' ? 'bg-green-500/20 text-green-500' :
                        val === 'rejected' ? 'bg-red-500/20 text-red-500' :
                            'bg-yellow-500/20 text-yellow-500'
                    }`}>
                    {val?.toUpperCase() || 'PENDING'}
                </span>
            )
        },
        {
            key: 'pdf_url',
            label: 'PDF',
            render: (val) => val ? <a href={val} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1"><FileText className="w-3 h-3" /> View</a> : '-'
        },
        { key: 'created_at', label: 'Created At', editable: false, create: false, render: (val) => val ? new Date(val).toLocaleDateString() : '-' }
    ]

    return (
        <DataTable
            tableName="manager_client_contacts"
            columns={columns}
            title="Manager Client Contacts"
            primaryKey="id"
        />
    )
}

export default ManagerClientContacts
