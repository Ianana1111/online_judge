import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextInt()) {
            int stones = input.nextInt(), count = input.nextInt();
            long[] moves = new long[count];
            for (int i = 0; i < count; ++i) moves[i] = input.nextLong();
            boolean[] winning = new boolean[stones + 1];
            for (int remaining = 1; remaining <= stones; ++remaining) {
                for (long take : moves) {
                    if (take <= remaining && !winning[(int)(remaining - take)]) {
                        winning[remaining] = true;
                        break;
                    }
                }
            }
            output.append(winning[stones] ? "Stan wins\n" : "Ollie wins\n");
        }
        System.out.print(output);
    }
}
