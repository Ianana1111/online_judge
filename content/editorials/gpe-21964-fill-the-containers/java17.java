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
    static boolean feasible(int[] vessels, int containers, long capacity) {
        int used = 1; long current = 0;
        for (int milk : vessels) {
            if (current + milk > capacity) { used++; current = 0; }
            current += milk;
        }
        return used <= containers;
    }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        int n;
        while ((n = fs.nextInt()) >= 0) {
            int containers = fs.nextInt(); int[] vessels = new int[n];
            long low = 0, high = 0;
            for (int i = 0; i < n; i++) {
                vessels[i] = fs.nextInt();
                low = Math.max(low, vessels[i]); high += vessels[i];
            }
            while (low < high) {
                long middle = low + (high - low) / 2;
                if (feasible(vessels, containers, middle)) high = middle;
                else low = middle + 1;
            }
            out.append(low).append('\n');
        }
        System.out.print(out);
    }
}
