import React, { useState, useEffect, useRef, useMemo } from 'react';

type Shape = 'f' | 'tl' | 'tr' | 'bl' | 'br' | 'tc' | 'bc' | 'lc' | 'rc' | 'ci' | 'hs' | 'vs' | 'ds' | 'ch' | 'tg' | 'sb' | 'empty';

const BaseTile = ({ shape }: { shape: Shape }) => {
  if (shape === 'empty') return null;

  if (shape === 'f') return <div className="w-full h-full bg-black" />;
  if (shape === 'tl') return <div className="w-full h-full bg-black rounded-tl-full" />;
  if (shape === 'tr') return <div className="w-full h-full bg-black rounded-tr-full" />;
  if (shape === 'bl') return <div className="w-full h-full bg-black rounded-bl-full" />;
  if (shape === 'br') return <div className="w-full h-full bg-black rounded-br-full" />;
  if (shape === 'tc') return <div className="w-full h-full bg-black rounded-t-full" />;
  if (shape === 'bc') return <div className="w-full h-full bg-black rounded-b-full" />;
  if (shape === 'lc') return <div className="w-full h-full bg-black rounded-l-full" />;
  if (shape === 'rc') return <div className="w-full h-full bg-black rounded-r-full" />;
  if (shape === 'ci') return <div className="w-full h-full bg-black rounded-full scale-90" />;

  if (shape === 'hs') return (
    <div className="w-full h-full" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #000, #000 6px, transparent 6px, transparent 12px)' }} />
  );
  if (shape === 'vs') return (
    <div className="w-full h-full" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #000, #000 6px, transparent 6px, transparent 12px)' }} />
  );
  if (shape === 'ds') return (
    <div className="w-full h-full" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000, #000 6px, transparent 6px, transparent 12px)' }} />
  );
  if (shape === 'ch') return (
    <div className="w-full h-full" style={{
      backgroundImage: 'conic-gradient(#000 90deg, transparent 90deg 180deg, #000 180deg 270deg, transparent 270deg)',
      backgroundSize: '16px 16px'
    }} />
  );
  if (shape === 'tg') return (
    <div className="w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 40 40" className="w-[85%] h-[85%]">
        <circle cx="20" cy="20" r="18" fill="none" stroke="black" strokeWidth="4" />
        <circle cx="20" cy="20" r="10" fill="none" stroke="black" strokeWidth="4" />
        <circle cx="20" cy="20" r="2" fill="black" />
      </svg>
    </div>
  );
  if (shape === 'sb') return (
    <div className="w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 40 40" className="w-[85%] h-[85%]">
        {Array.from({ length: 8 }).map((_, i) => (
          <line 
            key={i} 
            x1="20" y1="20" x2="20" y2="2" 
            stroke="black" strokeWidth="3" 
            transform={`rotate(${i * 45} 20 20)`} 
          />
        ))}
      </svg>
    </div>
  );

  return null;
};

const GLYPHS: Record<string, Shape[]> = {
  'A': [
    'br', 'tc', 'bl',
    'f',  'hs',  'f',
    'f',  'empty',  'f'
  ],
  'B': [
    'f', 'f', 'rc',
    'f', 'sb', 'rc',
    'f', 'f', 'rc'
  ],
  'C': [
    'br', 'tc', 'bl',
    'vs', 'empty', 'empty',
    'tr', 'bc', 'tl'
  ],
  'D': [
    'f', 'f', 'rc',
    'ds', 'empty', 'f',
    'f', 'f', 'rc'
  ],
  'E': [
    'f', 'ch', 'f',
    'f', 'sb', 'empty',
    'f', 'f', 'hs'
  ],
  'F': [
    'f', 'f', 'f',
    'vs', 'f', 'empty',
    'f', 'empty', 'empty'
  ],
  'G': [
    'br', 'tc', 'bl',
    'lc', 'empty', 'ds',
    'tr', 'bc', 'f'
  ],
  'H': [
    'f', 'empty', 'f',
    'sb', 'f', 'f',
    'ds', 'empty', 'f'
  ],
  'I': [
    'f', 'f', 'f',
    'empty', 'tg', 'empty',
    'f', 'f', 'f'
  ],
  'J': [
    'empty', 'empty', 'f',
    'empty', 'empty', 'ch',
    'tr', 'bc', 'tl'
  ],
  'K': [
    'f', 'empty', 'hs',
    'tg', 'tc', 'empty',
    'f', 'empty', 'tl'
  ],
  'L': [
    'f', 'empty', 'empty',
    'ds', 'empty', 'empty',
    'f', 'f', 'ch'
  ],
  'M': [
    'br', 'tg', 'bl',
    'f', 'f', 'f',
    'vs', 'empty', 'vs'
  ],
  'N': [
    'tl', 'empty', 'tr',
    'f', 'ds', 'f',
    'hs', 'empty', 'f'
  ],
  'O': [
    'br', 'tc', 'bl',
    'lc', 'tg', 'rc',
    'tr', 'bc', 'tl'
  ],
  'P': [
    'f', 'f', 'rc',
    'vs', 'f', 'rc',
    'f', 'empty', 'empty'
  ],
  'Q': [
    'br', 'ch', 'bl',
    'lc', 'empty', 'rc',
    'tr', 'bc', 'ds'
  ],
  'R': [
    'f', 'f', 'rc',
    'ch', 'f', 'rc',
    'f', 'empty', 'sb'
  ],
  'S': [
    'br', 'tc', 'bl',
    'tr', 'tg', 'bl',
    'tr', 'bc', 'tl'
  ],
  'T': [
    'hs', 'f', 'f',
    'empty', 'tg', 'empty',
    'empty', 'f', 'empty'
  ],
  'U': [
    'f', 'empty', 'f',
    'vs', 'empty', 'vs',
    'tr', 'bc', 'tl'
  ],
  'V': [
    'f', 'empty', 'f',
    'ds', 'empty', 'ds',
    'empty', 'bc', 'empty'
  ],
  'W': [
    'vs', 'empty', 'vs',
    'f', 'tg', 'f',
    'tr', 'bc', 'tl'
  ],
  'X': [
    'ch', 'empty', 'ch',
    'empty', 'sb', 'empty',
    'tr', 'empty', 'tl'
  ],
  'Y': [
    'f', 'empty', 'f',
    'tr', 'bc', 'tl',
    'empty', 'hs', 'empty'
  ],
  'Z': [
    'f', 'hs', 'f',
    'empty', 'ds', 'tl',
    'f', 'f', 'f'
  ],
  '0': [
    'br', 'tc', 'bl',
    'lc', 'ch', 'rc',
    'tr', 'bc', 'tl'
  ],
  '1': [
    'br', 'f', 'empty',
    'empty', 'vs', 'empty',
    'f', 'f', 'f'
  ],
  '2': [
    'br', 'tc', 'bl',
    'empty', 'ds', 'tl',
    'f', 'f', 'ch'
  ],
  '3': [
    'br', 'tc', 'bl',
    'empty', 'tg', 'bl',
    'tr', 'bc', 'tl'
  ],
  '4': [
    'f', 'empty', 'f',
    'f', 'hs', 'f',
    'empty', 'empty', 'vs'
  ],
  '5': [
    'ch', 'f', 'f',
    'f', 'f', 'bl',
    'tr', 'bc', 'tl'
  ],
  '6': [
    'br', 'tc', 'bl',
    'vs', 'f', 'bl',
    'tr', 'bc', 'tl'
  ],
  '7': [
    'f', 'f', 'hs',
    'empty', 'empty', 'ds',
    'empty', 'empty', 'f'
  ],
  '8': [
    'br', 'tc', 'bl',
    'tr', 'tg', 'tl',
    'tr', 'bc', 'tl'
  ],
  '9': [
    'br', 'tc', 'bl',
    'tr', 'sb', 'f',
    'empty', 'empty', 'vs'
  ],
  ' ': [
    'empty', 'empty', 'empty',
    'empty', 'empty', 'empty',
    'empty', 'empty', 'empty'
  ]
};

export default function GridTypographyEffect() {
  const [word, setWord] = useState("TECH");
  const [cols, setCols] = useState(0);
  const [rows, setRows] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Constants
  const CELL_SIZE = 60; // Pixels per cell

  useEffect(() => {
    const updateGridSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        setCols(Math.floor(width / CELL_SIZE));
        setRows(Math.floor(height / CELL_SIZE));
      }
    };

    updateGridSize();
    window.addEventListener('resize', updateGridSize);
    return () => window.removeEventListener('resize', updateGridSize);
  }, []);

  const gridMap = useMemo(() => {
    // Create an empty grid
    const grid: Shape[][] = Array(rows).fill(null).map(() => Array(cols).fill('empty'));
    
    if (rows === 0 || cols === 0 || !word) return grid;

    const chars = word.toUpperCase().split('');
    
    // Max letters per row is either 8 or what can fit in the columns, whichever is smaller
    const maxLettersPerRow = Math.min(8, Math.max(1, Math.floor((cols + 1) / 4)));
    
    const numLetterRows = Math.ceil(chars.length / maxLettersPerRow);
    const totalGridRowsNeeded = numLetterRows * 3 + Math.max(0, numLetterRows - 1);
    
    // Start drawing roughly in the center vertically
    const startRow = Math.max(0, Math.floor((rows - totalGridRowsNeeded) / 2));

    chars.forEach((char, index) => {
      const rowIndex = Math.floor(index / maxLettersPerRow);
      const colIndex = index % maxLettersPerRow;
      
      // Calculate how many letters are actually in this specific row to center it
      const lettersInThisRow = Math.min(chars.length - rowIndex * maxLettersPerRow, maxLettersPerRow);
      const rowWidth = lettersInThisRow * 3 + Math.max(0, lettersInThisRow - 1);
      const startCol = Math.max(0, Math.floor((cols - rowWidth) / 2));

      const gridRBase = startRow + rowIndex * 4; // 3 for char + 1 for gap
      const gridCBase = startCol + colIndex * 4;

      const glyph = GLYPHS[char] || GLYPHS[' '];
      
      // Draw 3x3 glyph
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const gridR = gridRBase + r;
          const gridC = gridCBase + c;
          
          if (gridR >= 0 && gridR < rows && gridC >= 0 && gridC < cols) {
            grid[gridR][gridC] = glyph[r * 3 + c];
          }
        }
      }
    });

    return grid;
  }, [word, cols, rows]);

  return (
    <div className="w-full h-full flex flex-col bg-[#e7e5dc] relative font-ibm-mono overflow-hidden">
      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-grow w-full relative overflow-hidden"
      >
        <div 
          className="absolute inset-0 grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${rows}, ${CELL_SIZE}px)`,
            // Center the grid within the container
            justifyContent: 'center',
            alignContent: 'center'
          }}
        >
          {gridMap.flatMap((row, r) => 
            row.map((shape, c) => (
              <div 
                key={`${r}-${c}`}
                className="border-r-2 border-b-2 border-black flex items-center justify-center"
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  borderTop: r === 0 ? '2px solid black' : 'none',
                  borderLeft: c === 0 ? '2px solid black' : 'none',
                }}
              >
                <BaseTile shape={shape} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="h-24 border-t border-black bg-[#fdfcfb] flex items-center px-8 z-10">
        <div className="w-full max-w-xl flex items-center gap-4">
          <label className="text-xs font-semibold uppercase tracking-widest text-black/50 whitespace-nowrap">
            Prompt
          </label>
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 32))}
            placeholder="TYPE A WORD"
            className="w-full bg-transparent border-b-2 border-black px-2 py-2 text-2xl font-bold uppercase focus:outline-none tracking-widest"
          />
        </div>
      </div>
    </div>
  );
}
