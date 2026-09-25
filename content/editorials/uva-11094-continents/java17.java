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
    static int rows, cols;
    static char[][] grid;
    static boolean[][] seen;
    static char land;
    static int flood(int sy, int sx) {
        int[] qy = new int[rows * cols], qx = new int[rows * cols];
        int front = 0, back = 0;
        qy[back] = sy; qx[back++] = sx; seen[sy][sx] = true;
        int[] dy = {1,-1,0,0}, dx = {0,0,1,-1};
        while (front < back) {
            int y = qy[front], x = qx[front++];
            for (int d = 0; d < 4; d++) {
                int ny = y + dy[d], nx = (x + dx[d] + cols) % cols;
                if (ny < 0 || ny >= rows || seen[ny][nx] || grid[ny][nx] != land) continue;
                seen[ny][nx] = true; qy[back] = ny; qx[back++] = nx;
            }
        }
        return back;
    }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        String token;
        while ((token = fs.next()) != null) {
            rows = Integer.parseInt(token); cols = fs.nextInt();
            grid = new char[rows][];
            for (int y = 0; y < rows; y++) grid[y] = fs.next().toCharArray();
            int sy = fs.nextInt(), sx = fs.nextInt(); land = grid[sy][sx];
            seen = new boolean[rows][cols]; flood(sy, sx); int best = 0;
            for (int y = 0; y < rows; y++) for (int x = 0; x < cols; x++) {
                if (!seen[y][x] && grid[y][x] == land) best = Math.max(best, flood(y, x));
            }
            out.append(best).append('\n');
        }
        System.out.print(out);
    }
}
