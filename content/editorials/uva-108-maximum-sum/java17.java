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
        int n;
        while ((n = fs.nextInt()) > 0) {
            int[][] grid = new int[n][n];
            for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) grid[r][c] = fs.nextInt();
            int best = Integer.MIN_VALUE;
            for (int top = 0; top < n; top++) {
                int[] columns = new int[n];
                for (int bottom = top; bottom < n; bottom++) {
                    for (int c = 0; c < n; c++) columns[c] += grid[bottom][c];
                    int ending = columns[0]; best = Math.max(best, ending);
                    for (int c = 1; c < n; c++) {
                        ending = Math.max(columns[c], ending + columns[c]);
                        best = Math.max(best, ending);
                    }
                }
            }
            out.append(best).append('\n');
        }
        System.out.print(out);
    }
}
