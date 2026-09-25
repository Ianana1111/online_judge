import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        long[] safe = new long[31];
        safe[0] = 1; safe[1] = 2; safe[2] = 4;
        for (int length = 3; length <= 30; ++length)
            safe[length] = safe[length - 1] + safe[length - 2] + safe[length - 3];
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextInt()) {
            int n = input.nextInt();
            if (n == 0) break;
            output.append((1L << n) - safe[n]).append('\n');
        }
        System.out.print(output);
    }
}
