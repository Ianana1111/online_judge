import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);StringBuilder output=new StringBuilder();
        while(input.hasNextInt()) {
            int n=input.nextInt();long[] tails=new long[n];int size=0;
            for(int i=0;i<n;++i) {
                long value=input.nextLong();int left=0,right=size;
                while(left<right) {
                    int middle=(left+right)/2;
                    if(tails[middle]<value) left=middle+1;
                    else right=middle;
                }
                if(left==size) ++size;
                tails[left]=value;
            }
            output.append(size).append('\n');
        }
        System.out.print(output);
    }
}
