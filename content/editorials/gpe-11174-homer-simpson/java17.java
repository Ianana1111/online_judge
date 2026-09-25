import java.util.Arrays;
import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);StringBuilder output=new StringBuilder();
        while(input.hasNextInt()) {
            int m=input.nextInt(),n=input.nextInt(),t=input.nextInt();
            int[] best=new int[t+1];Arrays.fill(best,-1);best[0]=0;
            for(int time=1;time<=t;++time) {
                if(time>=m && best[time-m]>=0) best[time]=Math.max(best[time],best[time-m]+1);
                if(time>=n && best[time-n]>=0) best[time]=Math.max(best[time],best[time-n]+1);
            }
            int used=t;while(best[used]<0) --used;
            output.append(best[used]);if(used<t) output.append(' ').append(t-used);
            output.append('\n');
        }
        System.out.print(output);
    }
}
