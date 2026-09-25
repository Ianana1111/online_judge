import java.util.Scanner;

public class Main {
    static long position(long x, long y) {
        long diagonal = x + y;
        return diagonal * (diagonal + 1) / 2 + x;
    }

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        for (int caseNumber = 1; caseNumber <= tests; ++caseNumber) {
            long x = input.nextLong();
            long y = input.nextLong();
            long a = input.nextLong();
            long b = input.nextLong();
            System.out.println("Case " + caseNumber + ": " + (position(a, b) - position(x, y)));
        }
    }
}
