import java.util.Scanner;
class Main {
    static int digit(char ch) {
        if(ch>='0' && ch<='9') return ch-'0';
        if(ch>='A' && ch<='Z') return ch-'A'+10;
        return ch-'a'+36;
    }
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);StringBuilder output=new StringBuilder();
        while(input.hasNext()) {
            String text=input.next();long sum=0;int maximum=0;
            for(int i=0;i<text.length();++i) {
                char ch=text.charAt(i);if(ch=='+' || ch=='-') continue;
                int value=digit(ch);sum+=value;maximum=Math.max(maximum,value);
            }
            int answer=-1;
            for(int base=Math.max(2,maximum+1);base<=62;++base)
                if(sum%(base-1)==0) {answer=base;break;}
            output.append(answer<0?"such number is impossible!":Integer.toString(answer)).append('\n');
        }
        System.out.print(output);
    }
}
