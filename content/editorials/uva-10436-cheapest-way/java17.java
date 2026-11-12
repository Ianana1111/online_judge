import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.StringTokenizer;

class Main {
    static BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
    static StringTokenizer tokens = new StringTokenizer("");

    static String next() throws IOException {
        while (!tokens.hasMoreTokens()) tokens = new StringTokenizer(in.readLine());
        return tokens.nextToken();
    }

    public static void main(String[] args) throws IOException {
        final long INF = Long.MAX_VALUE / 4;
        StringBuilder out = new StringBuilder();
        int maps = Integer.parseInt(next());
        for (int m = 1; m <= maps; ++m) {
            int n = Integer.parseInt(next());
            String[] name = new String[n];
            long[] fee = new long[n];
            HashMap<String, Integer> station = new HashMap<>();
            for (int i = 0; i < n; ++i) {
                name[i] = next();
                fee[i] = Long.parseLong(next());
                station.put(name[i], i);
            }
            long[][] road = new long[n][n];
            for (long[] row : road) java.util.Arrays.fill(row, INF);
            int paths = Integer.parseInt(next());
            for (int e = 0; e < paths; ++e) {
                int u = station.get(next()), v = station.get(next());
                long km = Long.parseLong(next());
                if (km < road[u][v]) road[u][v] = road[v][u] = km;
            }
            if (m > 1) out.append('\n');
            out.append("Map #").append(m).append('\n');
            int queries = Integer.parseInt(next());
            for (int q = 1; q <= queries; ++q) {
                int src = station.get(next()), dst = station.get(next());
                long passengers = Long.parseLong(next());
                long[] cost = new long[n];
                int[] prev = new int[n];
                boolean[] done = new boolean[n];
                java.util.Arrays.fill(cost, INF);
                java.util.Arrays.fill(prev, -1);
                cost[src] = fee[src];
                for (int round = 0; round < n; ++round) {
                    int x = -1;
                    for (int i = 0; i < n; ++i)
                        if (!done[i] && cost[i] < INF && (x < 0 || cost[i] < cost[x])) x = i;
                    if (x < 0) break;
                    done[x] = true;
                    for (int y = 0; y < n; ++y)
                        if (road[x][y] < INF && cost[x] + 2 * road[x][y] + fee[y] < cost[y]) {
                            cost[y] = cost[x] + 2 * road[x][y] + fee[y];
                            prev[y] = x;
                        }
                }
                StringBuilder path = new StringBuilder();
                for (int x = dst; x != -1; x = prev[x]) path.insert(0, x == dst ? name[x] : name[x] + " ");
                long cents = (cost[dst] * 220 + passengers) / (2 * passengers);
                out.append("Query #").append(q).append('\n').append(path).append('\n');
                out.append("Each passenger has to pay : ").append(cents / 100).append('.')
                   .append(cents % 100 / 10).append(cents % 10).append(" taka\n");
            }
        }
        System.out.print(out);
    }
}
