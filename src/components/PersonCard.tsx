import { useState, useRef, useEffect } from 'react'
import { Person, Position } from '../types'

interface PersonCardProps {
  person: Person
  position: Position
  type: 'minister' | 'recipient'
  zoom: number
  pan: Position
  onMove: (position: Position) => void
  onUpdate: (updates: Partial<Person>) => void
  onDelete: () => void
}

export default function PersonCard({
  person,
  position,
  type,
  zoom,
  pan,
  onMove,
  onUpdate,
  onDelete,
}: PersonCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 })
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(person.name)
  const [newTag, setNewTag] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDragging(true)
    // Convert screen coordinates to world coordinates: (screen - pan) / zoom
    const worldX = (e.clientX - pan.x) / zoom
    const worldY = (e.clientY - pan.y) / zoom
    setDragStart({
      x: worldX - position.x,
      y: worldY - position.y,
    })
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation()
    if (e.touches.length === 1) {
      setIsDragging(true)
      // Convert screen coordinates to world coordinates: (screen - pan) / zoom
      const worldX = (e.touches[0].clientX - pan.x) / zoom
      const worldY = (e.touches[0].clientY - pan.y) / zoom
      setDragStart({
        x: worldX - position.x,
        y: worldY - position.y,
      })
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Convert screen coordinates to world coordinates: (screen - pan) / zoom
        const worldX = (e.clientX - pan.x) / zoom
        const worldY = (e.clientY - pan.y) / zoom
        onMove({
          x: worldX - dragStart.x,
          y: worldY - dragStart.y,
        })
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
        e.preventDefault() // Prevent scrolling while dragging
        // Convert screen coordinates to world coordinates: (screen - pan) / zoom
        const worldX = (e.touches[0].clientX - pan.x) / zoom
        const worldY = (e.touches[0].clientY - pan.y) / zoom
        onMove({
          x: worldX - dragStart.x,
          y: worldY - dragStart.y,
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    const handleTouchEnd = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, dragStart, onMove, zoom, pan])

  const handleSaveName = () => {
    if (editName.trim() && editName !== person.name) {
      onUpdate({ name: editName.trim() })
    }
    setIsEditing(false)
  }

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTag.trim() && !person.tags.includes(newTag.trim())) {
      onUpdate({ tags: [...person.tags, newTag.trim()] })
      setNewTag('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    onUpdate({ tags: person.tags.filter(t => t !== tag) })
  }

  const bgColor = type === 'minister' ? 'bg-blue-600' : 'bg-green-600'
  const borderColor = type === 'minister' ? 'border-blue-400' : 'border-green-400'

  return (
    <div
      ref={cardRef}
      className={`absolute ${bgColor} ${borderColor} border-2 rounded-lg shadow-lg cursor-move p-4 min-w-[200px] max-w-[250px]`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h3
              className="font-bold text-lg cursor-text"
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}
            >
              {person.name}
            </h3>
          )}
          <p className="text-xs opacity-75 mt-1">
            {type === 'minister' ? '(Minister)' : '(Recipient)'}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (confirm(`Delete ${person.name}?`)) {
              onDelete()
            }
          }}
          className="text-white hover:text-red-300 p-1"
        >
          ×
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-1">
          {person.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-700 rounded-full text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <form onSubmit={handleAddTag} onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add tag..."
            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </form>
      </div>
    </div>
  )
}
