import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextInt()) {
            int n = input.nextInt();
            if (n == 0) break;
            long ending = 0, best = 0;
            for (int i = 0; i < n; ++i) {
                long value = input.nextLong();
                ending = Math.max(0, ending + value);
                best = Math.max(best, ending);
            }
            if (best > 0) output.append("The maximum winning streak is ").append(best).append(".\n");
            else output.append("Losing streak.\n");
        }
        System.out.print(output);
    }
}
