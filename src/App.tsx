import { useState } from 'react'
import Board from './components/Board'
import Toolbar from './components/Toolbar'
import { Person } from './types'

function App() {
  const [people, setPeople] = useState<Person[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [zoom, setZoom] = useState(1)

  const handleAddPerson = (name: string) => {
    const newPerson: Person = {
      id: crypto.randomUUID(),
      name,
      tags: [],
    }
    setPeople([...people, newPerson])
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
      />
    </div>
  )
}

export default App
