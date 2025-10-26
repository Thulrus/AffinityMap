import { useState, useRef, useEffect } from 'react'
import PersonCard from './PersonCard'
import { Person, Position, CardPosition } from '../types'

interface BoardProps {
  people: Person[]
  allPeople: Person[]
  onUpdatePerson: (id: string, updates: Partial<Person>) => void
  onDeletePerson: (id: string) => void
  zoom: number
  onZoomChange: (zoom: number) => void
  onPositionsUpdate: (positions: CardPosition[]) => void
  initialPositions: CardPosition[]
}

interface PersonPosition {
  id: string
  position: Position
  type: 'minister' | 'recipient'
}

export default function Board({ 
  people, 
  allPeople, 
  onUpdatePerson, 
  onDeletePerson, 
  zoom, 
  onZoomChange, 
  onPositionsUpdate,
  initialPositions 
}: BoardProps) {
  const [positions, setPositions] = useState<PersonPosition[]>([])
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [startPan, setStartPan] = useState<Position>({ x: 0, y: 0 })
  const [touchStartDistance, setTouchStartDistance] = useState<number | null>(null)
  const [touchStartZoom, setTouchStartZoom] = useState<number>(1)
  const [touchStartCenter, setTouchStartCenter] = useState<Position | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const isInitializedRef = useRef(false)

  // Initialize positions from imported data on first render
  useEffect(() => {
    if (!isInitializedRef.current && initialPositions.length > 0) {
      setPositions(initialPositions)
      isInitializedRef.current = true
    }
  }, [initialPositions])

  // Report position changes to parent
  useEffect(() => {
    if (positions.length > 0) {
      onPositionsUpdate(positions)
    }
  }, [positions, onPositionsUpdate])

  // Initialize positions for new people
  useEffect(() => {
    setPositions(prev => {
      const existingIds = new Set(prev.map(p => p.id))
      const newPositions: PersonPosition[] = []

      allPeople.forEach((person, index) => {
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
        return [...prev, ...newPositions]
      }
      return prev
    })
  }, [allPeople])

  // Clean up positions for deleted people
  useEffect(() => {
    const peopleIds = new Set(allPeople.map(p => p.id))
    setPositions(prev => prev.filter(pos => {
      const personId = pos.id.replace('-minister', '').replace('-recipient', '')
      return peopleIds.has(personId)
    }))
  }, [allPeople])

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

  // Handle mouse wheel zoom centered on cursor
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    
    const rect = boardRef.current?.getBoundingClientRect()
    if (!rect) return

    // Get mouse position relative to board
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Calculate zoom change
    const delta = -e.deltaY * 0.001
    const newZoom = Math.max(0.25, Math.min(2, zoom + delta))
    
    // Calculate new pan to keep mouse position fixed
    const scale = newZoom / zoom
    const newPanX = mouseX - (mouseX - pan.x) * scale
    const newPanY = mouseY - (mouseY - pan.y) * scale

    onZoomChange(newZoom)
    setPan({ x: newPanX, y: newPanY })
  }

  // Get distance between two touch points
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Get center point between two touches
  const getTouchCenter = (touches: React.TouchList): Position => {
    if (touches.length < 2) return { x: touches[0].clientX, y: touches[0].clientY }
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    }
  }

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch to zoom
      const distance = getTouchDistance(e.touches)
      setTouchStartDistance(distance)
      setTouchStartZoom(zoom)
      
      const rect = boardRef.current?.getBoundingClientRect()
      if (rect) {
        const center = getTouchCenter(e.touches)
        setTouchStartCenter({
          x: center.x - rect.left,
          y: center.y - rect.top,
        })
      }
    } else if (e.touches.length === 1 && e.target === boardRef.current) {
      // Single finger pan
      setIsPanning(true)
      setStartPan({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y })
    }
  }

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistance) {
      // Pinch zoom
      e.preventDefault()
      const currentDistance = getTouchDistance(e.touches)
      const scale = currentDistance / touchStartDistance
      const newZoom = Math.max(0.25, Math.min(2, touchStartZoom * scale))
      
      if (touchStartCenter) {
        const rect = boardRef.current?.getBoundingClientRect()
        if (rect) {
          const center = getTouchCenter(e.touches)
          const centerX = center.x - rect.left
          const centerY = center.y - rect.top
          
          // Adjust pan to keep zoom centered on pinch point
          const zoomScale = newZoom / zoom
          const newPanX = centerX - (touchStartCenter.x - pan.x) * zoomScale
          const newPanY = centerY - (touchStartCenter.y - pan.y) * zoomScale
          
          setPan({ x: newPanX, y: newPanY })
        }
      }
      
      onZoomChange(newZoom)
    } else if (e.touches.length === 1 && isPanning) {
      // Single finger pan
      setPan({ x: e.touches[0].clientX - startPan.x, y: e.touches[0].clientY - startPan.y })
    }
  }

  // Handle touch end
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      setTouchStartDistance(null)
      setTouchStartCenter(null)
    }
    if (e.touches.length === 0) {
      setIsPanning(false)
    }
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
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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
          
          // Only show cards for people in the filtered list
          const isVisible = people.some(p => p.id === person.id)
          if (!isVisible) return null

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
