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
    static String signature(String word) {
        char[] letters = word.toCharArray(); Arrays.sort(letters); return new String(letters);
    }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); int tests = fs.nextInt();
        StringBuilder out = new StringBuilder();
        for (int tc = 0; tc < tests; tc++) {
            int n = fs.nextInt(); String[] words = new String[n], keys = new String[n];
            for (int i = 0; i < n; i++) { words[i] = fs.next(); keys[i] = signature(words[i]); }
            if (tc > 0) out.append('\n');
            String query;
            while (!(query = fs.next()).equals("END")) {
                String key = signature(query); int found = 0;
                out.append("Anagrams for: ").append(query).append('\n');
                for (int i = 0; i < n; i++) if (keys[i].equals(key)) {
                    found++; String label = Integer.toString(found);
                    for (int j = label.length(); j < 3; j++) out.append(' ');
                    out.append(label).append(") ").append(words[i]).append('\n');
                }
                if (found == 0) out.append("No anagrams for: ").append(query).append('\n');
            }
        }
        System.out.print(out);
    }
}
