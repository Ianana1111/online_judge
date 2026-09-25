import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        int[] days = {31,28,31,30,31,30,31,31,30,31,30,31};
        String[] names = {"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"};
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        StringBuilder output = new StringBuilder();
        for (int i = 0; i < tests; ++i) {
            int month = input.nextInt();
            int day = input.nextInt();
            int offset = day - 1;
            for (int m = 1; m < month; ++m) offset += days[m - 1];
            output.append(names[(5 + offset) % 7]).append('\n');
        }
        System.out.print(output);
    }
}
