export async function sliceImage(file, rows, cols) {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;

    await new Promise((resolve) => { img.onload = resolve; });

    const chunkWidth = img.width / cols;
    const chunkHeight = img.height / rows;

    const chunks = [];

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');

            // Draw slice and resize to 64x64
            ctx.imageSmoothingEnabled = false; // Pixel art resampling
            ctx.drawImage(
                img,
                c * chunkWidth, r * chunkHeight, chunkWidth, chunkHeight, // Source
                0, 0, 64, 64 // Dest
            );

            const blob = await new Promise(resolve => canvas.toBlob(resolve));
            chunks.push({ blob, originalRow: r, originalCol: c });
        }
    }

    return chunks;
}
