import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        int[] squares = new int[316];
        for (int root = 1; root <= 316; ++root) squares[root - 1] = root * root;
        Scanner input = new Scanner(System.in);
        while (input.hasNextInt()) {
            int low = input.nextInt();
            int high = input.nextInt();
            if (low == 0 && high == 0) break;
            int count = 0;
            for (int square : squares)
                if (low <= square && square <= high) ++count;
            System.out.println(count);
        }
    }
}
