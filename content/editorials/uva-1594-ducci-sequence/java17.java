import java.util.Arrays;
import java.util.HashSet;
import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in); int tests=input.nextInt();
        StringBuilder output=new StringBuilder();
        while(tests-->0) {
            int n=input.nextInt(); int[] state=new int[n];
            for(int i=0;i<n;++i) state[i]=input.nextInt();
            HashSet<String> seen=new HashSet<>();
            while(true) {
                boolean zero=true;
                for(int value:state) if(value!=0) zero=false;
                if(zero) {output.append("ZERO\n");break;}
                if(!seen.add(Arrays.toString(state))) {output.append("LOOP\n");break;}
                int[] next=new int[n];
                for(int i=0;i<n;++i) next[i]=Math.abs(state[i]-state[(i+1)%n]);
                state=next;
            }
        }
        System.out.print(output);
    }
}
