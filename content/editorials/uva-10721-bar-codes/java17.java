import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextInt()) {
            int n = input.nextInt(), bars = input.nextInt(), maximum = input.nextInt();
            long[][] ways = new long[bars + 1][n + 1];
            ways[0][0] = 1;
            for (int used = 1; used <= bars; ++used)
                for (int total = 1; total <= n; ++total)
                    for (int width = 1; width <= maximum && width <= total; ++width)
                        ways[used][total] += ways[used - 1][total - width];
            output.append(ways[bars][n]).append('\n');
        }
        System.out.print(output);
    }
}
