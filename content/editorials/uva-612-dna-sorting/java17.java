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
    static class Entry {
        String dna; int score, index;
        Entry(String dna, int score, int index) {
            this.dna = dna; this.score = score; this.index = index;
        }
    }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); int tests = fs.nextInt();
        StringBuilder out = new StringBuilder();
        for (int tc = 0; tc < tests; tc++) {
            int length = fs.nextInt(), count = fs.nextInt();
            Entry[] entries = new Entry[count];
            for (int k = 0; k < count; k++) {
                String dna = fs.next(); int score = 0;
                for (int i = 0; i < length; i++) for (int j = i + 1; j < length; j++)
                    if (dna.charAt(i) > dna.charAt(j)) score++;
                entries[k] = new Entry(dna, score, k);
            }
            Arrays.sort(entries, (a, b) -> a.score == b.score ? a.index - b.index : a.score - b.score);
            if (tc > 0) out.append('\n');
            for (Entry entry : entries) out.append(entry.dna).append('\n');
        }
        System.out.print(out);
    }
}
