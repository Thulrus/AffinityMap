import { useState } from 'react'

interface ToolbarProps {
  onAddPerson: (name: string) => void
  allTags: string[]
  selectedTags: string[]
  onToggleTag: (tag: string) => void
  zoom: number
  onZoomChange: (zoom: number) => void
}

export default function Toolbar({
  onAddPerson,
  allTags,
  selectedTags,
  onToggleTag,
  zoom,
  onZoomChange,
}: ToolbarProps) {
  const [newPersonName, setNewPersonName] = useState('')
  const [showTagFilter, setShowTagFilter] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPersonName.trim()) {
      onAddPerson(newPersonName.trim())
      setNewPersonName('')
    }
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
