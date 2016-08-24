declare module 'drawille' {
    export class Canvas {
        constructor (width: number, height: number);

        /**
         * Draw point on canvas at the given position.
         * @param {number} - x
         * @param {number} - y
         */
        set (x: number, y: number);
        /**
         * Toggle point on canvas at the given position.
         * @param {number} - x
         * @param {number} - y
         */
        unset (x: number, y: number);
        /**
         * Toggle point on canvas at the given position.
         * @param {number} - x
         * @param {number} - y
         */
        toggle (x: number, y: number);
        /**
         * Clear the whole canvas (delete every point).
         */
        clear ();
        /**
         * Return the current content of `canvas`, as a `delimiter`-delimited string.
         * @param {string} - Defaults to `\n`
         * @return {Return string}
         */
        frame (delimiter?: string): string;
    }

    // export default Canvas;
}
