import React, { useEffect } from 'react'
import DataTable from '../components/DataTable'

const Inventory = () => {
    useEffect(() => {
        document.title = 'Inventory | Admin Dashboard'
    }, [])

    const columns = [
        { key: 'item_id', label: 'Item ID', editable: false, create: false },
        { key: 'product_name', label: 'Product Name', required: true },
        { key: 'category', label: 'Category' },
        { key: 'quantity', label: 'Quantity', type: 'number', step: '1', min: 0 },
        { key: 'unit', label: 'Unit' },
        { key: 'cost_price', label: 'Cost Price', type: 'number', step: '0.01', min: 0 },
        { key: 'selling_price', label: 'Selling Price', type: 'number', step: '0.01', min: 0 },
        { key: 'reorder_level', label: 'Reorder Level', type: 'number', step: '1', min: 0 },
        { key: 'supplier_name', label: 'Supplier' },
        { key: 'last_updated', label: 'Last Updated', editable: false, create: false, render: (val) => val ? new Date(val).toLocaleString() : '-' }
    ]

    return (
        <DataTable
            tableName="inventory"
            columns={columns}
            title="Inventory"
            primaryKey="item_id"
        />
    )
}

export default Inventory
