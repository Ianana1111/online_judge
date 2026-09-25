import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        while (input.hasNextInt()) {
            int start = input.nextInt();
            int a = input.nextInt();
            int b = input.nextInt();
            int c = input.nextInt();
            if (start == 0 && a == 0 && b == 0 && c == 0) break;
            int first = (start - a + 40) % 40;
            int second = (b - a + 40) % 40;
            int third = (b - c + 40) % 40;
            System.out.println((120 + first + second + third) * 9);
        }
    }
}
