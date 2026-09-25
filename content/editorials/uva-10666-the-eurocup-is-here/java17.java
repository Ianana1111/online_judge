import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        StringBuilder output = new StringBuilder();
        for (int caseNumber = 0; caseNumber < tests; ++caseNumber) {
            int rounds = input.nextInt();
            long team = input.nextLong();
            if (team == 0) { output.append("1 1\n"); continue; }
            int best = Long.bitCount(team) + 1;
            long block = team & -team;
            long worst = (1L << rounds) - block + 1;
            output.append(best).append(' ').append(worst).append('\n');
        }
        System.out.print(output);
    }
}
