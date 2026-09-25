import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextInt()) {
            int n = input.nextInt();
            if (n == 0) break;
            ArrayList<Integer>[] graph = new ArrayList[n];
            for (int i = 0; i < n; ++i) graph[i] = new ArrayList<>();
            int edges = input.nextInt();
            for (int i = 0; i < edges; ++i) {
                int a = input.nextInt(), b = input.nextInt();
                graph[a].add(b); graph[b].add(a);
            }
            int[] color = new int[n];
            Arrays.fill(color, -1);
            ArrayDeque<Integer> queue = new ArrayDeque<>();
            color[0] = 0; queue.add(0);
            boolean good = true;
            while (!queue.isEmpty()) {
                int u = queue.remove();
                for (int v : graph[u]) {
                    if (color[v] == -1) { color[v] = 1 - color[u]; queue.add(v); }
                    else if (color[v] == color[u]) good = false;
                }
            }
            output.append(good ? "BICOLORABLE.\n" : "NOT BICOLORABLE.\n");
        }
        System.out.print(output);
    }
}
