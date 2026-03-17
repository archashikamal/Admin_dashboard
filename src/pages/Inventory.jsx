import { useEffect, useState } from 'react'
import DataTable from '../components/DataTable'
import { supabase } from '../lib/supabaseClient'
import { Loader2, PackageOpen } from 'lucide-react'

// Supabase returns 'timestamp without time zone' with no 'Z' suffix.
// Appending 'Z' tells JavaScript to treat it as UTC, then toLocaleString()
// converts to the browser's local timezone automatically.
const formatDate = (val) => {
    if (!val) return '—'
    const str = val.endsWith('Z') || val.includes('+') ? val : val + 'Z'
    return new Date(str).toLocaleString()
}

const StockHistoryPanel = ({ item }) => {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true)
            const { data, error } = await supabase
                .from('inventory')
                .select('item_id, quantity, unit, last_updated')
                .eq('product_name', item.product_name)
                .order('last_updated', { ascending: false })

            if (!error) setHistory(data || [])
            setLoading(false)
        }
        fetchHistory()
    }, [item.product_name])

    const totalQty = history.reduce((sum, h) => sum + (h.quantity || 0), 0)
    const unit = history.find(h => h.unit)?.unit || item.unit || ''

    return (
        <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-1 h-4 bg-primary rounded-full"></div>
                <h4 className="text-sm font-semibold text-primary">
                    Stock History — {item.product_name}
                </h4>
                {!loading && history.length > 0 && (
                    <span className="ml-auto text-xs bg-green-500/15 text-green-400 border border-green-500/20 px-3 py-1 rounded-full font-semibold">
                        Current Stock: {totalQty} {unit}
                    </span>
                )}
            </div>

            {loading ? (
                <div className="flex items-center gap-2 py-3 text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading history...
                </div>
            ) : history.length === 0 ? (
                <div className="flex items-center gap-2 py-3 text-muted-foreground text-sm italic">
                    <PackageOpen className="w-4 h-4" />
                    No records found for this product.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-muted-foreground border-b border-white/5">
                                <th className="text-left pb-3 pr-10 font-semibold">Item ID</th>
                                <th className="text-left pb-3 pr-10 font-semibold">Quantity Added</th>
                                <th className="text-left pb-3 pr-10 font-semibold">Unit</th>
                                <th className="text-left pb-3 font-semibold">Date & Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {history.map((h) => (
                                <tr
                                    key={h.item_id}
                                    className="text-foreground/80 hover:text-foreground transition-colors"
                                >
                                    <td className="py-3 pr-10 font-mono text-base">#{h.item_id}</td>
                                    <td className="py-3 pr-10 font-bold text-base">{h.quantity}</td>
                                    <td className="py-3 pr-10 text-muted-foreground text-base">{unit}</td>
                                    <td className="py-3 text-muted-foreground text-base">
                                        {formatDate(h.last_updated)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-white/10">
                                <td className="pt-3 text-base font-semibold text-muted-foreground">Current Stock</td>
                                <td className="pt-3 text-lg font-bold text-green-400">{totalQty}</td>
                                <td colSpan={2} className="pt-3 text-base text-muted-foreground">{unit}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </div>
    )
}

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
        { key: 'last_updated', label: 'Last Updated', editable: false, create: false, render: (val) => formatDate(val) }
    ]

    return (
        <DataTable
            tableName="inventory"
            columns={columns}
            title="Inventory"
            primaryKey="item_id"
            expandedRowRender={(item) => <StockHistoryPanel item={item} />}
        />
    )
}

export default Inventory
