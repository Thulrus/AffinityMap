# AffinityMap - Quick Reference

## ⚡ Quick Commands

```bash
npm run dev          # Start dev server → http://localhost:5173/AffinityMap/
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
```

## 🎨 VSCode Shortcuts

| Action | Shortcut |
|--------|----------|
| Start Dev Server | `Ctrl+Shift+B` |
| Run Any Task | `Ctrl+Shift+P` → "Tasks: Run Task" |
| Open Terminal | `Ctrl+`` |
| Command Palette | `Ctrl+Shift+P` |

## 📁 File Structure

```
src/
├── components/
│   ├── Board.tsx         # Canvas (pan/zoom/positioning)
│   ├── PersonCard.tsx    # Draggable cards
│   └── Toolbar.tsx       # Top bar controls
├── types.ts              # TypeScript interfaces
├── App.tsx               # Main component (state)
└── main.tsx              # Entry point
```

## 🎯 Key Features

- **Drag & Drop**: Click and drag person cards
- **Dual Cards**: Each person = minister (blue) + recipient (green)
- **Tags**: Add custom tags, filter by tags
- **Zoom/Pan**: +/- buttons, drag background to pan
- **Inline Edit**: Click name to edit

## 🔧 Quick Edits

| To Change | Edit File | Line/Section |
|-----------|-----------|--------------|
| Card colors | `src/components/PersonCard.tsx` | Line 83 (`bgColor`, `borderColor`) |
| Initial positions | `src/components/Board.tsx` | Lines 33-44 (useEffect) |
| Grid size | `src/components/Board.tsx` | Line 114 (pattern width/height) |
| Zoom limits | `src/components/Toolbar.tsx` | Lines 64-65 (Math.max/min) |

## 📦 Tech Stack

- React 18.3 + TypeScript 5
- Vite 5 (build tool)
- Tailwind CSS 3 (styling)
- DND Kit (ready, not yet used)
- GitHub Actions (auto-deploy)

## 🚀 Deploy to GitHub Pages

```bash
# 1. Create repo on GitHub
# 2. Push code:
git remote add origin https://github.com/YOUR_USERNAME/AffinityMap.git
git push -u origin main

# 3. Enable Pages in repo Settings → Pages → Source: "GitHub Actions"
# 4. Site deploys automatically on push to main
```

## 📝 Type Definitions

```typescript
interface Person {
  id: string
  name: string
  tags: string[]
}

interface Position {
  x: number
  y: number
}

interface PersonCard {
  person: Person
  position: Position
  type: 'minister' | 'recipient'
}
```

## 🎨 Tailwind Color Classes

Current theme:
- Background: `bg-gray-900`, `bg-gray-800`
- Text: `text-white`, `text-blue-400`
- Minister cards: `bg-blue-600`, `border-blue-400`
- Recipient cards: `bg-green-600`, `border-green-400`
- Buttons: `bg-gray-700`, `hover:bg-gray-600`

## 🔍 Common Issues

**TypeScript errors?**
- Run `npm run type-check`
- Check Problems panel in VSCode

**Port 5173 in use?**
- Vite auto-picks next port (5174, 5175...)

**Hot reload not working?**
- Save the file again
- Restart dev server

**Cards not dragging?**
- Check browser console for errors
- Ensure zoom !== 0

## 💡 Tips

1. Each person appears twice by design
2. No data persistence yet (refresh = reset)
3. Tags are created on-the-fly
4. Drag background to pan the board
5. Ctrl+Click on cards to multi-select (not implemented yet)

## 🔗 Important Files

- `vite.config.ts` - Deployment config (base path)
- `.github/workflows/deploy.yml` - Auto-deploy workflow
- `package.json` - Dependencies and scripts
- `tailwind.config.js` - Tailwind configuration
- `tsconfig.json` - TypeScript settings

## 📚 Documentation

- `README.md` - Full project overview
- `SETUP.md` - Setup instructions
- `PROJECT_SUMMARY.md` - What was built
- `.github/copilot-instructions.md` - AI context

---

**Need more help?** Check the full documentation files above!
