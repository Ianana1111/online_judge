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
        int nextInt() throws IOException {
            int c; do { c = read(); } while (c <= 32 && c >= 0);
            if (c < 0) return -1;
            int x = 0;
            while (c > 32 && c >= 0) { x = x * 10 + c - '0'; c = read(); }
            return x;
        }
    }
    static ArrayList<int[]> solutions = new ArrayList<>();
    static int[] board = new int[8];
    static void generate(int col, int rows, int rising, int falling) {
        if (col == 8) { solutions.add(board.clone()); return; }
        for (int row = 1; row <= 8; row++) {
            int r = 1 << (row - 1);
            int up = 1 << (row - 1 + col);
            int down = 1 << (row - 1 - col + 7);
            if ((rows & r) != 0 || (rising & up) != 0 || (falling & down) != 0) continue;
            board[col] = row;
            generate(col + 1, rows | r, rising | up, falling | down);
        }
    }
    public static void main(String[] args) throws Exception {
        generate(0, 0, 0, 0);
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        int caseNo = 0, first;
        while ((first = fs.nextInt()) >= 0) {
            int[] initial = new int[8]; initial[0] = first;
            for (int i = 1; i < 8; i++) initial[i] = fs.nextInt();
            int best = 8;
            for (int[] target : solutions) {
                int moves = 0;
                for (int i = 0; i < 8; i++) if (initial[i] != target[i]) moves++;
                best = Math.min(best, moves);
            }
            out.append("Case ").append(++caseNo).append(": ").append(best).append('\n');
        }
        System.out.print(out);
    }
}
