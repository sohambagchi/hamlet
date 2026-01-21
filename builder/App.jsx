import React, { useState } from 'react';
import SpriteUploader from './components/SpriteUploader';
import SpriteEditor from './components/SpriteEditor';
import { sliceImage } from './utils/imageProcessing';

function App() {
    const [phase, setPhase] = useState('upload'); // upload | edit
    const [chunks, setChunks] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [restoredEdits, setRestoredEdits] = useState({});

    const handleStart = async ({ file, rows, cols }) => {
        setIsProcessing(true);
        try {
            const slicedChunks = await sliceImage(file, rows, cols);
            setChunks(slicedChunks);
            setRestoredEdits({});
            setPhase('edit');
        } catch (e) {
            console.error(e);
            alert("Error processing image");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleResume = (checkpointData) => {
        setChunks(checkpointData.chunks);
        setRestoredEdits(checkpointData.edits);
        setPhase('edit');
    };

    return (
        <>
            {phase === 'upload' && (
                <div className="builder-container">
                    <h1>Sprite Refiner</h1>
                    {isProcessing ? <p>Processing...</p> : <SpriteUploader onStart={handleStart} onResume={handleResume} />}
                </div>
            )}

            {phase === 'edit' && (
                <SpriteEditor
                    chunks={chunks}
                    initialEdits={restoredEdits}
                    onBack={() => setPhase('upload')}
                />
            )}
        </>
    );
}

export default App;
