import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        StringBuilder output = new StringBuilder();
        for (int caseNumber = 0; caseNumber < tests; ++caseNumber) {
            int n = input.nextInt();
            long[] coins = new long[n];
            for (int i = 0; i < n; ++i) coins[i] = input.nextLong();
            long sum = 0;
            int types = 0;
            for (int i = 0; i + 1 < n; ++i) {
                if (sum + coins[i] < coins[i + 1]) {
                    sum += coins[i];
                    ++types;
                }
            }
            output.append(types + 1).append('\n');
        }
        System.out.print(output);
    }
}
