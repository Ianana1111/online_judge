import java.util.HashSet;
import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);StringBuilder output=new StringBuilder();int tc=0;
        while(input.hasNextInt()) {
            int n=input.nextInt();long[] a=new long[n];boolean good=true;
            for(int i=0;i<n;++i) {
                a[i]=input.nextLong();
                if(a[i]<1 || (i>0 && a[i]<=a[i-1])) good=false;
            }
            HashSet<Long> sums=new HashSet<>();
            for(int i=0;i<n;++i) for(int j=i;j<n;++j)
                if(!sums.add(a[i]+a[j])) good=false;
            output.append("Case #").append(++tc).append(": It is ")
                  .append(good?"":"not ").append("a B2-Sequence.\n\n");
        }
        System.out.print(output);
    }
}
