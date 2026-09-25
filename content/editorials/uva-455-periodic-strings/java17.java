import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);int tests=input.nextInt();StringBuilder output=new StringBuilder();
        for(int tc=0;tc<tests;++tc) {
            String text=input.next();int n=text.length(),answer=n;
            for(int period=1;period<=n;++period) {
                if(n%period!=0) continue;
                boolean good=true;
                for(int i=period;i<n;++i) if(text.charAt(i)!=text.charAt(i%period)) good=false;
                if(good) {answer=period;break;}
            }
            if(tc>0) output.append('\n');
            output.append(answer).append('\n');
        }
        System.out.print(output);
    }
}
