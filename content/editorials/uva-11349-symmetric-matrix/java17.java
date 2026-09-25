import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);int tests=input.nextInt();
        StringBuilder output=new StringBuilder();
        for(int tc=1;tc<=tests;++tc) {
            input.next();input.next();int n=input.nextInt();
            long[] values=new long[n*n];boolean good=true;
            for(int i=0;i<values.length;++i) {values[i]=input.nextLong();if(values[i]<0) good=false;}
            for(int i=0;i<values.length;++i) if(values[i]!=values[values.length-1-i]) good=false;
            output.append("Test #").append(tc).append(": ")
                  .append(good?"Symmetric.\n":"Non-symmetric.\n");
        }
        System.out.print(output);
    }
}
