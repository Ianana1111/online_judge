import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        StringBuilder output = new StringBuilder();
        for (int i = 0; i < tests; ++i) {
            int owned = input.nextInt();
            int found = input.nextInt();
            int cost = input.nextInt();
            int empty = owned + found;
            int total = 0;
            while (empty >= cost) {
                int drinks = empty / cost;
                total += drinks;
                empty = empty % cost + drinks;
            }
            output.append(total).append('\n');
        }
        System.out.print(output);
    }
}
