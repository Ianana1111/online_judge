import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextInt()) {
            int players = input.nextInt(), rounds = input.nextInt();
            if (players == 0 && rounds == 0) break;
            int[] total = new int[players];
            for (int round = 0; round < rounds; ++round)
                for (int player = 0; player < players; ++player)
                    total[player] += input.nextInt();
            int winner = 0;
            for (int player = 1; player < players; ++player)
                if (total[player] >= total[winner]) winner = player;
            output.append(winner + 1).append('\n');
        }
        System.out.print(output);
    }
}
