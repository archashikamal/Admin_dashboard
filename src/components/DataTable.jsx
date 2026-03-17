import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Pencil, Trash2, Check, X, Plus, Loader2, AlertTriangle, Save, ChevronRight, ChevronDown } from 'lucide-react'

// Simple Toast Component
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000)
        return () => clearTimeout(timer)
    }, [onClose])

    const colors = type === 'error'
        ? 'bg-destructive/90 text-destructive-foreground border-destructive/50'
        : 'bg-green-600/90 text-white border-green-500/50'

    return (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-2xl ${colors} border backdrop-blur-sm z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 font-medium flex items-center gap-2`}>
            {type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            {message}
        </div>
    )
}

// Confirmation Modal
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="glass-panel p-6 rounded-xl w-full max-w-sm border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200 bg-card">
                <div className="flex items-center gap-3 mb-4 text-destructive">
                    <div className="bg-destructive/20 p-2 rounded-full">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{title}</h3>
                </div>
                <p className="text-muted-foreground mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-foreground">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors font-medium shadow-lg shadow-destructive/20">Delete</button>
                </div>
            </div>
        </div>
    )
}

const DataTable = ({ tableName, columns, primaryKey = 'id', title, expandedRowRender, onAfterUpdate }) => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState(null)
    const [editValues, setEditValues] = useState({})
    const [toast, setToast] = useState(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [newRecord, setNewRecord] = useState({})
    const [expandedRowId, setExpandedRowId] = useState(null)

    // Confirmation State
    const [deleteId, setDeleteId] = useState(null)

    const fetchData = async () => {
        setLoading(true)
        const { data: result, error } = await supabase
            .from(tableName)
            .select('*')
            .order(primaryKey, { ascending: true })

        if (error) {
            setToast({ message: `Error fetching data: ${error.message}`, type: 'error' })
        } else {
            setData(result || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [tableName])

    const handleEdit = (row) => {
        setEditingId(row[primaryKey])
        setEditValues(row)
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditValues({})
    }

    const handleSave = async () => {
        const oldValues = data.find(item => item[primaryKey] === editingId)

        const { error } = await supabase
            .from(tableName)
            .update(editValues)
            .eq(primaryKey, editingId)

        if (error) {
            setToast({ message: `Error updating: ${error.message}`, type: 'error' })
        } else {
            setToast({ message: 'Updated successfully', type: 'success' })
            setEditingId(null)
            if (onAfterUpdate) onAfterUpdate(oldValues, editValues)
            fetchData()
        }
    }

    const confirmDelete = (id) => {
        setDeleteId(id)
    }

    const handleExecuteDelete = async () => {
        if (!deleteId) return

        const { error } = await supabase
            .from(tableName)
            .delete()
            .eq(primaryKey, deleteId)

        if (error) {
            setToast({ message: `Error deleting: ${error.message}`, type: 'error' })
        } else {
            setToast({ message: 'Deleted successfully', type: 'success' })
            fetchData()
        }
        setDeleteId(null)
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        const { error } = await supabase
            .from(tableName)
            .insert([newRecord])

        if (error) {
            setToast({ message: `Create Failed: ${error.message}`, type: 'error' })
        } else {
            setToast({ message: 'Record created successfully', type: 'success' })
            setShowAddForm(false)
            setNewRecord({})
            fetchData()
        }
    }

    const toggleExpand = (id) => {
        setExpandedRowId(prev => prev === id ? null : id)
    }

    const renderCell = (item, col) => {
        const value = item[col.key]
        if (col.render) return col.render(value, item)
        return <span className="text-sm">{value}</span>
    }

    const renderEditInput = (col) => {
        const val = editValues[col.key] || ''
        if (col.editable === false) return <span className="text-muted-foreground text-sm opacity-50">{val}</span>

        const inputClass = "w-full glass-input rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"

        if (col.type === 'select') {
            return (
                <select
                    value={val}
                    onChange={(e) => setEditValues({ ...editValues, [col.key]: e.target.value })}
                    className={`${inputClass} bg-card`}
                >
                    {col.options.map(opt => <option key={opt} value={opt} className="bg-card text-foreground">{opt}</option>)}
                </select>
            )
        }

        return (
            <input
                type={col.type || 'text'}
                value={val}
                onChange={(e) => setEditValues({ ...editValues, [col.key]: e.target.value })}
                className={inputClass}
                step={col.step}
                min={col.min}
            />
        )
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground animate-pulse">Loading data...</p>
        </div>
    )

    const hasExpand = !!expandedRowRender
    const totalCols = columns.length + 1 + (hasExpand ? 1 : 0)

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-card/40 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">{title}</h2>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="btn-primary px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold"
                >
                    <Plus className="w-4 h-4" /> Add Record
                </button>
            </div>

            {showAddForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="glass-panel p-8 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">Add New Record</h3>
                            <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-5">
                            {columns.filter(c => c.key !== primaryKey && c.create !== false).map(col => (
                                <div key={col.key}>
                                    <label className="block text-sm font-medium mb-1.5 text-muted-foreground ml-1">{col.label} {col.required && <span className="text-red-400">*</span>}</label>
                                    {col.type === 'select' ? (
                                        <select
                                            className="w-full glass-input rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary/50 bg-card"
                                            value={newRecord[col.key] || ''}
                                            onChange={e => setNewRecord({ ...newRecord, [col.key]: e.target.value })}
                                            required={col.required}
                                        >
                                            <option value="" className="bg-card">Select {col.label}...</option>
                                            {col.options?.map(opt => <option key={opt} value={opt} className="bg-card">{opt}</option>)}
                                        </select>
                                    ) : (
                                        <input
                                            type={col.type || 'text'}
                                            className="w-full glass-input rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary/50"
                                            value={newRecord[col.key] || ''}
                                            onChange={e => setNewRecord({ ...newRecord, [col.key]: e.target.value })}
                                            required={col.required}
                                            step={col.step}
                                            min={col.min}
                                            placeholder={`Enter ${col.label.toLowerCase()}...`}
                                        />
                                    )}
                                </div>
                            ))}
                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="px-5 py-2.5 rounded-lg hover:bg-white/5 transition-colors font-medium border border-transparent hover:border-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary px-6 py-2.5 rounded-lg font-medium"
                                >
                                    Save Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="glass-panel rounded-xl overflow-hidden bg-card/30">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-muted-foreground backdrop-blur-xl border-b border-white/5">
                            <tr>
                                {hasExpand && <th className="p-4 w-10"></th>}
                                {columns.map(col => (
                                    <th key={col.key} className="p-4 font-semibold tracking-wide">{col.label}</th>
                                ))}
                                <th className="p-4 font-semibold text-right tracking-wide">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.map(item => {
                                const isEditing = editingId === item[primaryKey]
                                const isExpanded = expandedRowId === item[primaryKey]
                                return (
                                    <React.Fragment key={item[primaryKey]}>
                                        <tr className="table-row-hover group">
                                            {hasExpand && (
                                                <td className="p-4 w-10">
                                                    <button
                                                        onClick={() => toggleExpand(item[primaryKey])}
                                                        className="text-muted-foreground hover:text-primary transition-colors p-1 rounded"
                                                        title="View stock history"
                                                    >
                                                        {isExpanded
                                                            ? <ChevronDown className="w-4 h-4" />
                                                            : <ChevronRight className="w-4 h-4" />
                                                        }
                                                    </button>
                                                </td>
                                            )}
                                            {columns.map(col => (
                                                <td key={col.key} className="p-4 max-w-[200px] truncate text-foreground/90 group-hover:text-foreground">
                                                    {isEditing ? renderEditInput(col) : renderCell(item, col)}
                                                </td>
                                            ))}
                                            <td className="p-4 text-right">
                                                {isEditing ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={handleSave} className="bg-green-500/10 text-green-500 hover:bg-green-500/20 p-2 rounded-lg transition-colors" title="Save"><Check className="w-4 h-4" /></button>
                                                        <button onClick={handleCancelEdit} className="bg-white/5 text-muted-foreground hover:bg-white/10 p-2 rounded-lg transition-colors" title="Cancel"><X className="w-4 h-4" /></button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <button onClick={() => handleEdit(item)} className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 p-2 rounded-lg transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                                                        <button onClick={() => confirmDelete(item[primaryKey])} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 p-2 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                        {hasExpand && isExpanded && (
                                            <tr className="bg-black/20">
                                                <td colSpan={totalCols} className="p-0">
                                                    <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                                                        {expandedRowRender(item)}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                )
                            })}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={totalCols} className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                                        <div className="bg-white/5 p-4 rounded-full mb-2">
                                            <Save className="w-8 h-8 opacity-20" />
                                        </div>
                                        No records found. Click "Add New" to create one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmModal
                isOpen={!!deleteId}
                title="Delete Record"
                message="Are you sure you want to delete this record? This action cannot be undone."
                onConfirm={handleExecuteDelete}
                onCancel={() => setDeleteId(null)}
            />

            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    )
}

export default DataTable
