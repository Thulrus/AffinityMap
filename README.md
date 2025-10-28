# AffinityMap

A visual web application for managing ministering assignments with an intuitive drag-and-drop interface.

A version is running on GitHub Pages, that you can use [here](https://thulrus.github.io/AffinityMap/)

## Overview

AffinityMap helps organize people into ministering assignments using a visual canvas where names can be dragged around, grouped, and connected. The interface allows you to:

- View each person twice on the board: once as a minister and once as a recipient
- Assign partners (1 per person) and ministering recipients (2-3 per person)
- Tag people with custom labels (e.g., "young family", "works from home", "young couple")
- Filter by tags to easily match people
- Zoom and pan to get a better view of assignments
- Drag and drop cards to organize people spatially

## Features

- **Visual Canvas**: Zoom and pan to navigate your assignment board
- **Drag & Drop**: Move person cards freely to organize them
- **Dual Cards**: Each person appears twice - as a minister and as a recipient
- **Custom Tags**: Add any tags you need to categorize people
- **Tag Filtering**: Filter the view by selected tags
- **Real-time Updates**: All changes are reflected immediately
- **Clean UI**: Modern, dark-themed interface built with React and Tailwind CSS

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **DND Kit** - Drag and drop functionality (ready to integrate)

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/AffinityMap.git
cd AffinityMap
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### VSCode Tasks

This project includes VSCode tasks for common operations:

- **Run Dev Server**: Starts the Vite development server (Ctrl+Shift+B)
- **Build**: Creates a production build
- **Preview**: Previews the production build locally
- **Type Check**: Runs TypeScript type checking

Access tasks via Terminal → Run Task in VSCode.

## Development

### Project Structure

```
AffinityMap/
├── src/
│   ├── components/
│   │   ├── Board.tsx         # Main canvas component
│   │   ├── PersonCard.tsx    # Individual person card
│   │   └── Toolbar.tsx       # Top toolbar with controls
│   ├── types.ts              # TypeScript type definitions
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
├── public/                   # Static assets
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Pages deployment
└── package.json
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler checks

## Deployment

This project is configured to deploy automatically to GitHub Pages when you push to the `main` branch.

### Setup GitHub Pages

1. Push your code to GitHub
2. Go to your repository Settings → Pages
3. Set Source to "GitHub Actions"
4. Push to main branch - the site will deploy automatically

The site will be available at `https://YOUR_USERNAME.github.io/AffinityMap/`

### Update Base Path

If your repository name is different from "AffinityMap", update the `base` path in `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/YOUR_REPO_NAME/',
  // ...
})
```

## Future Enhancements

Potential features for future development:

- Connection lines between ministers and recipients
- Save/load functionality (localStorage or file export)
- Import from CSV or other formats
- Assignment validation (ensure everyone has assignments)
- Undo/redo functionality
- Multiple boards or views
- Print-friendly output
- Search functionality

## Contributing

This is an open-source project. Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Acknowledgments

Built with modern web technologies for church ministering coordinators and similar organizing needs.
