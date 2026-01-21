import React, { useState } from 'react';
import JSZip from 'jszip';
import { Upload, FileArchive } from 'lucide-react';

export default function SpriteUploader({ onStart, onResume }) {
    const [file, setFile] = useState(null);
    const [rows, setRows] = useState(4);
    const [cols, setCols] = useState(6);
    const [preview, setPreview] = useState(null);
    const [isResuming, setIsResuming] = useState(false);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            const url = URL.createObjectURL(selected);
            setPreview(url);
        }
    };

    const handleZipChange = async (e) => {
        const selected = e.target.files[0];
        if (!selected) return;

        setIsResuming(true);
        try {
            const zip = new JSZip();
            const loaded = await zip.loadAsync(selected);

            // 1. Read project.json
            const projectFile = loaded.file("project.json");
            if (!projectFile) throw new Error("Not a valid project zip");
            const projectState = JSON.parse(await projectFile.async("string"));

            // 2. Read Source Chunks
            const chunks = [];
            for (let i = 0; i < projectState.chunkCount; i++) {
                const blob = await loaded.file(`source/${i}.png`).async("blob");
                chunks.push({ blob, url: URL.createObjectURL(blob) });
            }

            // 3. Read Edits
            const restoredEdits = {};
            for (const [index, edit] of Object.entries(projectState.edits)) {
                restoredEdits[index] = { ...edit };
                const editFile = loaded.file(`edits/${index}.png`);
                if (editFile) {
                    const blob = await editFile.async("blob");
                    const bitmap = await createImageBitmap(blob);

                    // Convert to ImageData
                    const c = document.createElement('canvas');
                    c.width = 64; c.height = 64;
                    const ctx = c.getContext('2d');
                    ctx.drawImage(bitmap, 0, 0);
                    restoredEdits[index].data = ctx.getImageData(0, 0, 64, 64);
                }
            }

            onResume({ chunks, edits: restoredEdits });
        } catch (err) {
            console.error(err);
            alert("Error resuming project: " + err.message);
        } finally {
            setIsResuming(false);
        }
    };

    const handleStart = () => {
        if (file && rows > 0 && cols > 0) {
            onStart({ file, rows, cols, previewUrl: preview });
        }
    };

    return (
        <div className="uploader-container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="upload-box" style={{ height: '100%' }}>
                    <label className="upload-label" style={{ height: '300px' }}>
                        <Upload size={48} />
                        <span>Upload New Sprite Sheet</span>
                        <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                    </label>
                </div>

                <div className="upload-box" style={{ height: '100%', borderColor: '#646cff' }}>
                    <label className="upload-label" style={{ height: '300px' }}>
                        <FileArchive size={48} color="#646cff" />
                        <span>{isResuming ? 'Processing...' : 'Resume from Checkpoint (.zip)'}</span>
                        <input type="file" accept=".zip" onChange={handleZipChange} hidden disabled={isResuming} />
                    </label>
                </div>
            </div>

            {preview && (
                <div className="preview-section" style={{ marginTop: '2rem' }}>
                    <img src={preview} alt="Preview" className="preview-img" />
                    <div className="grid-inputs">
                        <label>
                            Rows:
                            <input
                                type="number"
                                value={rows}
                                onChange={(e) => setRows(parseInt(e.target.value))}
                                min="1"
                            />
                        </label>
                        <label>
                            Cols:
                            <input
                                type="number"
                                value={cols}
                                onChange={(e) => setCols(parseInt(e.target.value))}
                                min="1"
                            />
                        </label>
                    </div>
                    <button className="start-btn" onClick={handleStart}>
                        Start Processing
                    </button>
                </div>
            )}
        </div>
    );
}
