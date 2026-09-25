import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        int limit = 7489;
        int[] coins = {1, 5, 10, 25, 50};
        long[] ways = new long[limit + 1];
        ways[0] = 1;
        for (int coin : coins) {
            for (int amount = coin; amount <= limit; ++amount) {
                ways[amount] += ways[amount - coin];
            }
        }
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextInt()) output.append(ways[input.nextInt()]).append('\n');
        System.out.print(output);
    }
}
