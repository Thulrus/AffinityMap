import { useState, useRef, useEffect } from 'react'
import PersonCard from './PersonCard'
import { Person, Position } from '../types'

interface BoardProps {
  people: Person[]
  allPeople: Person[]
  onUpdatePerson: (id: string, updates: Partial<Person>) => void
  onDeletePerson: (id: string) => void
  zoom: number
}

interface PersonPosition {
  id: string
  position: Position
  type: 'minister' | 'recipient'
}

export default function Board({ people, allPeople, onUpdatePerson, onDeletePerson, zoom }: BoardProps) {
  const [positions, setPositions] = useState<PersonPosition[]>([])
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [startPan, setStartPan] = useState<Position>({ x: 0, y: 0 })
  const boardRef = useRef<HTMLDivElement>(null)

  // Initialize positions for new people
  useEffect(() => {
    const existingIds = new Set(positions.map(p => p.id))
    const newPositions: PersonPosition[] = []

    people.forEach((person, index) => {
      // Create positions for minister cards (left side)
      const ministerId = `${person.id}-minister`
      if (!existingIds.has(ministerId)) {
        newPositions.push({
          id: ministerId,
          position: { x: 100, y: 100 + index * 150 },
          type: 'minister',
        })
      }

      // Create positions for recipient cards (right side)
      const recipientId = `${person.id}-recipient`
      if (!existingIds.has(recipientId)) {
        newPositions.push({
          id: recipientId,
          position: { x: 600, y: 100 + index * 150 },
          type: 'recipient',
        })
      }
    })

    if (newPositions.length > 0) {
      setPositions([...positions, ...newPositions])
    }
  }, [people])

  // Clean up positions for deleted people
  useEffect(() => {
    const peopleIds = new Set(people.map(p => p.id))
    setPositions(prev => prev.filter(pos => {
      const personId = pos.id.replace('-minister', '').replace('-recipient', '')
      return peopleIds.has(personId)
    }))
  }, [people, setPositions])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === boardRef.current) {
      setIsPanning(true)
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const handleCardMove = (id: string, newPosition: Position) => {
    setPositions(prev => 
      prev.map(p => p.id === id ? { ...p, position: newPosition } : p)
    )
  }

  const getPersonFromCardId = (cardId: string): Person | undefined => {
    const personId = cardId.replace('-minister', '').replace('-recipient', '')
    return allPeople.find(p => p.id === personId)
  }

  return (
    <div
      ref={boardRef}
      className="flex-1 relative overflow-hidden cursor-move bg-gray-800"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Grid lines for reference */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Person cards */}
        {positions.map(pos => {
          const person = getPersonFromCardId(pos.id)
          if (!person) return null

          return (
            <PersonCard
              key={pos.id}
              person={person}
              position={pos.position}
              type={pos.type}
              zoom={zoom}
              onMove={(newPos: Position) => handleCardMove(pos.id, newPos)}
              onUpdate={(updates: Partial<Person>) => onUpdatePerson(person.id, updates)}
              onDelete={() => onDeletePerson(person.id)}
            />
          )
        })}
      </div>

      {/* Instructions */}
      {people.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-500">
            <p className="text-xl mb-2">Get started by adding people above</p>
            <p className="text-sm">Each person will appear twice - once as a minister and once as a recipient</p>
          </div>
        </div>
      )}
    </div>
  )
}
