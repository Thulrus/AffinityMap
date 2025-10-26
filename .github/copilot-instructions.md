# AffinityMap - GitHub Copilot Instructions

This project is AffinityMap, a visual web application for managing ministering assignments.

## Project Overview

AffinityMap is a React + TypeScript application that provides a drag-and-drop canvas for organizing people into ministering assignments. Each person appears twice on the board - once as a minister (who will minister to others) and once as a recipient (who will receive ministering).

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **Drag & Drop**: Manual implementation (DND Kit available but not yet integrated)
- **Deployment**: GitHub Pages via GitHub Actions

## Key Concepts

### Person Cards
- Each person has two cards: one "minister" card (blue) and one "recipient" card (green)
- Cards can be dragged around the canvas to organize them spatially
- Cards support custom tags for categorization
- Names can be edited inline by clicking on them

### Board System
- The board is a zoomable/pannable canvas
- Uses React state to track card positions
- Grid background provides visual reference
- Pan by dragging the background, zoom with toolbar controls

### Data Structure
- `Person`: Core entity with id, name, and tags array
- `PersonCard`: Combines Person with position and type (minister/recipient)
- `Position`: Simple x/y coordinates
- No backend - all state is in-memory (no persistence yet)

## Code Organization

```
src/
├── components/
│   ├── Board.tsx         # Main canvas, handles pan/zoom and positioning
│   ├── PersonCard.tsx    # Individual draggable card component
│   └── Toolbar.tsx       # Top control bar with add, filter, zoom
├── types.ts              # TypeScript type definitions
├── App.tsx               # Root component, state management
└── main.tsx              # Entry point
```

## Development Guidelines

### When Adding Features

1. **New UI Components**: Create in `src/components/`
2. **New Data Types**: Add to `src/types.ts`
3. **State Management**: Keep in `App.tsx` for now (consider Context API or state library if it grows)
4. **Styling**: Use Tailwind utility classes

### Code Style

- Use functional components with hooks
- TypeScript strict mode is enabled
- Use explicit types (avoid `any`)
- Follow existing naming conventions
- ESLint configuration is in `.eslintrc.cjs`

### Touch Device Support

**IMPORTANT**: Touch device support is a priority for this project. When implementing features:
- Always consider both mouse and touch interactions
- Test gestures: tap, drag, pinch-to-zoom, two-finger pan
- Ensure touch targets are appropriately sized (minimum 44x44px)
- Provide visual feedback for touch interactions
- Use touch events (`touchstart`, `touchmove`, `touchend`) alongside mouse events
- Consider pointer events API for unified mouse/touch/pen handling
- Test on actual touch devices when possible

### Common Tasks

**Adding a new feature:**
1. Update types if needed (`types.ts`)
2. Create or modify components
3. Update parent state in `App.tsx` if needed
4. Test in dev server (`npm run dev`)

**Modifying the canvas:**
- Board dimensions and behavior: `Board.tsx`
- Card appearance: `PersonCard.tsx`
- Card positioning logic: `Board.tsx` (useEffect hooks)

**Changing styles:**
- Use Tailwind classes inline
- Global styles in `index.css`
- Dark theme is default

## Future Development Ideas

The following features are planned but not yet implemented:

- **Connection Lines**: Visual lines connecting ministers to recipients
- **Data Persistence**: localStorage or file export/import
- **CSV Import**: Bulk import from spreadsheet
- **Assignment Validation**: Ensure everyone has proper assignments
- **Undo/Redo**: Action history system
- **Multiple Boards**: Support for different groups or time periods
- **Print View**: Printer-friendly output
- **Search**: Find people by name or tag

## Important Notes

### State Management
- All application state lives in `App.tsx`
- Card positions stored separately from Person data
- Filtering is client-side only

### Drag and Drop
- Currently using manual mouse event handling
- DND Kit is installed but not yet integrated
- Consider migrating to DND Kit for better accessibility

### Deployment
- GitHub Actions workflow deploys on push to `main`
- Base path is `/AffinityMap/` - update in `vite.config.ts` if repo name changes
- Build output goes to `dist/`

### Performance Considerations
- Current implementation handles ~50 people well
- For larger datasets, consider virtualization
- Position updates use React state - may need optimization for 100+ cards

## Testing

No testing framework is set up yet. When adding tests:
- Consider Vitest (already compatible with Vite)
- React Testing Library for component tests
- Playwright or Cypress for E2E tests

## Debugging

- React DevTools recommended
- TypeScript errors shown in Problems panel
- Console.log debugging is fine for now
- Dev server has HMR (hot module reload)

## Contribution Guidelines

When contributing:
1. Keep the code simple and readable
2. Add TypeScript types for new features
3. Test manually before committing
4. Follow the existing component patterns
5. Update documentation if adding major features

## Questions to Ask

If you're unsure about implementation details, consider:
- "How should this interact with existing state?"
- "Does this need to be a new component?"
- "Should this be type-safe?"
- "How will this scale with many people?"
- "Is this consistent with the current UX?"
