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
        long nextLong() throws IOException {
            int c; do { c = read(); } while (c <= 32 && c >= 0);
            if (c < 0) return -1;
            long x = 0;
            while (c > 32 && c >= 0) { x = x * 10 + c - '0'; c = read(); }
            return x;
        }
    }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        long n;
        while ((n = fs.nextLong()) > 0) {
            long low = 1, high = 44722;
            while (low < high) {
                long middle = (low + high) / 2;
                if (middle * middle >= n) high = middle;
                else low = middle + 1;
            }
            long side = low, distance = side * side - n, x, y;
            if (distance < side) { x = side; y = distance + 1; }
            else { x = 2 * side - 1 - distance; y = side; }
            if (side % 2 == 1) { long tmp = x; x = y; y = tmp; }
            out.append(x).append(' ').append(y).append('\n');
        }
        System.out.print(out);
    }
}
