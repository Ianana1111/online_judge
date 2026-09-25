import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextLong()) {
            long n = input.nextLong();
            if (n == 0) break;
            long low = 1, high = 65535;
            boolean square = false;
            while (low <= high) {
                long mid = low + (high - low) / 2;
                long value = mid * mid;
                if (value == n) { square = true; break; }
                if (value < n) low = mid + 1;
                else high = mid - 1;
            }
            output.append(square ? "yes\n" : "no\n");
        }
        System.out.print(output);
    }
}
