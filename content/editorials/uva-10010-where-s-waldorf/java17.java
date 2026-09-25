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
        String next() throws IOException {
            int c; do { c = read(); } while (c <= 32 && c >= 0);
            if (c < 0) return null;
            StringBuilder s = new StringBuilder();
            while (c > 32 && c >= 0) { s.append((char)c); c = read(); }
            return s.toString();
        }
        int nextInt() throws IOException { return Integer.parseInt(next()); }
    }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); int tests = fs.nextInt();
        StringBuilder out = new StringBuilder();
        for (int tc = 0; tc < tests; tc++) {
            int rows = fs.nextInt(), cols = fs.nextInt();
            char[][] grid = new char[rows][];
            for (int r = 0; r < rows; r++) grid[r] = fs.next().toLowerCase().toCharArray();
            if (tc > 0) out.append('\n');
            int queries = fs.nextInt();
            for (int q = 0; q < queries; q++) {
                String word = fs.next().toLowerCase(); boolean found = false;
                for (int r = 0; r < rows && !found; r++) for (int c = 0; c < cols && !found; c++) {
                    for (int dr = -1; dr <= 1 && !found; dr++) for (int dc = -1; dc <= 1 && !found; dc++) {
                        if (dr == 0 && dc == 0) continue;
                        boolean okay = true;
                        for (int k = 0; k < word.length(); k++) {
                            int nr = r + k * dr, nc = c + k * dc;
                            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols
                                    || grid[nr][nc] != word.charAt(k)) { okay = false; break; }
                        }
                        if (okay) { out.append(r + 1).append(' ').append(c + 1).append('\n'); found = true; }
                    }
                }
            }
        }
        System.out.print(out);
    }
}
