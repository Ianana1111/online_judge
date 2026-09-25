import java.io.*;
import java.util.*;
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
        int[] dy = {1,-1,0,0}, dx = {0,0,1,-1};
        for (int tc = 1; tc <= tests; tc++) {
            int rows = fs.nextInt(), cols = fs.nextInt();
            char[][] grid = new char[rows][];
            for (int r = 0; r < rows; r++) grid[r] = fs.next().toCharArray();
            int[] count = new int[26], qr = new int[rows * cols], qc = new int[rows * cols];
            for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) {
                if (grid[r][c] == '.') continue;
                char language = grid[r][c]; count[language - 'a']++;
                int front = 0, back = 0;
                qr[back] = r; qc[back++] = c; grid[r][c] = '.';
                while (front < back) {
                    int y = qr[front], x = qc[front++];
                    for (int d = 0; d < 4; d++) {
                        int ny = y + dy[d], nx = x + dx[d];
                        if (ny < 0 || ny >= rows || nx < 0 || nx >= cols || grid[ny][nx] != language) continue;
                        grid[ny][nx] = '.'; qr[back] = ny; qc[back++] = nx;
                    }
                }
            }
            ArrayList<Integer> order = new ArrayList<>();
            for (int letter = 0; letter < 26; letter++) if (count[letter] > 0) order.add(letter);
            order.sort((a, b) -> count[a] == count[b] ? a - b : count[b] - count[a]);
            out.append("World #").append(tc).append('\n');
            for (int letter : order) out.append((char)('a' + letter)).append(": ").append(count[letter]).append('\n');
        }
        System.out.print(out);
    }
}
