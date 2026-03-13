import React, { useEffect } from 'react'
import DataTable from '../components/DataTable'

const SiyaUsers = () => {
    useEffect(() => {
        document.title = 'Siya Users | Admin Dashboard'
    }, [])

    const columns = [
        { key: 'name', label: 'Name', required: true },
        { key: 'telegram_chat_id', label: 'Telegram Chat ID', type: 'number' },
        { key: 'phone_number', label: 'Phone Number', type: 'tel' }
    ]

    return (
        <DataTable
            tableName="siya_users"
            columns={columns}
            title="Siya Users"
            primaryKey="id"
        />
    )
}

export default SiyaUsers
