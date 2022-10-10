import { vec2 } from 'gl-matrix';

function getPolygonInLoop(indices: Array<number>, start: number, end: number): Array<number> {
    const indexCount = indices.length;
    const output: Array<number> = [start];

    for (let i = indices.indexOf(start) + 1;; i = (i + 1) % indexCount) {
        const actualIndex = indices[i];
        output.push(actualIndex);

        if (actualIndex === end) {
            return output;
        }
    }
}

function splitPolygonTo(polyline: Array<vec2>, indices: Array<number>, diagonals: Array<[number, number]>, output: Array<Array<vec2>>) {
    if (diagonals.length > 0) {
        // split along first diagonal
        const [start, end] = diagonals[0];
        const aIndices = getPolygonInLoop(indices, start, end);
        const bIndices = getPolygonInLoop(indices, end, start);

        // assign other diagonals to one of the partitions
        const aDiags = new Array<[number, number]>(), bDiags = new Array<[number, number]>();
        const diagonalCount = diagonals.length;
        for (let i = 1; i < diagonalCount; i++) {
            const [oStart, oEnd] = diagonals[i];

            if (aIndices.indexOf(oStart) >= 0 && aIndices.indexOf(oEnd) >= 0) {
                aDiags.push([oStart, oEnd]);
            } else {
                bDiags.push([oStart, oEnd]);
            }
        }

        // further split
        splitPolygonTo(polyline, aIndices, aDiags, output);
        splitPolygonTo(polyline, bIndices, bDiags, output);
    } else {
        // no more diagonals, make actual polyline
        const indexCount = indices.length;
        const outPolyline = new Array(indexCount);
        for (let i = 0; i < indexCount; i++) {
            outPolyline[i] = polyline[indices[i]];
        }

        output.push(outPolyline);
    }
}

export default function splitPolygon(polyline: Array<vec2>, diagonals: Array<[number, number]>): Array<Array<vec2>> {
    const output = new Array<Array<vec2>>();
    splitPolygonTo(polyline, Array.from({ length: polyline.length }, (_, i) => i), diagonals, output);
    return output;
}