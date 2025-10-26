import { useState, useRef, useEffect, useCallback } from 'react'
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
  initialPan: Position
  onPanChange: (pan: Position) => void
  recenterTrigger?: number
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
  initialPositions,
  initialPan,
  onPanChange,
  recenterTrigger
}: BoardProps) {
  const [positions, setPositions] = useState<PersonPosition[]>([])
  const [pan, setPan] = useState<Position>(initialPan)
  const [isPanning, setIsPanning] = useState(false)
  const [startPan, setStartPan] = useState<Position>({ x: 0, y: 0 })
  const [touchStartDistance, setTouchStartDistance] = useState<number | null>(null)
  const [touchStartZoom, setTouchStartZoom] = useState<number>(1)
  const [touchStartCenter, setTouchStartCenter] = useState<Position | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const isInitializedRef = useRef(false)

  // Helper function to update pan and save to parent with bounds checking
  const updatePan = (newPan: Position) => {
    const constrainedPan = constrainPan(newPan)
    setPan(constrainedPan)
    onPanChange(constrainedPan)
  }

  // Calculate bounds of all card positions
  const getCardBounds = () => {
    if (positions.length === 0) return null
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    
    positions.forEach(pos => {
      minX = Math.min(minX, pos.position.x)
      minY = Math.min(minY, pos.position.y)
      maxX = Math.max(maxX, pos.position.x + 250) // Approximate card width
      maxY = Math.max(maxY, pos.position.y + 150) // Approximate card height
    })
    
    return { minX, minY, maxX, maxY }
  }

  // Center view on all cards
  const recenterView = useCallback(() => {
    const bounds = getCardBounds()
    if (!bounds || !boardRef.current) return
    
    const rect = boardRef.current.getBoundingClientRect()
    const centerX = (bounds.minX + bounds.maxX) / 2
    const centerY = (bounds.minY + bounds.maxY) / 2
    
    // Center the cards in the viewport
    const newPan = {
      x: rect.width / 2 - centerX * zoom,
      y: rect.height / 2 - centerY * zoom
    }
    
    updatePan(newPan)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, positions])

  // Constrain pan to keep at least one card visible
  const constrainPan = (newPan: Position): Position => {
    const bounds = getCardBounds()
    if (!bounds || !boardRef.current) return newPan
    
    const rect = boardRef.current.getBoundingClientRect()
    
    // Calculate the bounds of visible area in world coordinates
    const viewMinX = -newPan.x / zoom
    const viewMinY = -newPan.y / zoom
    const viewMaxX = (rect.width - newPan.x) / zoom
    const viewMaxY = (rect.height - newPan.y) / zoom
    
    // Check if any part of the cards is visible
    const isVisible = !(
      bounds.maxX < viewMinX || // All cards are left of view
      bounds.minX > viewMaxX || // All cards are right of view
      bounds.maxY < viewMinY || // All cards are above view
      bounds.minY > viewMaxY    // All cards are below view
    )
    
    if (isVisible) return newPan
    
    // If not visible, constrain the pan to show at least some cards
    let constrainedX = newPan.x
    let constrainedY = newPan.y
    
    if (bounds.maxX < viewMinX) {
      // Cards are too far left, show right edge
      constrainedX = -bounds.maxX * zoom + rect.width
    } else if (bounds.minX > viewMaxX) {
      // Cards are too far right, show left edge
      constrainedX = -bounds.minX * zoom
    }
    
    if (bounds.maxY < viewMinY) {
      // Cards are too far up, show bottom edge
      constrainedY = -bounds.maxY * zoom + rect.height
    } else if (bounds.minY > viewMaxY) {
      // Cards are too far down, show top edge
      constrainedY = -bounds.minY * zoom
    }
    
    return { x: constrainedX, y: constrainedY }
  }

  // Trigger recenter when recenterTrigger changes
  useEffect(() => {
    if (recenterTrigger && recenterTrigger > 0) {
      recenterView()
    }
  }, [recenterTrigger, recenterView])

  // Prevent default browser gestures on touch devices
  useEffect(() => {
    const board = boardRef.current
    if (!board) return

    const preventGestures = (e: TouchEvent) => {
      // Prevent browser pinch-zoom and other default touch behaviors
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }

    board.addEventListener('touchstart', preventGestures, { passive: false })
    board.addEventListener('touchmove', preventGestures, { passive: false })

    return () => {
      board.removeEventListener('touchstart', preventGestures)
      board.removeEventListener('touchmove', preventGestures)
    }
  }, [])

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
    // Close any open menus in toolbar
    const closeMenus = (window as unknown as { __affinityMapCloseMenus?: () => void }).__affinityMapCloseMenus
    if (closeMenus) closeMenus()

    const target = e.target as HTMLElement
    // Allow panning on the board container or the content area (but not on cards)
    if (target === boardRef.current || target === contentRef.current || target.tagName === 'svg' || target.tagName === 'rect') {
      setIsPanning(true)
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      updatePan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y })
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
    updatePan({ x: newPanX, y: newPanY })
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
    // Close any open menus in toolbar
    const closeMenus = (window as unknown as { __affinityMapCloseMenus?: () => void }).__affinityMapCloseMenus
    if (closeMenus) closeMenus()

    if (e.touches.length === 2) {
      // Prevent default browser pinch-zoom
      e.preventDefault()
      
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
    } else if (e.touches.length === 1) {
      // Single finger pan - check if touching background
      const target = e.target as HTMLElement
      if (target === boardRef.current || target === contentRef.current || target.tagName === 'svg' || target.tagName === 'rect') {
        setIsPanning(true)
        setStartPan({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y })
      }
    }
  }

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistance && touchStartCenter) {
      // Pinch zoom
      e.preventDefault()
      const currentDistance = getTouchDistance(e.touches)
      const scale = currentDistance / touchStartDistance
      const newZoom = Math.max(0.25, Math.min(2, touchStartZoom * scale))
      
      const rect = boardRef.current?.getBoundingClientRect()
      if (rect) {
        const currentCenter = getTouchCenter(e.touches)
        const currentCenterX = currentCenter.x - rect.left
        const currentCenterY = currentCenter.y - rect.top
        
        // Calculate the world position (in content coordinates) that should stay under the pinch center
        // The formula: world_pos = (screen_pos - pan) / zoom
        const worldX = (touchStartCenter.x - pan.x) / zoom
        const worldY = (touchStartCenter.y - pan.y) / zoom
        
        // Calculate new pan so this world position appears at the current touch center
        // Rearranging: pan = screen_pos - (world_pos * new_zoom)
        const newPanX = currentCenterX - (worldX * newZoom)
        const newPanY = currentCenterY - (worldY * newZoom)
        
        onZoomChange(newZoom)
        updatePan({ x: newPanX, y: newPanY })
      }
    } else if (e.touches.length === 1 && isPanning) {
      // Single finger pan
      updatePan({ x: e.touches[0].clientX - startPan.x, y: e.touches[0].clientY - startPan.y })
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
      style={{ touchAction: 'none' }}
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
        ref={contentRef}
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
