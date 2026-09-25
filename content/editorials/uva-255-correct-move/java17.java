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
            int x = 0;
            while (c > 32 && c >= 0) { x = x * 10 + c - '0'; c = read(); }
            return x;
        }
    }
    static boolean canReach(int from, int to, int king) {
        if (from == to || to == king) return false;
        int low = Math.min(from, to), high = Math.max(from, to);
        if (from / 8 == to / 8)
            return !(king / 8 == from / 8 && low < king && king < high);
        if (from % 8 == to % 8)
            return !(king % 8 == from % 8 && low < king && king < high);
        return false;
    }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        int king;
        int[] dr = {-1,1,0,0}, dc = {0,0,-1,1};
        while ((king = fs.nextInt()) >= 0) {
            int queen = fs.nextInt(), destination = fs.nextInt();
            if (king == queen) { out.append("Illegal state\n"); continue; }
            if (!canReach(queen, destination, king)) { out.append("Illegal move\n"); continue; }
            int kr = king / 8, kc = king % 8, qr = destination / 8, qc = destination % 8;
            if (Math.abs(kr - qr) + Math.abs(kc - qc) == 1) {
                out.append("Move not allowed\n"); continue;
            }
            boolean escape = false;
            for (int i = 0; i < 4; i++) {
                int r = kr + dr[i], c = kc + dc[i];
                if (r < 0 || r >= 8 || c < 0 || c >= 8) continue;
                int next = 8 * r + c;
                if (next != destination && !canReach(destination, next, king)) escape = true;
            }
            out.append(escape ? "Continue\n" : "Stop\n");
        }
        System.out.print(out);
    }
}
