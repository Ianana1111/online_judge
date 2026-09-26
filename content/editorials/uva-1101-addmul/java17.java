import java.io.BufferedInputStream;
import java.util.ArrayList;
import java.util.List;

public class Main {
    static BufferedInputStream in=new BufferedInputStream(System.in);
    static long number()throws Exception{int c;do{c=in.read();}while(c>=0&&c<=32);if(c<0)return -1;long x=0;while(c>32){x=x*10+c-'0';c=in.read();}return x;}
    static class Run{char op;long count;Run(char op,long count){this.op=op;this.count=count;}}
    static void append(List<Run> p,char op,long count){if(count==0)return;if(!p.isEmpty()&&p.get(p.size()-1).op==op)p.get(p.size()-1).count+=count;else p.add(new Run(op,count));}
    static boolean less(List<Run> a,List<Run> b){int i=0,j=0;long x=0,y=0;while(i<a.size()&&j<b.size()){Run left=a.get(i),right=b.get(j);if(left.op!=right.op)return left.op<right.op;long take=Math.min(left.count-x,right.count-y);x+=take;y+=take;if(x==left.count){i++;x=0;}if(y==right.count){j++;y=0;}}return i==a.size()&&j<b.size();}
    public static void main(String[] args)throws Exception{int tc=0;while(true){long a=number();if(a<=0)break;long m=number(),p=number(),q=number(),r=number(),s=number(),bestLength=Long.MAX_VALUE;List<Run> best=null;long[] powers=new long[32];powers[0]=1;
        for(int k=0;q*powers[k]<=s;k++){long low=Math.max(0,(r-p*powers[k]+a-1)/a),high=(s-q*powers[k])/a;
            for(int j=0;j<=k&&low<=high;j++){long value=(low+powers[j]-1)/powers[j]*powers[j];if(value>high)continue;long rest=value,length=k;List<Run> program=new ArrayList<>();for(int pos=k;pos>=0;pos--){long count=rest/powers[pos];rest%=powers[pos];length+=count;append(program,'A',count);if(pos>0)append(program,'M',1);}if(length<bestLength||(length==bestLength&&less(program,best))){bestLength=length;best=program;}}
            if(m==1||powers[k]>s/m)break;powers[k+1]=powers[k]*m;
        }
        StringBuilder answer=new StringBuilder("Case ").append(++tc).append(": ");if(best==null)answer.append("impossible");else if(best.isEmpty())answer.append("empty");else for(Run run:best){if(answer.charAt(answer.length()-1)!=' ')answer.append(' ');answer.append(run.count).append(run.op);}System.out.println(answer);
    }}
}
