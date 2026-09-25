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
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        String first;
        while ((first = fs.next()) != null) {
            int rows = Integer.parseInt(first), cols = fs.nextInt();
            if (rows == 0) break;
            char[][] grid = new char[rows][];
            for (int r = 0; r < rows; r++) grid[r] = fs.next().toCharArray();
            int[] qr = new int[rows * cols], qc = new int[rows * cols];
            int answer = 0;
            for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) {
                if (grid[r][c] != '@') continue;
                answer++; int front = 0, back = 0;
                qr[back] = r; qc[back++] = c; grid[r][c] = '*';
                while (front < back) {
                    int y = qr[front], x = qc[front++];
                    for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++) {
                        int ny = y + dy, nx = x + dx;
                        if (ny < 0 || ny >= rows || nx < 0 || nx >= cols || grid[ny][nx] != '@') continue;
                        grid[ny][nx] = '*'; qr[back] = ny; qc[back++] = nx;
                    }
                }
            }
            out.append(answer).append('\n');
        }
        System.out.print(out);
    }
}
