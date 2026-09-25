import java.io.*;
public class Main {
    static int[] parent, size;
    static int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        int tests = Integer.parseInt(reader.readLine().trim());
        StringBuilder out = new StringBuilder();
        for (int tc = 0; tc < tests; tc++) {
            String line;
            do { line = reader.readLine(); } while (line != null && line.trim().isEmpty());
            int n = Integer.parseInt(line.trim());
            parent = new int[n + 1]; size = new int[n + 1];
            for (int i = 1; i <= n; i++) { parent[i] = i; size[i] = 1; }
            int yes = 0, no = 0;
            while ((line = reader.readLine()) != null && !line.trim().isEmpty()) {
                String[] parts = line.trim().split("\\s+");
                int a = find(Integer.parseInt(parts[1]));
                int b = find(Integer.parseInt(parts[2]));
                if (parts[0].equals("q")) {
                    if (a == b) yes++; else no++;
                } else if (a != b) {
                    if (size[a] < size[b]) { int tmp = a; a = b; b = tmp; }
                    parent[b] = a; size[a] += size[b];
                }
            }
            if (tc > 0) out.append('\n');
            out.append(yes).append(',').append(no).append('\n');
        }
        System.out.print(out);
    }
}
