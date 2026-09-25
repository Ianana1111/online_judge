import java.io.BufferedReader;
import java.io.InputStreamReader;
class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
        int tests=Integer.parseInt(input.readLine().trim());
        StringBuilder output=new StringBuilder();
        for(int tc=0;tc<tests;++tc) {
            String line=input.readLine();
            char[] stack=new char[line.length()]; int top=0; boolean good=true;
            for(int i=0;i<line.length();++i) {
                char ch=line.charAt(i);
                if(ch=='(' || ch=='[') stack[top++]=ch;
                else if(top==0 || stack[top-1]!=(ch==')'?'(':'[')) {good=false; break;}
                else --top;
            }
            output.append(good && top==0 ? "Yes\n" : "No\n");
        }
        System.out.print(output);
    }
}
