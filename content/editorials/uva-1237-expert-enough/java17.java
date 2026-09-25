import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in); int tests=input.nextInt();
        StringBuilder output=new StringBuilder();
        for(int tc=0;tc<tests;++tc) {
            int makers=input.nextInt(); String[] name=new String[makers]; int[] low=new int[makers],high=new int[makers];
            for(int i=0;i<makers;++i) {name[i]=input.next();low[i]=input.nextInt();high[i]=input.nextInt();}
            if(tc>0) output.append('\n');
            int queries=input.nextInt();
            while(queries-->0) {
                int price=input.nextInt(),matches=0,answer=0;
                for(int i=0;i<makers;++i) if(low[i]<=price && price<=high[i]) {++matches;answer=i;}
                output.append(matches==1?name[answer]:"UNDETERMINED").append('\n');
            }
        }
        System.out.print(output);
    }
}
