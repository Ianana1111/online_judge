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
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        int caseNo = 0, start;
        while ((start = fs.nextInt()) >= 0) {
            int target = fs.nextInt(); if (start == 0 && target == 0) break;
            int[] distance = new int[Math.max(start, target) + 1];
            Arrays.fill(distance, -1);
            int[] queue = new int[distance.length]; int front = 0, back = 0;
            queue[back++] = start; distance[start] = 0;
            while (front < back) {
                int value = queue[front++], remaining = value;
                int[] factors = new int[10]; int count = 0;
                for (int p = 2; p * p <= remaining; p++) if (remaining % p == 0) {
                    factors[count++] = p;
                    while (remaining % p == 0) remaining /= p;
                }
                if (remaining > 1 && remaining < value) factors[count++] = remaining;
                for (int i = 0; i < count; i++) {
                    int next = value + factors[i];
                    if (next > target || distance[next] >= 0) continue;
                    distance[next] = distance[value] + 1;
                    queue[back++] = next;
                }
            }
            out.append("Case ").append(++caseNo).append(": ").append(distance[target]).append('\n');
        }
        System.out.print(out);
    }
}
