import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        long[] ways = new long[30001];
        ways[0] = 1;
        int[] coins = {1, 5, 10, 25, 50};
        for (int coin : coins)
            for (int amount = coin; amount <= 30000; ++amount)
                ways[amount] += ways[amount - coin];
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextInt()) {
            int amount = input.nextInt();
            if (ways[amount] == 1) {
                output.append("There is only 1 way to produce ").append(amount)
                      .append(" cents change.\n");
            } else {
                output.append("There are ").append(ways[amount])
                      .append(" ways to produce ").append(amount).append(" cents change.\n");
            }
        }
        System.out.print(output);
    }
}
