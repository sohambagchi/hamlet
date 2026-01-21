const DEFAULT_OPTIONS = {
    alphaCutoff: 8,
    backgroundFloodThreshold: 40,
    cleanupThreshold: 55,
    bboxMargin: 1,
    targetCenterX: 32,
    targetCenterY: 32
};

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function cloneImageData(imageData) {
    return new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
    );
}

function rgbKey(r, g, b) {
    return `${r >> 3},${g >> 3},${b >> 3}`;
}

function rgbaToHex({ r, g, b }) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function manhattanRgbDistance(r1, g1, b1, r2, g2, b2) {
    return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
}

function isBgLike(r, g, b, a, bgColor, threshold, alphaCutoff) {
    if (bgColor.a <= alphaCutoff) return a <= alphaCutoff;
    if (a <= alphaCutoff) return false;
    return manhattanRgbDistance(r, g, b, bgColor.r, bgColor.g, bgColor.b) <= threshold;
}

function collectBorderColorCandidates(imageData, alphaCutoff) {
    const { data, width, height } = imageData;
    const counts = new Map();
    const sums = new Map();

    const addPixel = (x, y) => {
        const pos = (y * width + x) * 4;
        const r = data[pos];
        const g = data[pos + 1];
        const b = data[pos + 2];
        const a = data[pos + 3];

        const key = a <= alphaCutoff ? 't' : rgbKey(r, g, b);
        counts.set(key, (counts.get(key) || 0) + 1);
        if (key === 't') return;

        const sum = sums.get(key) || { r: 0, g: 0, b: 0, count: 0 };
        sum.r += r;
        sum.g += g;
        sum.b += b;
        sum.count += 1;
        sums.set(key, sum);
    };

    for (let x = 0; x < width; x++) {
        addPixel(x, 0);
        addPixel(x, height - 1);
    }
    for (let y = 1; y < height - 1; y++) {
        addPixel(0, y);
        addPixel(width - 1, y);
    }

    const sortedKeys = [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([key]) => key);

    return { sortedKeys, sums };
}

function averageColorForKey(key, sums, alphaCutoff) {
    if (key === 't') return { r: 0, g: 0, b: 0, a: 0, hex: '#000000' };
    const sum = sums.get(key);
    if (!sum || sum.count === 0) return { r: 0, g: 0, b: 0, a: 255, hex: '#000000' };
    const color = {
        r: Math.round(sum.r / sum.count),
        g: Math.round(sum.g / sum.count),
        b: Math.round(sum.b / sum.count),
        a: 255
    };
    return { ...color, hex: rgbaToHex(color) };
}

function computeBackgroundMask(imageData, bgColor, threshold, alphaCutoff) {
    const { data, width, height } = imageData;
    const visited = new Uint8Array(width * height);
    const stack = [];

    const tryPush = (x, y) => {
        const idx = y * width + x;
        if (visited[idx]) return;

        const pos = idx * 4;
        const r = data[pos];
        const g = data[pos + 1];
        const b = data[pos + 2];
        const a = data[pos + 3];

        if (!isBgLike(r, g, b, a, bgColor, threshold, alphaCutoff)) return;
        visited[idx] = 1;
        stack.push(idx);
    };

    for (let x = 0; x < width; x++) {
        tryPush(x, 0);
        tryPush(x, height - 1);
    }
    for (let y = 1; y < height - 1; y++) {
        tryPush(0, y);
        tryPush(width - 1, y);
    }

    while (stack.length) {
        const idx = stack.pop();
        const x = idx % width;
        const y = Math.floor(idx / width);

        if (x > 0) tryPush(x - 1, y);
        if (x < width - 1) tryPush(x + 1, y);
        if (y > 0) tryPush(x, y - 1);
        if (y < height - 1) tryPush(x, y + 1);
    }

    return visited;
}

function computeBoundingBox(imageData, backgroundMask, alphaCutoff) {
    const { data, width, height } = imageData;
    let minX = width, minY = height, maxX = -1, maxY = -1;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            if (backgroundMask && backgroundMask[idx]) continue;

            const a = data[idx * 4 + 3];
            if (a <= alphaCutoff) continue;

            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        }
    }

    if (maxX === -1) {
        return { minX: 0, minY: 0, maxX: width - 1, maxY: height - 1, empty: true };
    }

    return { minX, minY, maxX, maxY, empty: false };
}

function dominantColorOutsideBox(imageData, bbox, alphaCutoff) {
    const { data, width, height } = imageData;
    const counts = new Map();
    const sums = new Map();

    const isOutside = (x, y) => {
        return x < bbox.minX || x > bbox.maxX || y < bbox.minY || y > bbox.maxY;
    };

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (!isOutside(x, y)) continue;
            const pos = (y * width + x) * 4;
            const r = data[pos];
            const g = data[pos + 1];
            const b = data[pos + 2];
            const a = data[pos + 3];

            const key = a <= alphaCutoff ? 't' : rgbKey(r, g, b);
            counts.set(key, (counts.get(key) || 0) + 1);
            if (key === 't') continue;

            const sum = sums.get(key) || { r: 0, g: 0, b: 0, count: 0 };
            sum.r += r;
            sum.g += g;
            sum.b += b;
            sum.count += 1;
            sums.set(key, sum);
        }
    }

    if (counts.size === 0) return null;
    const [key] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (key === 't') return { r: 0, g: 0, b: 0, a: 0, hex: '#000000' };

    const sum = sums.get(key);
    const color = {
        r: Math.round(sum.r / sum.count),
        g: Math.round(sum.g / sum.count),
        b: Math.round(sum.b / sum.count),
        a: 255
    };
    return { ...color, hex: rgbaToHex(color) };
}

function eraseMaskToTransparent(imageData, mask) {
    const { data, width, height } = imageData;
    for (let i = 0; i < width * height; i++) {
        if (!mask[i]) continue;
        const pos = i * 4;
        data[pos] = 0;
        data[pos + 1] = 0;
        data[pos + 2] = 0;
        data[pos + 3] = 0;
    }
}

function fuzzyEraseInBox(imageData, bbox, bgColor, threshold, alphaCutoff) {
    if (bgColor.a <= alphaCutoff) return;

    const { data, width } = imageData;
    for (let y = bbox.minY; y <= bbox.maxY; y++) {
        for (let x = bbox.minX; x <= bbox.maxX; x++) {
            const pos = (y * width + x) * 4;
            const a = data[pos + 3];
            if (a <= alphaCutoff) continue;

            const r = data[pos];
            const g = data[pos + 1];
            const b = data[pos + 2];
            if (manhattanRgbDistance(r, g, b, bgColor.r, bgColor.g, bgColor.b) > threshold) continue;

            data[pos] = 0;
            data[pos + 1] = 0;
            data[pos + 2] = 0;
            data[pos + 3] = 0;
        }
    }
}

function computeCenteredOffset(bbox, targetCenterX, targetCenterY) {
    const centerX = (bbox.minX + (bbox.maxX + 1)) / 2;
    const centerY = (bbox.minY + (bbox.maxY + 1)) / 2;
    return {
        x: Math.round(targetCenterX - centerX),
        y: Math.round(targetCenterY - centerY)
    };
}

export function smartRefineImageData(inputImageData, options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const imageData = cloneImageData(inputImageData);

    const { sortedKeys, sums } = collectBorderColorCandidates(imageData, opts.alphaCutoff);
    const candidates = sortedKeys.map((key) => averageColorForKey(key, sums, opts.alphaCutoff));

    let bgGuess = candidates[0] || { r: 0, g: 0, b: 0, a: 0, hex: '#000000' };
    let bestMask = computeBackgroundMask(imageData, bgGuess, opts.backgroundFloodThreshold, opts.alphaCutoff);
    let bestCount = bestMask.reduce((acc, v) => acc + v, 0);

    for (let i = 1; i < candidates.length; i++) {
        const cand = candidates[i];
        const mask = computeBackgroundMask(imageData, cand, opts.backgroundFloodThreshold, opts.alphaCutoff);
        const count = mask.reduce((acc, v) => acc + v, 0);
        if (count > bestCount) {
            bestCount = count;
            bestMask = mask;
            bgGuess = cand;
        }
    }

    let bbox = computeBoundingBox(imageData, bestMask, opts.alphaCutoff);
    if (!bbox.empty) {
        bbox.minX = clamp(bbox.minX - opts.bboxMargin, 0, imageData.width - 1);
        bbox.minY = clamp(bbox.minY - opts.bboxMargin, 0, imageData.height - 1);
        bbox.maxX = clamp(bbox.maxX + opts.bboxMargin, 0, imageData.width - 1);
        bbox.maxY = clamp(bbox.maxY + opts.bboxMargin, 0, imageData.height - 1);
    }

    const outsideDominant = dominantColorOutsideBox(imageData, bbox, opts.alphaCutoff);
    const bgColor = outsideDominant || bgGuess;

    const bgMask = computeBackgroundMask(imageData, bgColor, opts.backgroundFloodThreshold, opts.alphaCutoff);
    eraseMaskToTransparent(imageData, bgMask);
    fuzzyEraseInBox(imageData, bbox, bgColor, opts.cleanupThreshold, opts.alphaCutoff);

    const finalBox = computeBoundingBox(imageData, null, opts.alphaCutoff);
    const offset = computeCenteredOffset(finalBox, opts.targetCenterX, opts.targetCenterY);

    return {
        imageData,
        bbox: finalBox,
        background: bgColor,
        offset
    };
}

