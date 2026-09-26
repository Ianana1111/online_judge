import java.io.BufferedInputStream;
public class Main {
    static final int MOD=1000000007;
    static BufferedInputStream input=new BufferedInputStream(System.in);
    static int next()throws Exception{int c;do{c=input.read();}while(c>=0&&c<=32);int value=0;while(c>32){value=value*10+c-'0';c=input.read();}return value;}
    public static void main(String[]args)throws Exception{
        int[][]answer=new int[11][101];
        for(int base=2;base<=10;base++){
            int[][]dp=new int[4][base];for(int digit=1;digit<base;digit++)dp[digit==base-1?2:0][digit]=1;
            for(int length=1;length<=100;length++){
                int current=0;for(int digit=0;digit<base;digit++)current=(current+dp[3][digit])%MOD;
                answer[base][length]=(answer[base][length-1]+current)%MOD;
                int[][]following=new int[4][base];
                for(int mask=0;mask<4;mask++)for(int last=0;last<base;last++)for(int step=-1;step<=1;step+=2){
                    int digit=last+step;if(digit<0||digit>=base)continue;
                    int seen=mask|(digit==0?1:0)|(digit==base-1?2:0);
                    following[seen][digit]=(following[seen][digit]+dp[mask][last])%MOD;
                }
                dp=following;
            }
        }
        int tests=next();StringBuilder out=new StringBuilder();
        while(tests-->0){int base=next(),length=next();out.append(answer[base][length]).append('\n');}
        System.out.print(out);
    }
}
