import java.util.ArrayList;
import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);StringBuilder output=new StringBuilder();
        while(input.hasNextLong()) {
            long n=input.nextLong(),m=input.nextLong();
            if(n<=1 || m<=1) {output.append("Boring!\n");continue;}
            ArrayList<Long> sequence=new ArrayList<>();sequence.add(n);
            long current=n;
            while(current>1 && current%m==0) {current/=m;sequence.add(current);}
            if(current!=1) {output.append("Boring!\n");continue;}
            for(int i=0;i<sequence.size();++i) {
                if(i>0) output.append(' ');
                output.append(sequence.get(i));
            }
            output.append('\n');
        }
        System.out.print(output);
    }
}
