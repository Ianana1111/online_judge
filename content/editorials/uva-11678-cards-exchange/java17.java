import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextInt()) {
            int n = input.nextInt(), m = input.nextInt();
            if (n == 0 && m == 0) break;
            boolean[] alice = new boolean[100001];
            boolean[] betty = new boolean[100001];
            for (int i = 0; i < n; ++i) alice[input.nextInt()] = true;
            for (int i = 0; i < m; ++i) betty[input.nextInt()] = true;
            int onlyAlice = 0, onlyBetty = 0;
            for (int card = 1; card <= 100000; ++card) {
                if (alice[card] && !betty[card]) ++onlyAlice;
                if (betty[card] && !alice[card]) ++onlyBetty;
            }
            output.append(Math.min(onlyAlice, onlyBetty)).append('\n');
        }
        System.out.print(output);
    }
}
