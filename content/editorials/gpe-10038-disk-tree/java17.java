import java.io.*;
import java.util.*;
public class Main {
    static class Node { TreeMap<String, Node> children = new TreeMap<>(); }
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
    }
    static void printTree(Node node, int depth, StringBuilder out) {
        for (Map.Entry<String, Node> entry : node.children.entrySet()) {
            for (int i = 0; i < depth; i++) out.append(' ');
            out.append(entry.getKey()).append('\n');
            printTree(entry.getValue(), depth + 1, out);
        }
    }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        String token;
        while ((token = fs.next()) != null) {
            int n = Integer.parseInt(token); Node root = new Node();
            for (int i = 0; i < n; i++) {
                Node node = root;
                for (String name : fs.next().split("\\\\")) {
                    node.children.putIfAbsent(name, new Node());
                    node = node.children.get(name);
                }
            }
            printTree(root, 0, out); out.append('\n');
        }
        System.out.print(out);
    }
}
