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
        for (int tc = 1; tc <= tests; tc++) {
            int n = fs.nextInt(); int[][] a = new int[n][n];
            for (int r = 0; r < n; r++) {
                String row = fs.next();
                for (int c = 0; c < n; c++) a[r][c] = row.charAt(c) - '0';
            }
            int commands = fs.nextInt();
            for (int q = 0; q < commands; q++) {
                String op = fs.next();
                if (op.equals("row") || op.equals("col")) {
                    int x = fs.nextInt() - 1, y = fs.nextInt() - 1;
                    if (op.equals("row")) { int[] swap = a[x]; a[x] = a[y]; a[y] = swap; }
                    else for (int r = 0; r < n; r++) {
                        int swap = a[r][x]; a[r][x] = a[r][y]; a[r][y] = swap;
                    }
                } else if (op.equals("transpose")) {
                    for (int r = 0; r < n; r++) for (int c = r + 1; c < n; c++) {
                        int swap = a[r][c]; a[r][c] = a[c][r]; a[c][r] = swap;
                    }
                } else {
                    int delta = op.equals("inc") ? 1 : 9;
                    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++)
                        a[r][c] = (a[r][c] + delta) % 10;
                }
            }
            out.append("Case #").append(tc).append('\n');
            for (int[] row : a) {
                for (int digit : row) out.append(digit);
                out.append('\n');
            }
            out.append('\n');
        }
        System.out.print(out);
    }
}
