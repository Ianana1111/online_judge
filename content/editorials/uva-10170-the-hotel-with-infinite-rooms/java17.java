import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextLong()) {
            long start = input.nextLong(), day = input.nextLong();
            long low = start, high = 100000000;
            while (low < high) {
                long mid = low + (high - low) / 2;
                long through = (mid - start + 1) * (start + mid) / 2;
                if (through >= day) high = mid;
                else low = mid + 1;
            }
            output.append(low).append('\n');
        }
        System.out.print(output);
    }
}
