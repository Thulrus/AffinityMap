import { useState, useRef } from 'react'
import Board from './components/Board'
import Toolbar from './components/Toolbar'
import { Person, CardPosition, ExportData } from './types'

function App() {
  const [people, setPeople] = useState<Person[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [zoom, setZoom] = useState(1)
  const positionsRef = useRef<CardPosition[]>([])

  const handleAddPerson = (name: string) => {
    const newPerson: Person = {
      id: crypto.randomUUID(),
      name,
      tags: [],
    }
    setPeople([...people, newPerson])
  }

  const handleAddMultiplePeople = (names: string[]) => {
    const newPeople = names.map(name => ({
      id: crypto.randomUUID(),
      name: name.trim(),
      tags: [],
    })).filter(p => p.name.length > 0)
    setPeople([...people, ...newPeople])
  }

  const handleUpdatePerson = (id: string, updates: Partial<Person>) => {
    setPeople(people.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const handleDeletePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id))
  }

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handlePositionsUpdate = (positions: CardPosition[]) => {
    positionsRef.current = positions
  }

  const handleExportData = () => {
    const exportData: ExportData = {
      version: '1.0',
      people,
      positions: positionsRef.current,
      exportDate: new Date().toISOString(),
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `affinitymap-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImportData = (data: ExportData) => {
    setPeople(data.people)
    positionsRef.current = data.positions
    // Trigger a re-render by updating a dummy state or use a key
    setSelectedTags([]) // Clear filters on import
  }

  // Get all unique tags from all people
  const allTags = Array.from(new Set(people.flatMap(p => p.tags)))

  // Filter people based on selected tags
  const filteredPeople = selectedTags.length === 0
    ? people
    : people.filter(p => selectedTags.some(tag => p.tags.includes(tag)))

  return (
    <div className="w-full h-screen flex flex-col bg-gray-900 text-white">
      <Toolbar 
        onAddPerson={handleAddPerson}
        onAddMultiplePeople={handleAddMultiplePeople}
        onExportData={handleExportData}
        onImportData={handleImportData}
        allTags={allTags}
        selectedTags={selectedTags}
        onToggleTag={handleToggleTag}
        zoom={zoom}
        onZoomChange={setZoom}
      />
      <Board 
        people={filteredPeople}
        allPeople={people}
        onUpdatePerson={handleUpdatePerson}
        onDeletePerson={handleDeletePerson}
        zoom={zoom}
        onZoomChange={setZoom}
        onPositionsUpdate={handlePositionsUpdate}
        initialPositions={positionsRef.current}
      />
    </div>
  )
}

export default App
