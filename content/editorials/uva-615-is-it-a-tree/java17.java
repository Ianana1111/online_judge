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
            int sign = 1; if (c == '-') { sign = -1; c = read(); }
            int x = 0;
            while (c > 32 && c >= 0) { x = x * 10 + c - '0'; c = read(); }
            return x * sign;
        }
    }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        boolean[][] edge = new boolean[101][101];
        boolean[] exists = new boolean[101]; int[] indegree = new int[101];
        int caseNo = 0, u;
        while ((u = fs.nextInt()) >= 0) {
            int v = fs.nextInt();
            if (u == 0 && v == 0) {
                int vertices = 0, roots = 0, root = 0; boolean good = true;
                for (int x = 1; x <= 100; x++) if (exists[x]) {
                    vertices++;
                    if (indegree[x] == 0) { roots++; root = x; }
                    else if (indegree[x] != 1) good = false;
                }
                if (vertices > 0 && roots != 1) good = false;
                if (good && vertices > 0) {
                    boolean[] seen = new boolean[101]; int[] queue = new int[101];
                    int front = 0, back = 0;
                    queue[back++] = root; seen[root] = true;
                    while (front < back) {
                        int x = queue[front++];
                        for (int y = 1; y <= 100; y++) if (edge[x][y] && !seen[y]) {
                            seen[y] = true; queue[back++] = y;
                        }
                    }
                    if (back != vertices) good = false;
                }
                out.append("Case ").append(++caseNo).append(" is ");
                out.append(good ? "a tree." : "not a tree.");
                if (good && vertices > 0) out.append(" Root is ").append(root).append('.');
                out.append('\n');
                edge = new boolean[101][101]; exists = new boolean[101]; indegree = new int[101];
            } else {
                edge[u][v] = true; exists[u] = exists[v] = true; indegree[v]++;
            }
        }
        System.out.print(out);
    }
}
