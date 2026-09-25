import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        long[] ways = new long[11];
        ways[0] = 1;
        for (int pairs = 1; pairs <= 10; ++pairs)
            for (int inside = 0; inside < pairs; ++inside)
                ways[pairs] += ways[inside] * ways[pairs - 1 - inside];
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        boolean first = true;
        while (input.hasNextInt()) {
            int n = input.nextInt();
            if (!first) output.append('\n');
            first = false;
            output.append(ways[n]).append('\n');
        }
        System.out.print(output);
    }
}
