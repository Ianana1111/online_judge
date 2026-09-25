import java.util.ArrayList;
import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        ArrayList<Integer> valid=new ArrayList<>();
        for(int time=0;time<1440;++time) {
            String digits=Integer.toString((time/60)*100+time%60);
            if(digits.equals(new StringBuilder(digits).reverse().toString())) valid.add(time);
        }
        Scanner input=new Scanner(System.in);int tests=input.nextInt();StringBuilder output=new StringBuilder();
        while(tests-->0) {
            String[] parts=input.next().split(":");
            int now=Integer.parseInt(parts[0])*60+Integer.parseInt(parts[1]);
            int answer=valid.get(0);
            for(int time:valid) if(time>now) {answer=time;break;}
            output.append(String.format("%02d:%02d\n",answer/60,answer%60));
        }
        System.out.print(output);
    }
}
