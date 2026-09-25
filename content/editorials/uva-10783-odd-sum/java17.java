import java.util.Scanner;

public class Main {
    static int oddPrefix(int bound) {
        int count = (bound + 1) / 2;
        return count * count;
    }

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        for (int caseNumber = 1; caseNumber <= tests; ++caseNumber) {
            int low = input.nextInt();
            int high = input.nextInt();
            System.out.println("Case " + caseNumber + ": " + (oddPrefix(high) - oddPrefix(low - 1)));
        }
    }
}
