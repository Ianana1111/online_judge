import java.io.BufferedInputStream;
import java.util.Arrays;
class Main {
    static final BufferedInputStream input=new BufferedInputStream(System.in);
    static int nextInt() throws Exception {
        int ch;do {ch=input.read();} while(ch<=32 && ch!=-1);
        int sign=1;if(ch=='-') {sign=-1;ch=input.read();}
        int value=0;
        while(ch>32 && ch!=-1) {value=value*10+ch-'0';ch=input.read();}
        return sign*value;
    }
    public static void main(String[] args) throws Exception {
        int tests=nextInt();StringBuilder output=new StringBuilder();
        while(tests-->0) {
            int n=nextInt();int[] floors=new int[n];
            for(int i=0;i<n;++i) {
                int value=nextInt();
                floors[i]=Math.abs(value)*2+(value>0?1:0);
            }
            Arrays.sort(floors);
            int answer=0,previous=0;
            for(int floor:floors) {
                int color=(floor&1)+1;
                if(color!=previous) {++answer;previous=color;}
            }
            output.append(answer).append('\n');
        }
        System.out.print(output);
    }
}
