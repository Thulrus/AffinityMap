import { useState, useRef } from 'react'
import { ExportData } from '../types'

interface ToolbarProps {
  onAddPerson: (name: string) => void
  onAddMultiplePeople: (names: string[]) => void
  onExportData: () => void
  onImportData: (data: ExportData) => void
  onLoadExampleData: () => void
  onClearAllData: () => void
  allTags: string[]
  selectedTags: string[]
  onToggleTag: (tag: string) => void
  zoom: number
  onZoomChange: (zoom: number) => void
}

export default function Toolbar({
  onAddPerson,
  onAddMultiplePeople,
  onExportData,
  onImportData,
  onLoadExampleData,
  onClearAllData,
  allTags,
  selectedTags,
  onToggleTag,
  zoom,
  onZoomChange,
}: ToolbarProps) {
  const [newPersonName, setNewPersonName] = useState('')
  const [showTagFilter, setShowTagFilter] = useState(false)
  const [showImportMenu, setShowImportMenu] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const namesInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPersonName.trim()) {
      onAddPerson(newPersonName.trim())
      setNewPersonName('')
    }
  }

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as ExportData
        onImportData(data)
        setShowImportMenu(false)
      } catch (error) {
        alert('Error importing file. Please check the file format.')
        console.error(error)
      }
    }
    reader.readAsText(file)
    e.target.value = '' // Reset input
  }

  const handleNamesImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const names = text.split('\n').map(n => n.trim()).filter(n => n.length > 0)
        onAddMultiplePeople(names)
        setShowImportMenu(false)
      } catch (error) {
        alert('Error importing names.')
        console.error(error)
      }
    }
    reader.readAsText(file)
    e.target.value = '' // Reset input
  }

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center gap-4 flex-wrap">
      <h1 className="text-2xl font-bold text-blue-400">AffinityMap</h1>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newPersonName}
          onChange={(e) => setNewPersonName(e.target.value)}
          placeholder="Add person name..."
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition-colors"
        >
          Add Person
        </button>
      </form>

      <div className="relative">
        <button
          onClick={() => setShowTagFilter(!showTagFilter)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-medium transition-colors"
        >
          Filter by Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
        </button>
        
        {showTagFilter && allTags.length > 0 && (
          <div className="absolute top-full mt-2 left-0 bg-gray-700 border border-gray-600 rounded shadow-lg p-3 min-w-[200px] z-10">
            {allTags.map(tag => (
              <label key={tag} className="flex items-center gap-2 py-1 hover:bg-gray-600 px-2 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag)}
                  onChange={() => onToggleTag(tag)}
                  className="w-4 h-4"
                />
                <span>{tag}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Import/Export */}
      <div className="relative">
        <button
          onClick={() => setShowImportMenu(!showImportMenu)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-medium transition-colors"
        >
          Import/Export
        </button>
        
        {showImportMenu && (
          <div className="absolute top-full mt-2 left-0 bg-gray-700 border border-gray-600 rounded shadow-lg p-3 min-w-[200px] z-10">
            <button
              onClick={() => {
                onLoadExampleData()
                setShowImportMenu(false)
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-600 rounded transition-colors text-blue-400 hover:text-blue-300"
            >
              Load Example Data
            </button>
            <hr className="my-2 border-gray-600" />
            <button
              onClick={() => namesInputRef.current?.click()}
              className="w-full text-left px-3 py-2 hover:bg-gray-600 rounded transition-colors"
            >
              Import Names (TXT)
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full text-left px-3 py-2 hover:bg-gray-600 rounded transition-colors"
            >
              Import Project
            </button>
            <button
              onClick={() => {
                onExportData()
                setShowImportMenu(false)
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-600 rounded transition-colors"
            >
              Export Project
            </button>
            <hr className="my-2 border-gray-600" />
            <button
              onClick={() => {
                onClearAllData()
                setShowImportMenu(false)
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-600 rounded transition-colors text-red-400 hover:text-red-300"
            >
              Clear All Data
            </button>
          </div>
        )}
        
        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileImport}
          className="hidden"
        />
        <input
          ref={namesInputRef}
          type="file"
          accept=".txt"
          onChange={handleNamesImport}
          className="hidden"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <label className="text-sm">Zoom:</label>
        <button
          onClick={() => onZoomChange(Math.max(0.25, zoom - 0.25))}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
        >
          -
        </button>
        <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => onZoomChange(Math.min(2, zoom + 0.25))}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
        >
          +
        </button>
      </div>
    </div>
  )
}
