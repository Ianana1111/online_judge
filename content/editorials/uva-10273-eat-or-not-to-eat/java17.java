import java.io.BufferedInputStream;
import java.util.Arrays;

public class Main {
    static BufferedInputStream in=new BufferedInputStream(System.in);
    static int number()throws Exception{int c;do{c=in.read();}while(c>=0&&c<=32);int x=0;while(c>32){x=x*10+c-'0';c=in.read();}return x;}
    static int gcd(int a,int b){while(b!=0){int t=a%b;a=b;b=t;}return a;}
    public static void main(String[] args)throws Exception{int cases=number();short[] order=new short[2520000];while(cases-->0){int n=number(),period=1;int[] length=new int[n];int[][] milk=new int[n][];for(int i=0;i<n;i++){length[i]=number();period=period/gcd(period,length[i])*length[i];milk[i]=new int[length[i]];for(int j=0;j<length[i];j++)milk[i][j]=number();}int[] first=new int[period],second=new int[period],count=new int[251],offset=new int[251];Arrays.fill(second,1);
        for(int phase=0;phase<period;phase++){Arrays.fill(count,0);for(int i=0;i<n;i++)count[milk[i][phase%length[i]]]++;int sum=0;for(int v=0;v<=250;v++){offset[v]=sum;sum+=count[v];}for(int i=0;i<n;i++)order[phase*n+offset[milk[i][phase%length[i]]]++]=(short)i;}
        boolean[] alive=new boolean[n];Arrays.fill(alive,true);int day=0,last=0,idle=0,remaining=n;while(remaining>0&&idle<period){int phase=day%period,a=first[phase],b=second[phase],base=phase*n;while(a<n&&!alive[order[base+a]])a++;b=Math.max(b,a+1);while(b<n&&!alive[order[base+b]])b++;first[phase]=a;second[phase]=b;int cow=order[base+a];day++;if(b==n||milk[cow][phase%length[cow]]<milk[order[base+b]][phase%length[order[base+b]]]){alive[cow]=false;remaining--;last=day;idle=0;}else idle++;}System.out.println(remaining+" "+last);
    }}
}
