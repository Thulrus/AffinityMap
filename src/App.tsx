import { useState, useRef, useEffect } from 'react'
import Board from './components/Board'
import Toolbar from './components/Toolbar'
import { Person, CardPosition, ExportData } from './types'

const STORAGE_KEYS = {
  PEOPLE: 'affinitymap-people',
  POSITIONS: 'affinitymap-positions',
  ZOOM: 'affinitymap-zoom',
  PAN: 'affinitymap-pan',
}

function App() {
  // Initialize state from localStorage or defaults
  const [people, setPeople] = useState<Person[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PEOPLE)
    return saved ? JSON.parse(saved) : []
  })
  
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  const [zoom, setZoom] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ZOOM)
    return saved ? JSON.parse(saved) : 1
  })
  
  const [pan, setPan] = useState<{ x: number; y: number }>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAN)
    return saved ? JSON.parse(saved) : { x: 0, y: 0 }
  })
  
  const positionsRef = useRef<CardPosition[]>([])
  
  // Initialize positions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.POSITIONS)
    if (saved) {
      positionsRef.current = JSON.parse(saved)
    }
  }, [])

  // Save people to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people))
  }, [people])

  // Save zoom to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ZOOM, JSON.stringify(zoom))
  }, [zoom])

  // Save pan to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAN, JSON.stringify(pan))
  }, [pan])

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
    localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(positions))
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
    localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(data.positions))
    setSelectedTags([]) // Clear filters on import
  }

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      setPeople([])
      positionsRef.current = []
      setZoom(1)
      setPan({ x: 0, y: 0 })
      setSelectedTags([])
      localStorage.removeItem(STORAGE_KEYS.PEOPLE)
      localStorage.removeItem(STORAGE_KEYS.POSITIONS)
      localStorage.removeItem(STORAGE_KEYS.ZOOM)
      localStorage.removeItem(STORAGE_KEYS.PAN)
    }
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
        onClearAllData={handleClearAllData}
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
        initialPan={pan}
        onPanChange={setPan}
      />
    </div>
  )
}

export default App
