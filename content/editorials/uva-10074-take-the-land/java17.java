import java.io.*;
public class Main {
    static class FastScanner {
        private final InputStream in = System.in;
        private final byte[] buf = new byte[1 << 16];
        private int ptr, len;
        int read() throws IOException {
            if (ptr >= len) { len = in.read(buf); ptr = 0; if (len < 0) return -1; }
            return buf[ptr++];
        }
        int nextInt() throws IOException {
            int c; do { c = read(); } while (c <= 32 && c >= 0);
            if (c < 0) return -1;
            int sign = 1; if (c == '-') { sign = -1; c = read(); }
            int x = 0;
            while (c > 32 && c >= 0) { x = x * 10 + c - '0'; c = read(); }
            return x * sign;
        }
    }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        int rows;
        while ((rows = fs.nextInt()) >= 0) {
            int cols = fs.nextInt(); if (rows == 0 && cols == 0) break;
            int[][] grid = new int[rows][cols];
            for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) grid[r][c] = fs.nextInt();
            int best = 0;
            for (int top = 0; top < rows; top++) {
                boolean[] clear = new boolean[cols];
                java.util.Arrays.fill(clear, true);
                for (int bottom = top; bottom < rows; bottom++) {
                    int width = 0;
                    for (int c = 0; c < cols; c++) {
                        clear[c] &= grid[bottom][c] == 0;
                        width = clear[c] ? width + 1 : 0;
                        best = Math.max(best, width * (bottom - top + 1));
                    }
                }
            }
            out.append(best).append('\n');
        }
        System.out.print(out);
    }
}
