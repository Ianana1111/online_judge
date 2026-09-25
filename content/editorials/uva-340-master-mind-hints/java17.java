import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);StringBuilder output=new StringBuilder();int game=0;
        while(input.hasNextInt()) {
            int n=input.nextInt();if(n==0) break;
            int[] secret=new int[n],frequency=new int[10];
            for(int i=0;i<n;++i) {secret[i]=input.nextInt();++frequency[secret[i]];}
            output.append("Game ").append(++game).append(":\n");
            while(true) {
                int[] guess=new int[n];for(int i=0;i<n;++i) guess[i]=input.nextInt();
                if(guess[0]==0) break;
                int[] other=new int[10];int strong=0,total=0;
                for(int i=0;i<n;++i) {++other[guess[i]];if(guess[i]==secret[i]) ++strong;}
                for(int digit=1;digit<=9;++digit) total+=Math.min(frequency[digit],other[digit]);
                output.append("    (").append(strong).append(',').append(total-strong).append(")\n");
            }
        }
        System.out.print(output);
    }
}
