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
        PriorityQueue<Long> lower = new PriorityQueue<>(Comparator.reverseOrder());
        PriorityQueue<Long> upper = new PriorityQueue<>();
        long value;
        while ((value = fs.nextLong()) >= 0) {
            if (lower.isEmpty() || value <= lower.peek()) lower.add(value);
            else upper.add(value);
            if (lower.size() > upper.size() + 1) upper.add(lower.remove());
            else if (upper.size() > lower.size()) lower.add(upper.remove());
            long median = lower.size() == upper.size()
                    ? (lower.peek() + upper.peek()) / 2 : lower.peek();
            out.append(median).append('\n');
        }
        System.out.print(out);
    }
}
