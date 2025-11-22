import React, { useState } from 'react'
import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from '@dnd-kit/sortable'
import { 
  Menu, Plus, Eye, QrCode, Share2, Globe, Settings, 
  Loader2 
} from 'lucide-react'

import { useLanguage } from './contexts/LanguageContext'
import { useFirebase } from './hooks/useFirebase'
import Modal from './components/Modal'
import ItemForm from './components/ItemForm'
import MenuCard from './components/MenuCard'
import QRCodeDisplay from './components/QRCode'
import CustomerView from './components/CustomerView'

// Admin Dashboard
function AdminDashboard() {
  const { t, lang, toggleLang } = useLanguage()
  const navigate = useNavigate()
  
  const {
    items,
    settings,
    loading,
    addItem,
    updateItem,
    deleteItem,
    incrementViews,
    reorderItems,
    uploadPhoto,
    setSettings
  } = useFirebase()

  const [modal, setModal] = useState(null) // 'add' | 'edit' | 'qr' | 'settings'
  const [editingItem, setEditingItem] = useState(null)
  const [notification, setNotification] = useState('')

  // Generate menu link
  const menuSlug = settings.storeName?.toLowerCase().replace(/\s+/g, '-') || 'menu'
  const menuLink = `${window.location.origin}/menu/${menuSlug}`

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Show notification
  const showNotif = (msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(''), 2500)
  }

  // Copy link
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(menuLink)
      showNotif(t.linkCopied)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  // Handle save item
  const handleSaveItem = async (formData) => {
    try {
      if (editingItem) {
        await updateItem(editingItem.id, formData)
        showNotif(t.itemUpdated)
        setEditingItem(null)
      } else {
        await addItem(formData)
        showNotif(t.itemAdded)
        setModal(null)
      }
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm(t.confirmDelete)) {
      try {
        await deleteItem(id)
        showNotif(t.itemDeleted)
      } catch (err) {
        console.error('Delete failed:', err)
      }
    }
  }

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(i => i.id === active.id)
      const newIndex = items.findIndex(i => i.id === over.id)
      const newItems = arrayMove(items, oldIndex, newIndex)
      reorderItems(newItems)
    }
  }

  // Handle settings save
  const handleSettingsSave = async (newSettings) => {
    try {
      await setSettings(newSettings)
      setModal(null)
      showNotif('Settings saved!')
    } catch (err) {
      console.error('Settings save failed:', err)
    }
  }

  // Sort items by order
  const sortedItems = [...items].sort((a, b) => a.order - b.order)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-fadeIn">
          {notification}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Menu size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">{t.appName}</h1>
              <p className="text-xs text-gray-500">{t.tagline}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Globe size={16} />
              {lang.toUpperCase()}
            </button>
            <button
              onClick={() => setModal('settings')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Actions Bar */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap gap-2">
          <button
            onClick={() => setModal('add')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus size={18} />
            {t.addItem}
          </button>
          <button
            onClick={() => navigate(`/menu/${menuSlug}`)}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <Eye size={18} />
            {t.preview}
          </button>
          <button
            onClick={() => setModal('qr')}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <QrCode size={18} />
            {t.generateQR}
          </button>
          <button
            onClick={copyLink}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <Share2 size={18} />
            {t.copyLink}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">
            {t.menuItems} ({items.length})
          </h2>
          <p className="text-sm text-gray-500">{t.dragToReorder}</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed">
            <Menu size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">{t.noItems}</p>
            <button
              onClick={() => setModal('add')}
              className="text-blue-600 font-medium hover:underline"
            >
              {t.addFirstItem}
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sortedItems.map(i => i.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedItems.map(item => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    onEdit={(item) => { setEditingItem(item); setModal('edit') }}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </main>

      {/* Add Modal */}
      <Modal isOpen={modal === 'add'} onClose={() => setModal(null)} title={t.addItem}>
        <ItemForm
          onSave={handleSaveItem}
          onCancel={() => setModal(null)}
          onUploadPhoto={uploadPhoto}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={modal === 'edit'} onClose={() => { setModal(null); setEditingItem(null) }} title={t.editItem}>
        {editingItem && (
          <ItemForm
            item={editingItem}
            onSave={handleSaveItem}
            onCancel={() => { setModal(null); setEditingItem(null) }}
            onUploadPhoto={uploadPhoto}
          />
        )}
      </Modal>

      {/* QR Modal */}
      <Modal isOpen={modal === 'qr'} onClose={() => setModal(null)} title={t.generateQR}>
        <QRCodeDisplay value={menuLink} />
      </Modal>

      {/* Settings Modal */}
      <Modal isOpen={modal === 'settings'} onClose={() => setModal(null)} title={t.settings}>
        <SettingsForm
          settings={settings}
          onSave={handleSettingsSave}
          onCancel={() => setModal(null)}
        />
      </Modal>
    </div>
  )
}

// Settings Form Component
function SettingsForm({ settings, onSave, onCancel }) {
  const { t } = useLanguage()
  const [form, setForm] = useState({
    storeName: settings.storeName || '',
    whatsappNumber: settings.whatsappNumber || ''
  })

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">{t.storeName}</label>
        <input
          type="text"
          value={form.storeName}
          onChange={(e) => setForm(prev => ({ ...prev, storeName: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{t.whatsappNumber}</label>
        <input
          type="text"
          value={form.whatsappNumber}
          onChange={(e) => setForm(prev => ({ ...prev, whatsappNumber: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="628123456789"
        />
        <p className="text-xs text-gray-500 mt-1">Format: 628xxx (tanpa + atau 0)</p>
      </div>
      <div className="flex gap-2 pt-4 border-t">
        <button onClick={onCancel} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
          {t.cancel}
        </button>
        <button onClick={() => onSave(form)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          {t.save}
        </button>
      </div>
    </div>
  )
}

// Public Menu Page
function PublicMenu() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { items, settings, incrementViews } = useFirebase()

  return (
    <CustomerView
      items={items}
      settings={settings}
      onIncrementViews={incrementViews}
      onBack={() => navigate('/')}
    />
  )
}

// App with Routes
function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/menu/:slug" element={<PublicMenu />} />
    </Routes>
  )
}

export default App