import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in); int tests=input.nextInt();
        StringBuilder output=new StringBuilder();
        while(tests-->0) {
            int days=input.nextInt(),parties=input.nextInt();
            boolean[] stopped=new boolean[days+1];
            while(parties-->0) {
                int period=input.nextInt();
                for(int day=period;day<=days;day+=period) stopped[day]=true;
            }
            int lost=0;
            for(int day=1;day<=days;++day) if(stopped[day] && day%7!=6 && day%7!=0) ++lost;
            output.append(lost).append('\n');
        }
        System.out.print(output);
    }
}
