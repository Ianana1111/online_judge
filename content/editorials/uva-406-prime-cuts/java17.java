import java.util.ArrayList;
import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        boolean[] prime=new boolean[1001];
        for(int i=2;i<=1000;++i) prime[i]=true;
        for(int p=2;p*p<=1000;++p) if(prime[p])
            for(int value=p*p;value<=1000;value+=p) prime[value]=false;
        Scanner input=new Scanner(System.in);StringBuilder output=new StringBuilder();
        while(input.hasNextInt()) {
            int n=input.nextInt(),c=input.nextInt();
            ArrayList<Integer> choices=new ArrayList<>();choices.add(1);
            for(int value=2;value<=n;++value) if(prime[value]) choices.add(value);
            int length=choices.size(),take=Math.min(length,2*c-length%2),start=(length-take)/2;
            output.append(n).append(' ').append(c).append(':');
            for(int i=start;i<start+take;++i) output.append(' ').append(choices.get(i));
            output.append("\n\n");
        }
        System.out.print(output);
    }
}
