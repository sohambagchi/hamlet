import React, { useEffect, useRef, useState } from 'react';
import JSZip from 'jszip';
import { Eraser, Paintbrush, ArrowLeft, Download, Layers, Move, PaintBucket, Grid3X3, Undo, ZoomIn, ZoomOut, Pipette, BoxSelect, Save, FileArchive } from 'lucide-react';

export default function SpriteEditor({ chunks, onBack, initialEdits = {} }) {
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [tool, setTool] = useState('brush');
  const [color, setColor] = useState('#ffffff');
  const [palette, setPalette] = useState([]);
  const [showOnion, setShowOnion] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [metadata, setMetadata] = useState({ name: 'Hamlet', pose: 'Idle' });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [onionOffset, setOnionOffset] = useState({ x: 0, y: 0, scale: 1 });
  const [bgColor, setBgColor] = useState('#222222');
  const [viewScale, setViewScale] = useState(1);

  const editsRef = useRef(initialEdits);
  const prevChunkIndex = useRef(0);

  // State tracking refs for saving without re-renders
  const offsetRef = useRef({ x: 0, y: 0 });
  const metadataRef = useRef({ name: 'Hamlet', pose: 'Idle' });
  const currentIndexRef = useRef(currentChunkIndex);

  // Sync refs with state
  useEffect(() => { offsetRef.current = offset; }, [offset]);
  useEffect(() => { metadataRef.current = metadata; }, [metadata]);
  useEffect(() => { currentIndexRef.current = currentChunkIndex; }, [currentChunkIndex]);

  // SAFE LIVE UPDATE: Only trigger when data changes, not when index changes
  useEffect(() => {
    const idx = currentIndexRef.current;
    if (!editsRef.current[idx]) editsRef.current[idx] = {};
    editsRef.current[idx].offset = offset;
  }, [offset]); // Removed currentChunkIndex from deps

  useEffect(() => {
    const idx = currentIndexRef.current;
    if (!editsRef.current[idx]) editsRef.current[idx] = {};
    editsRef.current[idx].metadata = metadata;
  }, [metadata]); // Removed currentChunkIndex from deps

  const [history, setHistory] = useState([]);

  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const layerRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  // Box Selection State
  const [boxSelection, setBoxSelection] = useState(null);

  const chunk = chunks[currentChunkIndex];
  const prevChunk = currentChunkIndex > 0 ? chunks[currentChunkIndex - 1] : null;

  const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255, a: 255 };
  }

  // K-Means Clustering
  const quantizeImage = (ctx) => {
    const width = 64;
    const height = 64;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const pixels = [];
    const uniqueColors = new Set();

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) {
        const pix = { r: data[i], g: data[i + 1], b: data[i + 2] };
        pixels.push(pix);
        uniqueColors.add(`${pix.r},${pix.g},${pix.b}`);
      }
    }

    if (pixels.length === 0) return [];

    const K = 16;

    if (uniqueColors.size <= K) {
      const p = Array.from(uniqueColors).map(s => {
        const [r, g, b] = s.split(',').map(Number);
        return rgbToHex(r, g, b);
      });
      return p;
    }

    const MAX_ITER = 20;
    let centroids = [];
    const uniquePixels = Array.from(uniqueColors).map(s => {
      const [r, g, b] = s.split(',').map(Number);
      return { r, g, b };
    });

    for (let i = uniquePixels.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [uniquePixels[i], uniquePixels[j]] = [uniquePixels[j], uniquePixels[i]];
    }
    centroids = uniquePixels.slice(0, K);

    for (let iter = 0; iter < MAX_ITER; iter++) {
      const sums = new Array(K).fill(0).map(() => ({ r: 0, g: 0, b: 0, count: 0 }));

      for (let i = 0; i < pixels.length; i++) {
        const p = pixels[i];
        let minDist = Infinity;
        let closestIdx = 0;

        for (let cIdx = 0; cIdx < K; cIdx++) {
          const c = centroids[cIdx];
          const d = (p.r - c.r) ** 2 + (p.g - c.g) ** 2 + (p.b - c.b) ** 2;
          if (d < minDist) {
            minDist = d;
            closestIdx = cIdx;
          }
        }
        sums[closestIdx].r += p.r;
        sums[closestIdx].g += p.g;
        sums[closestIdx].b += p.b;
        sums[closestIdx].count++;
      }

      let moved = false;
      for (let cIdx = 0; cIdx < K; cIdx++) {
        const s = sums[cIdx];
        if (s.count > 0) {
          const newCentroid = {
            r: Math.round(s.r / s.count),
            g: Math.round(s.g / s.count),
            b: Math.round(s.b / s.count)
          };

          if (newCentroid.r !== centroids[cIdx].r ||
            newCentroid.g !== centroids[cIdx].g ||
            newCentroid.b !== centroids[cIdx].b) {
            centroids[cIdx] = newCentroid;
            moved = true;
          }
        } else {
          const randomP = pixels[Math.floor(Math.random() * pixels.length)];
          centroids[cIdx] = { ...randomP };
          moved = true;
        }
      }
      if (!moved) break;
    }

    const palette = new Set();
    for (const c of centroids) {
      palette.add(rgbToHex(c.r, c.g, c.b));
    }

    const sortedPalette = Array.from(palette).sort((a, b) => {
      const ca = hexToRgb(a);
      const cb = hexToRgb(b);
      return (cb.r + cb.g + cb.b) - (ca.r + ca.g + ca.b);
    });

    return sortedPalette;
  };

  const loadChunk = async (index) => {
    const layer = document.createElement('canvas');
    layer.width = 64;
    layer.height = 64;
    const ctx = layer.getContext('2d', { willReadFrequently: true });

    const savedState = editsRef.current[index];

    // Restore Data
    if (savedState && savedState.data) {
      ctx.putImageData(savedState.data, 0, 0);
      const p = quantizeImage(ctx);
      setPalette(p);
    } else {
      const blob = chunks[index].blob;
      const bitmap = await createImageBitmap(blob);
      ctx.drawImage(bitmap, 0, 0, 64, 64);
      const p = quantizeImage(ctx);
      setPalette(p);
    }

    layerRef.current = layer;
    if (palette.length > 0 && !palette.includes(color)) setColor(palette[0]);

    // Restore Offset & Metadata
    if (savedState) {
      if (savedState.offset) {
        setOffset(savedState.offset);
      } else {
        setOffset({ x: 0, y: 0 });
      }

      if (savedState.metadata) {
        setMetadata(savedState.metadata);
      }
      // If no unique metadata saved, we keep the currently set metadata (propagation behavior)
    } else {
      setOffset({ x: 0, y: 0 });
      // Propagate metadata: keep current values
    }

    setHistory([]);
    saveToHistory(layer);
    renderCanvas();
  };

  const saveCurrentLayer = () => {
    if (layerRef.current && prevChunkIndex.current !== null) {
      const ctx = layerRef.current.getContext('2d');
      const data = ctx.getImageData(0, 0, 64, 64);

      const existing = editsRef.current[prevChunkIndex.current] || {};

      editsRef.current[prevChunkIndex.current] = {
        ...existing,
        data: data,
        // We trust the live updates for offset/metadata, but we can sync here to be safe
        offset: offsetRef.current,
        metadata: metadataRef.current
      };
    }
  };

  useEffect(() => {
    if (prevChunkIndex.current !== currentChunkIndex) {
      saveCurrentLayer();
      prevChunkIndex.current = currentChunkIndex;
    }
    loadChunk(currentChunkIndex);
  }, [currentChunkIndex]);

  useEffect(() => {
    prevChunkIndex.current = 0;
    loadChunk(0);
  }, []);

  const renderCanvas = () => {
    if (!canvasRef.current || !layerRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, 64, 64);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(layerRef.current, offset.x, offset.y);
  };

  useEffect(() => {
    renderCanvas();
  }, [offset]);

  const saveToHistory = (specificLayer = null) => {
    const layer = specificLayer || layerRef.current;
    if (!layer) return;
    const ctx = layer.getContext('2d');
    const data = ctx.getImageData(0, 0, 64, 64);
    setHistory(prev => [...prev.slice(-19), { data, offset: { ...offset } }]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const newHistory = [...history];
    newHistory.pop();
    const prevState = newHistory[newHistory.length - 1];

    const ctx = layerRef.current.getContext('2d');
    ctx.putImageData(prevState.data, 0, 0);
    setOffset(prevState.offset);
    setHistory(newHistory);
    renderCanvas();
  };

  const resampleLayer = (scaleFactor) => {
    saveToHistory();
    const ctx = layerRef.current.getContext('2d');
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 64;
    tempCanvas.height = 64;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.imageSmoothingEnabled = false;
    tempCtx.drawImage(layerRef.current, 0, 0, 64 * scaleFactor, 64 * scaleFactor);
    ctx.clearRect(0, 0, 64, 64);
    ctx.drawImage(tempCanvas, 0, 0);
    renderCanvas();
  };

  useEffect(() => {
    if (overlayRef.current) {
      const ctx = overlayRef.current.getContext('2d');
      ctx.clearRect(0, 0, 64, 64);
      ctx.imageSmoothingEnabled = false;

      const prevIndex = currentChunkIndex - 1;
      if (showOnion && prevIndex >= 0) {
        const drawOnion = (imageSource) => {
          ctx.globalAlpha = 0.5;
          const w = 64 * onionOffset.scale;
          const h = 64 * onionOffset.scale;
          ctx.drawImage(imageSource, onionOffset.x, onionOffset.y, w, h);
          ctx.globalAlpha = 1.0;
        };

        if (editsRef.current[prevIndex]) {
          const temp = document.createElement('canvas');
          temp.width = 64; temp.height = 64;
          temp.getContext('2d').putImageData(editsRef.current[prevIndex], 0, 0);
          drawOnion(temp);
        } else {
          createImageBitmap(chunks[prevIndex].blob).then(drawOnion);
        }
      }
    }
  }, [showOnion, currentChunkIndex, onionOffset]);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return {
      x: Math.floor((e.clientX - rect.left) * (64 / rect.width)),
      y: Math.floor((e.clientY - rect.top) * (64 / rect.height))
    };
  };

  const handleMouseDown = (e) => {
    const coords = getCanvasCoords(e);
    if (!coords) return;
    const layerX = coords.x - offset.x;
    const layerY = coords.y - offset.y;

    if (tool === 'move') {
      setDragStart(coords);
    } else if (tool === 'box-erase') {
      setIsDrawing(true);
      setBoxSelection({ start: coords, current: coords });
    } else if (tool === 'eyedropper') {
      const ctx = layerRef.current.getContext('2d');
      if (layerX >= 0 && layerX < 64 && layerY >= 0 && layerY < 64) {
        const p = ctx.getImageData(layerX, layerY, 1, 1).data;
        if (p[3] > 0) {
          const hex = rgbToHex(p[0], p[1], p[2]);
          setColor(hex);
          setTool('brush');
        }
      }
    } else {
      saveToHistory();
      setIsDrawing(true);
      if (tool === 'bucket') {
        floodFill(layerX, layerY, color);
        renderCanvas();
      } else {
        drawPixel(layerX, layerY);
        renderCanvas();
      }
    }
  };

  const handleMouseMove = (e) => {
    const coords = getCanvasCoords(e);
    if (!coords) return;

    if (tool === 'move' && dragStart) {
      const dx = coords.x - dragStart.x;
      const dy = coords.y - dragStart.y;
      if (dx !== 0 || dy !== 0) {
        setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setDragStart(coords);
      }
    } else if (tool === 'box-erase' && isDrawing) {
      setBoxSelection(prev => ({ ...prev, current: coords }));
    } else if (isDrawing) {
      const layerX = coords.x - offset.x;
      const layerY = coords.y - offset.y;
      drawPixel(layerX, layerY);
      renderCanvas();
    }
  };

  const handleMouseUp = () => {
    if (tool === 'box-erase' && isDrawing && boxSelection) {
      saveToHistory();
      const startX = Math.min(boxSelection.start.x, boxSelection.current.x);
      const startY = Math.min(boxSelection.start.y, boxSelection.current.y);
      const endX = Math.max(boxSelection.start.x, boxSelection.current.x);
      const endY = Math.max(boxSelection.start.y, boxSelection.current.y);
      const w = endX - startX + 1;
      const h = endY - startY + 1;

      // Convert to Layer Coords
      const layerX = startX - offset.x;
      const layerY = startY - offset.y;

      const ctx = layerRef.current.getContext('2d');
      ctx.clearRect(layerX, layerY, w, h);
      renderCanvas();
      setBoxSelection(null);
    }

    setIsDrawing(false);
    setDragStart(null);
  };

  const drawPixel = (x, y) => {
    const ctx = layerRef.current.getContext('2d');
    if (x < 0 || x >= 64 || y < 0 || y >= 64) return;
    if (tool === 'eraser') {
      ctx.clearRect(x, y, 1, 1);
    } else if (tool === 'brush') {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  };

  const floodFill = (startX, startY, fillColor) => {
    if (startX < 0 || startX >= 64 || startY < 0 || startY >= 64) return;
    const ctx = layerRef.current.getContext('2d');
    const width = 64; const height = 64;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const startPos = (startY * width + startX) * 4;
    const startR = data[startPos], startG = data[startPos + 1], startB = data[startPos + 2], startA = data[startPos + 3];
    const fillRgb = hexToRgb(fillColor);
    if (startR === fillRgb.r && startG === fillRgb.g && startB === fillRgb.b && startA === fillRgb.a) return;
    const matchStartColor = (pos) => data[pos] === startR && data[pos + 1] === startG && data[pos + 2] === startB && data[pos + 3] === startA;
    const colorPixel = (pos) => { data[pos] = fillRgb.r; data[pos + 1] = fillRgb.g; data[pos + 2] = fillRgb.b; data[pos + 3] = fillRgb.a; };
    const stack = [[startX, startY]];
    while (stack.length) {
      const [x, y] = stack.pop();
      const pos = (y * width + x) * 4;
      if (matchStartColor(pos)) {
        colorPixel(pos);
        if (x > 0) stack.push([x - 1, y]);
        if (x < width - 1) stack.push([x + 1, y]);
        if (y > 0) stack.push([x, y - 1]);
        if (y < height - 1) stack.push([x, y + 1]);
      }
    }
    ctx.putImageData(imgData, 0, 0);
  };

  const handleSaveMemory = () => {
    // Explicitly commit current state to memory
    if (!editsRef.current[currentChunkIndex]) editsRef.current[currentChunkIndex] = {};

    editsRef.current[currentChunkIndex].metadata = metadata;
    editsRef.current[currentChunkIndex].offset = offset;

    // Also save pixel data if we have it
    if (layerRef.current) {
      const ctx = layerRef.current.getContext('2d');
      editsRef.current[currentChunkIndex].data = ctx.getImageData(0, 0, 64, 64);
    }

    console.log("Saved sprite state to memory:", currentChunkIndex);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveMemory();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [metadata, offset, currentChunkIndex]);

  const handleExportProject = async () => {
    const zip = new JSZip();
    const sourceFolder = zip.folder("source");
    const editsFolder = zip.folder("edits");

    // Save Meta
    const projectState = {
      chunkCount: chunks.length,
      version: 1,
      edits: {}
    };

    // 1. Save Source Chunks
    chunks.forEach((chunk, i) => {
      sourceFolder.file(`${i}.png`, chunk.blob);
    });

    // 2. Save Edits & State
    // We need to ensure current state is saved to memory first
    handleSaveMemory();

    const editPromises = Object.entries(editsRef.current).map(async ([index, edit]) => {
      projectState.edits[index] = {
        offset: edit.offset,
        metadata: edit.metadata
      };

      if (edit.data) {
        // Convert ImageData to Blob
        const c = document.createElement('canvas');
        c.width = 64; c.height = 64;
        const ctx = c.getContext('2d');
        ctx.putImageData(edit.data, 0, 0);

        return new Promise(resolve => {
          c.toBlob(blob => {
            editsFolder.file(`${index}.png`, blob);
            resolve();
          });
        });
      }
    });

    await Promise.all(editPromises);

    zip.file("project.json", JSON.stringify(projectState));

    // Generate Zip
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `hamlet_project_${Date.now()}.zip`;
    link.click();
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = canvasRef.current.toDataURL('image/png');
    link.download = `${metadata.name}_${metadata.pose}_${currentChunkIndex}.png`;
    link.click();
  };

  return (
    <div className="editor-container">
      {/* Left Sidebar: Navigation */}
      <div className="sidebar-left">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Sprite {currentChunkIndex + 1} / {chunks.length}</h3>

        <div className="chunk-list" style={{ overflowY: 'auto', flex: 1 }}>
          {chunks.map((c, i) => (
            <div key={i} className={`chunk-thumb ${i === currentChunkIndex ? 'active' : ''}`} onClick={() => setCurrentChunkIndex(i)}>
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Main Center Area */}
      <div className="main-area">
        {/* Top Bar: Tools & View Controls */}
        <div className="top-bar">
          {/* View Scale Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: 'auto' }}>
            <label style={{ fontSize: '0.8rem', color: '#888' }}>View:</label>
            <button onClick={() => setViewScale(s => Math.max(0.5, s - 0.25))} className="tool-btn" style={{ maxWidth: '30px', padding: '0' }}>-</button>
            <span style={{ fontSize: '0.8rem', width: '40px', textAlign: 'center' }}>{Math.round(viewScale * 100)}%</span>
            <button onClick={() => setViewScale(s => Math.min(3, s + 0.25))} className="tool-btn" style={{ maxWidth: '30px', padding: '0' }}>+</button>
          </div>

          {/* Global Controls */}
          <button onClick={handleUndo} title="Undo (Ctrl+Z)" className="tool-btn" style={{ maxWidth: '40px' }}><Undo size={20} /></button>
          <div style={{ width: '1px', height: '20px', background: '#333', margin: '0 0.5rem' }}></div>
          <button onClick={() => resampleLayer(1.1)} title="Resample Up 10%" className="tool-btn" style={{ maxWidth: '40px' }}><ZoomIn size={20} /></button>
          <button onClick={() => resampleLayer(0.9)} title="Resample Down 10%" className="tool-btn" style={{ maxWidth: '40px' }}><ZoomOut size={20} /></button>
          <div style={{ width: '1px', height: '20px', background: '#333', margin: '0 0.5rem' }}></div>
          <button className={`tool-btn ${showGrid ? 'active' : ''}`} onClick={() => setShowGrid(!showGrid)} title="Grid" style={{ maxWidth: '40px' }}><Grid3X3 size={20} /></button>
          <button className={`tool-btn ${showOnion ? 'active' : ''}`} onClick={() => setShowOnion(!showOnion)} title="Onion Skin" style={{ maxWidth: '40px' }}><Layers size={20} /></button>
        </div>

        {/* Canvas Stage */}
        <div className="canvas-stage" style={{ overflow: 'auto', padding: '2rem' }}>
          <div className="canvas-wrapper" style={{
            position: 'relative',
            width: `${512 * viewScale}px`,
            height: `${512 * viewScale}px`,
            boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            flexShrink: 0
          }}>
            {/* Configurable Background */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 0, backgroundColor: bgColor,
              backgroundImage: bgColor === '#222222' ? `conic-gradient(#333 90deg, #444 90deg 180deg, #333 180deg 270deg, #444 270deg)` : 'none',
              backgroundSize: bgColor === '#222222' ? '20px 20px' : 'auto'
            }} />

            {/* Grid Overlay */}
            {showGrid && (
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10,
                backgroundImage: `
                            linear-gradient(to right, #444 1px, transparent 1px),
                            linear-gradient(to bottom, #444 1px, transparent 1px)
                        `,
                backgroundSize: `${(512 * viewScale) / 64}px ${(512 * viewScale) / 64}px`
              }}>
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', background: 'rgba(0, 255, 255, 0.6)', transform: 'translateX(-50%)' }} />
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'rgba(0, 255, 255, 0.6)', transform: 'translateY(-50%)' }} />
              </div>
            )}

            {/* Box Selection Overlay */}
            {boxSelection && (
              <div style={{
                position: 'absolute',
                zIndex: 15,
                left: Math.min(boxSelection.start.x, boxSelection.current.x) * (512 * viewScale / 64) + 'px',
                top: Math.min(boxSelection.start.y, boxSelection.current.y) * (512 * viewScale / 64) + 'px',
                width: (Math.abs(boxSelection.current.x - boxSelection.start.x) + 1) * (512 * viewScale / 64) + 'px',
                height: (Math.abs(boxSelection.current.y - boxSelection.start.y) + 1) * (512 * viewScale / 64) + 'px',
                border: '2px dashed #ff4444',
                backgroundColor: 'rgba(255, 68, 68, 0.2)',
                pointerEvents: 'none'
              }} />
            )}

            {/* Onion Skin */}
            <canvas ref={overlayRef} width={64} height={64} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', imageRendering: 'pixelated', pointerEvents: 'none', zIndex: 1 }} />

            {/* Main Canvas */}
            <canvas ref={canvasRef} width={64} height={64} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', imageRendering: 'pixelated', zIndex: 2, cursor: tool === 'move' ? 'move' : (tool === 'bucket' ? 'crosshair' : (tool === 'eyedropper' ? 'copy' : 'crosshair')) }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} />
          </div>
        </div>

        {/* Bottom Bar: Export & Meta */}
        <div className="bottom-bar">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label style={{ fontSize: '0.8rem', color: '#888' }}>BG:</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ width: '30px', height: '30px', border: 'none', background: 'none', cursor: 'pointer' }} />

            <div style={{ width: '1px', height: '24px', background: '#333', margin: '0 0.5rem' }}></div>

            <input placeholder="Name (e.g. Hamlet)" type="text" value={metadata.name} onChange={e => setMetadata({ ...metadata, name: e.target.value })}
              style={{ background: '#333', border: '1px solid #444', padding: '0.5rem', borderRadius: '4px', color: 'white' }}
            />
            <input placeholder="Pose (e.g. Idle)" type="text" value={metadata.pose} onChange={e => setMetadata({ ...metadata, pose: e.target.value })}
              style={{ background: '#333', border: '1px solid #444', padding: '0.5rem', borderRadius: '4px', color: 'white' }}
            />

            <button onClick={handleSaveMemory} title="Save to Memory (Ctrl+S)" className="action-btn" style={{ background: 'transparent', border: '1px solid #444', padding: '0.5rem', width: 'auto' }}>
              <Save size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleExportProject} className="action-btn" style={{ width: 'auto', padding: '0.5rem 1rem', background: '#333', borderColor: '#555' }}>
              <FileArchive size={16} /> Export Project
            </button>
            <button onClick={handleDownload} className="action-btn" style={{ width: 'auto', padding: '0.5rem 1.5rem', background: '#646cff', borderColor: '#646cff' }}>
              <Download size={16} /> Save PNG
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Tools & Palette */}
      <div className="sidebar-right">
        <label style={{ fontWeight: 'bold', color: '#888', fontSize: '0.8rem' }}>TOOLS</label>
        <div className="tool-row" style={{ flexWrap: 'wrap' }}>
          <button className={`tool-btn ${tool === 'move' ? 'active' : ''}`} onClick={() => setTool('move')} title="Move"><Move size={20} /></button>
          <button className={`tool-btn ${tool === 'brush' ? 'active' : ''}`} onClick={() => setTool('brush')} title="Brush"><Paintbrush size={20} /></button>
          <button className={`tool-btn ${tool === 'bucket' ? 'active' : ''}`} onClick={() => setTool('bucket')} title="Fill"><PaintBucket size={20} /></button>
          <button className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`} onClick={() => setTool('eraser')} title="Pixel Eraser"><Eraser size={20} /></button>
          <button className={`tool-btn ${tool === 'box-erase' ? 'active' : ''}`} onClick={() => setTool('box-erase')} title="Box Eraser"><BoxSelect size={20} /></button>
          <button className={`tool-btn ${tool === 'eyedropper' ? 'active' : ''}`} onClick={() => setTool('eyedropper')} title="Pick Color"><Pipette size={20} /></button>
        </div>

        {showOnion && (
          <div className="wrapper-controls" style={{ marginTop: '1rem', borderTop: '1px solid #333', paddingTop: '1rem' }}>
            <label style={{ fontWeight: 'bold', color: '#888', fontSize: '0.8rem' }}>ONION SKIN</label>
            <div className="tool-row" style={{ marginTop: '0.5rem' }}>
              <button onClick={() => setOnionOffset(p => ({ ...p, scale: p.scale + 0.1 }))} className="tool-btn">+</button>
              <button onClick={() => setOnionOffset(p => ({ ...p, scale: p.scale - 0.1 }))} className="tool-btn">-</button>
            </div>
            <div className="tool-row" style={{ marginTop: '0.5rem' }}>
              <button onClick={() => setOnionOffset(p => ({ ...p, x: p.x - 1 }))} className="tool-btn">←</button>
              <button onClick={() => setOnionOffset(p => ({ ...p, x: p.x + 1 }))} className="tool-btn">→</button>
              <button onClick={() => setOnionOffset(p => ({ ...p, y: p.y - 1 }))} className="tool-btn">↑</button>
              <button onClick={() => setOnionOffset(p => ({ ...p, y: p.y + 1 }))} className="tool-btn">↓</button>
            </div>
          </div>
        )}

        <div style={{ flex: 1 }}></div> {/* Spacer */}

        <label style={{ fontWeight: 'bold', color: '#888', fontSize: '0.8rem' }}>PALETTE</label>
        <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="color" value={color} onChange={(e) => { setColor(e.target.value); setTool('brush'); }} style={{ height: '30px', width: '100%', cursor: 'pointer', background: 'none', border: 'none' }} />
          <span style={{ fontSize: '0.8rem', color: '#888' }}>{color}</span>
        </div>
        <div className="palette-grid">
          {palette.map((c) => (
            <div key={c} className={`palette-swatch ${color === c ? 'active' : ''}`} style={{ backgroundColor: c }} onClick={() => { setColor(c); setTool('brush'); }} />
          ))}
        </div>
      </div>
    </div>
  );
}
