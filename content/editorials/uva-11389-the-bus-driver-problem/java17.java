import java.util.Arrays;
import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextInt()) {
            int n = input.nextInt(), limit = input.nextInt(), rate = input.nextInt();
            if (n == 0) break;
            int[] morning = new int[n], evening = new int[n];
            for (int i = 0; i < n; ++i) morning[i] = input.nextInt();
            for (int i = 0; i < n; ++i) evening[i] = input.nextInt();
            Arrays.sort(morning);
            Arrays.sort(evening);
            long cost = 0;
            for (int i = 0; i < n; ++i) {
                int extra = morning[i] + evening[n - 1 - i] - limit;
                if (extra > 0) cost += (long)extra * rate;
            }
            output.append(cost).append('\n');
        }
        System.out.print(output);
    }
}
