import java.util.Scanner;
class Main {
    static int[] numbers,chosen=new int[6];
    static StringBuilder output;
    static void choose(int start,int count) {
        if(count==6) {
            for(int i=0;i<6;++i) {if(i>0) output.append(' ');output.append(chosen[i]);}
            output.append('\n');return;
        }
        int needed=6-count;
        for(int i=start;i<=numbers.length-needed;++i) {
            chosen[count]=numbers[i];choose(i+1,count+1);
        }
    }
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);output=new StringBuilder();boolean first=true;
        while(input.hasNextInt()) {
            int size=input.nextInt();if(size==0) break;
            numbers=new int[size];for(int i=0;i<size;++i) numbers[i]=input.nextInt();
            if(!first) output.append('\n');first=false;
            choose(0,0);
        }
        System.out.print(output);
    }
}
