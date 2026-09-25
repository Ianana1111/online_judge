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
        int[] dr = {-1,1,0,0}, dc = {0,0,-1,1};
        for (int tc = 0; tc < tests; tc++) {
            int rows = fs.nextInt(), cols = fs.nextInt(), days = fs.nextInt();
            char[][] grid = new char[rows][cols];
            for (int r = 0; r < rows; r++) grid[r] = fs.next().toCharArray();
            while (days-- > 0) {
                char[][] next = new char[rows][cols];
                for (int r = 0; r < rows; r++) next[r] = grid[r].clone();
                for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) {
                    char enemy = grid[r][c] == 'R' ? 'P' : grid[r][c] == 'P' ? 'S' : 'R';
                    for (int d = 0; d < 4; d++) {
                        int nr = r + dr[d], nc = c + dc[d];
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == enemy)
                            next[r][c] = enemy;
                    }
                }
                grid = next;
            }
            if (tc > 0) out.append('\n');
            for (char[] row : grid) out.append(row).append('\n');
        }
        System.out.print(out);
    }
}
