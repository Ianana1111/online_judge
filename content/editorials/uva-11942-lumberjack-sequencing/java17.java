import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        StringBuilder output = new StringBuilder("Lumberjacks:\n");
        for (int caseNumber = 0; caseNumber < tests; ++caseNumber) {
            int[] values = new int[10];
            for (int i = 0; i < 10; ++i) values[i] = input.nextInt();
            boolean increasing = true, decreasing = true;
            for (int i = 1; i < 10; ++i) {
                if (values[i] <= values[i - 1]) increasing = false;
                if (values[i] >= values[i - 1]) decreasing = false;
            }
            output.append(increasing || decreasing ? "Ordered\n" : "Unordered\n");
        }
        System.out.print(output);
    }
}
