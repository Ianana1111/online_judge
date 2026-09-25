import java.util.Scanner;

class Main {
    static int gcd(int a, int b) {
        while (b != 0) { int remainder = a % b; a = b; b = remainder; }
        return a;
    }
    public static void main(String[] args) {
        long[] total = new long[501];
        for (int right = 2; right <= 500; ++right) {
            total[right] = total[right - 1];
            for (int left = 1; left < right; ++left) total[right] += gcd(left, right);
        }
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextInt()) {
            int n = input.nextInt();
            if (n == 0) break;
            output.append(total[n]).append('\n');
        }
        System.out.print(output);
    }
}
