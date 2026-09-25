import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);int tests=input.nextInt();
        StringBuilder output=new StringBuilder();
        while(tests-->0) {
            int n=input.nextInt(),last=input.nextInt(),answer=1;
            boolean needDown=true;
            for(int i=1;i<n;++i) {
                int current=input.nextInt();
                if((needDown && last>current)||(!needDown && last<current)) {
                    ++answer;needDown=!needDown;
                }
                last=current;
            }
            output.append(answer).append('\n');
        }
        System.out.print(output);
    }
}
