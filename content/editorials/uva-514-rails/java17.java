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
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        int n;
        while ((n = fs.nextInt()) > 0) {
            int first;
            while ((first = fs.nextInt()) > 0) {
                int[] target = new int[n], station = new int[n];
                target[0] = first;
                for (int i = 1; i < n; i++) target[i] = fs.nextInt();
                int top = 0, arriving = 1; boolean possible = true;
                for (int wanted : target) {
                    while (arriving <= n && (top == 0 || station[top - 1] != wanted))
                        station[top++] = arriving++;
                    if (top == 0 || station[top - 1] != wanted) { possible = false; break; }
                    top--;
                }
                out.append(possible ? "Yes" : "No").append('\n');
            }
            out.append('\n');
        }
        System.out.print(out);
    }
}
