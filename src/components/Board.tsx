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
  const [touchStartPan, setTouchStartPan] = useState<Position | null>(null)
  const [currentGestureZoom, setCurrentGestureZoom] = useState<number | null>(null)
  const [wasRecentlyPinching, setWasRecentlyPinching] = useState(false)
  const boardRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const isInitializedRef = useRef(false)

  // Helper function to update pan without bounds checking (used during gestures)
  const updatePanImmediate = (newPan: Position) => {
    setPan(newPan)
    onPanChange(newPan)
  }

  // Helper function to update pan and save to parent with bounds checking
  const updatePan = (newPan: Position, applyBounds: boolean = true) => {
    if (!applyBounds) {
      updatePanImmediate(newPan)
      return
    }
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
    
    updatePanImmediate(newPan)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom])  // Only recreate when zoom changes, not when positions change

  // Constrain pan to prevent panning beyond bounds (clamp, don't snap)
  const constrainPan = (newPan: Position, currentZoom: number = zoom): Position => {
    const bounds = getCardBounds()
    if (!bounds || !boardRef.current) return newPan
    
    const rect = boardRef.current.getBoundingClientRect()
    
    // Add a margin - allow cards to go mostly off-screen before stopping pan
    const margin = 200 // pixels of card area that must remain visible
    
    // Calculate the pan limits (in screen coordinates)
    // When pan.x is at maxPanX, the left edge of cards is at the right edge of screen minus margin
    const maxPanX = rect.width - bounds.minX * currentZoom - margin
    // When pan.x is at minPanX, the right edge of cards is at the left edge of screen plus margin
    const minPanX = -bounds.maxX * currentZoom + margin
    
    // When pan.y is at maxPanY, the top edge of cards is at the bottom edge of screen minus margin
    const maxPanY = rect.height - bounds.minY * currentZoom - margin
    // When pan.y is at minPanY, the bottom edge of cards is at the top edge of screen plus margin
    const minPanY = -bounds.maxY * currentZoom + margin
    
    // Clamp the pan to stay within these limits
    const constrainedX = Math.max(minPanX, Math.min(maxPanX, newPan.x))
    const constrainedY = Math.max(minPanY, Math.min(maxPanY, newPan.y))
    
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
      updatePan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y }, false) // Don't apply bounds during panning
    }
  }

  const handleMouseUp = () => {
    const wasPanning = isPanning
    setIsPanning(false)
    
    // Only apply bounds if we were actually panning
    if (wasPanning) {
      setPan(currentPan => {
        const constrained = constrainPan(currentPan)
        onPanChange(constrained)
        return constrained
      })
    }
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
    
    // Calculate world position of mouse cursor at current zoom
    setPan(currentPan => {
      const worldX = (mouseX - currentPan.x) / zoom
      const worldY = (mouseY - currentPan.y) / zoom
      
      // Calculate new pan to keep that world position under the cursor at new zoom
      const newPanX = mouseX - worldX * newZoom
      const newPanY = mouseY - worldY * newZoom
      
      const constrained = constrainPan({ x: newPanX, y: newPanY })
      onPanChange(constrained)
      return constrained
    })
    
    onZoomChange(newZoom)
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
      
      // Pinch to zoom - store initial state
      const distance = getTouchDistance(e.touches)
      setTouchStartDistance(distance)
      setTouchStartZoom(zoom)
      setTouchStartPan(pan) // Store the pan at the start of pinch
      setWasRecentlyPinching(true) // Mark that we're pinching
      
      const rect = boardRef.current?.getBoundingClientRect()
      if (rect) {
        const center = getTouchCenter(e.touches)
        setTouchStartCenter({
          x: center.x - rect.left,
          y: center.y - rect.top,
        })
      }
    } else if (e.touches.length === 1 && !wasRecentlyPinching) {
      // Single finger pan - only allow if we weren't just pinching
      // Check if touching background
      const target = e.target as HTMLElement
      if (target === boardRef.current || target === contentRef.current || target.tagName === 'svg' || target.tagName === 'rect') {
        setIsPanning(true)
        setStartPan({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y })
      }
    }
  }

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistance && touchStartCenter && touchStartPan) {
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
        
        // Calculate the world position using the INITIAL pan (not current pan)
        // This prevents feedback loop with constrainPan
        const worldX = (touchStartCenter.x - touchStartPan.x) / touchStartZoom
        const worldY = (touchStartCenter.y - touchStartPan.y) / touchStartZoom
        
        // Calculate new pan so this world position appears at the current touch center
        const newPanX = currentCenterX - (worldX * newZoom)
        const newPanY = currentCenterY - (worldY * newZoom)
        
        onZoomChange(newZoom)
        setCurrentGestureZoom(newZoom) // Store zoom for bounds calculation at gesture end
        updatePan({ x: newPanX, y: newPanY }, false) // Don't apply bounds during gesture
      }
    } else if (e.touches.length === 1 && isPanning && !wasRecentlyPinching) {
      // Single finger pan - only allow if we weren't just pinching and isPanning is true
      updatePan({ x: e.touches[0].clientX - startPan.x, y: e.touches[0].clientY - startPan.y }, false)
    }
  }

  // Handle touch end
  const handleTouchEnd = (e: React.TouchEvent) => {
    const wasPinching = touchStartDistance !== null
    const wasPanning = isPanning
    const finalZoom = currentGestureZoom !== null ? currentGestureZoom : zoom
    
    if (e.touches.length < 2) {
      // Ending a pinch or going from 2+ fingers to 1
      setTouchStartDistance(null)
      setTouchStartCenter(null)
      setTouchStartPan(null)
      setCurrentGestureZoom(null)
      
      // If we were pinching and now have 1 finger left, don't let it turn into a pan
      if (wasPinching && e.touches.length === 1) {
        setIsPanning(false)
      }
    }
    
    if (e.touches.length === 0) {
      setIsPanning(false)
      setWasRecentlyPinching(false) // Reset the flag when all touches are released
      
      // Apply bounds constraint when gesture ends, using the final zoom value
      if (wasPinching || wasPanning) {
        setPan(currentPan => {
          const constrained = constrainPan(currentPan, finalZoom)
          onPanChange(constrained)
          return constrained
        })
      }
    }
  }

  const getPersonFromCardId = (cardId: string): Person | undefined => {
    const personId = cardId.replace('-minister', '').replace('-recipient', '')
    return allPeople.find(p => p.id === personId)
  }

  const boardCursorClass = isPanning ? 'cursor-grabbing' : 'cursor-grab'

  return (
    <div
      ref={boardRef}
      className={`flex-1 relative overflow-hidden ${boardCursorClass} bg-gray-800`}
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
              pan={pan}
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
