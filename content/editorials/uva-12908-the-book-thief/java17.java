import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextLong()) {
            long sum = input.nextLong();
            if (sum == 0) break;
            long low = 1, high = 20000;
            while (low < high) {
                long mid = (low + high) / 2;
                if (mid * (mid + 1) / 2 > sum) high = mid;
                else low = mid + 1;
            }
            long pages = low;
            long missing = pages * (pages + 1) / 2 - sum;
            output.append(missing).append(' ').append(pages).append('\n');
        }
        System.out.print(output);
    }
}
