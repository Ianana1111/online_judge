import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        int[] duration = new int[128];
        String symbols = "WHQESTX";
        int[] values = {64,32,16,8,4,2,1};
        for (int i = 0; i < symbols.length(); ++i) duration[symbols.charAt(i)] = values[i];
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNext()) {
            String song = input.next();
            if (song.equals("*")) break;
            int sum = 0, answer = 0;
            for (int i = 0; i < song.length(); ++i) {
                char note = song.charAt(i);
                if (note == '/') {
                    if (sum == 64) ++answer;
                    sum = 0;
                } else {
                    sum += duration[note];
                }
            }
            output.append(answer).append('\n');
        }
        System.out.print(output);
    }
}
