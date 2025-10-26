# AffinityMap Setup Guide

## Quick Start

The project is now ready to use! Here's what you can do:

### Start Development Server

Use one of these methods:

1. **VSCode Task** (Recommended):
   - Press `Ctrl+Shift+B` (or `Cmd+Shift+B` on Mac)
   - Select "Run Dev Server"
   - The server will start at http://localhost:5173/AffinityMap/

2. **Command Line**:
   ```bash
   npm run dev
   ```

3. **VSCode Command Palette**:
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "Tasks: Run Task"
   - Select "Run Dev Server"

### Available Tasks

You can access these via Terminal → Run Task in VSCode:

- **Run Dev Server** - Start development server (default build task)
- **Build** - Create production build
- **Preview** - Preview production build locally
- **Type Check** - Run TypeScript type checking
- **Install Dependencies** - Install or update npm packages

### Project Structure

```
AffinityMap/
├── src/
│   ├── components/
│   │   ├── Board.tsx         # Main canvas with zoom/pan
│   │   ├── PersonCard.tsx    # Draggable person cards
│   │   └── Toolbar.tsx       # Top control bar
│   ├── types.ts              # TypeScript definitions
│   ├── App.tsx               # Main app component
│   └── main.tsx              # Entry point
├── .vscode/
│   ├── tasks.json            # VSCode tasks
│   └── extensions.json       # Recommended extensions
└── .github/workflows/
    └── deploy.yml            # Auto-deploy to GitHub Pages
```

### Using the App

1. **Add People**: Type names in the toolbar and click "Add Person"
2. **Drag Cards**: Click and drag person cards to organize them
3. **Add Tags**: Click on a card, type a tag in the input field, press Enter
4. **Edit Names**: Click on a person's name to edit it
5. **Filter by Tags**: Click "Filter by Tags" to show only certain tags
6. **Zoom**: Use the +/- buttons in the toolbar
7. **Pan**: Click and drag on the background to move around

### Next Steps

#### Deploy to GitHub

1. Create a new repository on GitHub named "AffinityMap"
2. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/AffinityMap.git
   git push -u origin main
   ```
3. Enable GitHub Pages:
   - Go to repository Settings → Pages
   - Set Source to "GitHub Actions"
   - The site will deploy automatically

#### Customize

- Update the repository name in `vite.config.ts` if different from "AffinityMap"
- Modify colors in `src/components/PersonCard.tsx`
- Add more features as needed

### Troubleshooting

**Port already in use?**
- Vite will automatically try the next available port (5174, 5175, etc.)

**Dependencies not installed?**
- Run the "Install Dependencies" task or `npm install`

**Build errors?**
- Run "Type Check" task to see TypeScript errors
- Check the Terminal output for details

### Development Tips

- Hot reload is enabled - changes appear instantly
- TypeScript errors show in the Problems panel
- ESLint checks code quality automatically
- Tailwind CSS provides utility classes for styling

## Features Implemented

✅ Drag and drop person cards  
✅ Dual cards (minister + recipient) for each person  
✅ Custom tags with filtering  
✅ Zoom and pan controls  
✅ Edit person names inline  
✅ Delete persons  
✅ Visual grid background  
✅ Responsive toolbar  
✅ GitHub Pages deployment ready  

## Future Enhancements

Consider adding:
- Connection lines between ministers and recipients
- Save/load to localStorage or file
- Import from CSV
- Assignment validation
- Undo/redo
- Export to PDF or image
- Multiple boards
- Search functionality
