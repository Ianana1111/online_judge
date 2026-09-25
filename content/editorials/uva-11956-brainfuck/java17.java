import java.io.BufferedReader;
import java.io.InputStreamReader;
class Main {
    static final char[] HEX="0123456789ABCDEF".toCharArray();
    public static void main(String[] args) throws Exception {
        BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
        int tests=Integer.parseInt(input.readLine().trim());StringBuilder output=new StringBuilder();
        for(int tc=1;tc<=tests;++tc) {
            String program=input.readLine();int[] memory=new int[100];int pointer=0;
            for(int i=0;i<program.length();++i) {
                char command=program.charAt(i);
                if(command=='>') pointer=(pointer+1)%100;
                else if(command=='<') pointer=(pointer+99)%100;
                else if(command=='+') memory[pointer]=(memory[pointer]+1)%256;
                else if(command=='-') memory[pointer]=(memory[pointer]+255)%256;
            }
            output.append("Case ").append(tc).append(':');
            for(int value:memory) output.append(' ').append(HEX[value/16]).append(HEX[value%16]);
            output.append('\n');
        }
        System.out.print(output);
    }
}
