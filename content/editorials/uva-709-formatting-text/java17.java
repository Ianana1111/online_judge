import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;

public class Main {
    // Canonical persistent runs: equal gap sequences share the same node id.
    static int[] gap=new int[20001],count=new int[20001],next=new int[20001];
    static long[] keys=new long[65536];static int[] values=new int[65536];static int used;
    static int append(int value,int repetitions,int tail){
        if(repetitions==0)return tail;
        if(tail!=0&&gap[tail]==value){repetitions+=count[tail];tail=next[tail];}
        long key=((long)value<<48)|((long)repetitions<<24)|tail;
        long hash=key^(key>>>33);hash*=0xff51afd7ed558ccdL;hash^=hash>>>33;
        int slot=(int)hash&65535;while(keys[slot]!=0&&keys[slot]!=key)slot=(slot+1)&65535;
        if(keys[slot]==key)return values[slot];
        int id=++used;gap[id]=value;count[id]=repetitions;next[id]=tail;keys[slot]=key;values[slot]=id;return id;
    }
    static class Cursor {
        int gaps,q,r,phase,tail,value,remaining;
        void reset(int gaps,int q,int r,int tail){this.gaps=gaps;this.q=q;this.r=r;this.tail=tail;phase=0;advance();}
        void advance(){
            do {
                if(phase==0){value=q;remaining=gaps-r;phase=1;}
                else if(phase==1){value=q+1;remaining=r;phase=2;}
                else if(tail==0){remaining=0;return;}
                else{value=gap[tail];remaining=count[tail];tail=next[tail];}
            }while(remaining==0);
        }
        void consume(int amount){remaining-=amount;if(remaining==0)advance();}
    }
    static Cursor left=new Cursor(),right=new Cursor();
    static boolean less(int g,int q,int r,int tail,int bg,int bq,int br,int bestTail){
        left.reset(g,q,r,tail);right.reset(bg,bq,br,bestTail);
        while(left.remaining!=0&&right.remaining!=0){
            if(left.value!=right.value)return left.value<right.value;
            if(left.phase==2&&right.phase==2&&left.remaining==right.remaining&&left.tail==right.tail)return false;
            int take=Math.min(left.remaining,right.remaining);left.consume(take);right.consume(take);
        }
        // The end marker sorts after every real gap: prefer the longer common prefix.
        return left.remaining!=0;
    }
    static int local(int width,int letters,int gaps){
        if(gaps==0)return letters==width?0:500;
        int q=(width-letters)/gaps,r=(width-letters)%gaps;
        return(gaps-r)*(q-1)*(q-1)+r*q*q;
    }
    static String format(int width,ArrayList<String> words){
        Arrays.fill(keys,0);used=0;int n=words.size();
        int[] cost=new int[n+1],following=new int[n],sequence=new int[n+1],lengths=new int[n];
        for(int i=0;i<n;i++)lengths[i]=words.get(i).length();
        for(int i=n-1;i>=0;i--){int letters=0,best=Integer.MAX_VALUE;
            for(int j=i;j<n;j++){letters+=lengths[j];int gaps=j-i;if(letters+gaps>width)break;best=Math.min(best,local(width,letters,gaps)+cost[j+1]);}cost[i]=best;
        }
        for(int i=n-1;i>=0;i--){int letters=0,bestEnd=-1,bg=0,bq=0,br=0,bt=0;
            for(int j=i;j<n;j++){letters+=lengths[j];int gaps=j-i;if(letters+gaps>width)break;if(local(width,letters,gaps)+cost[j+1]!=cost[i])continue;
                int q=gaps>0?(width-letters)/gaps:0,r=gaps>0?(width-letters)%gaps:0,tail=sequence[j+1];
                if(bestEnd<0||less(gaps,q,r,tail,bg,bq,br,bt)){bestEnd=j+1;bg=gaps;bq=q;br=r;bt=tail;}
            }
            following[i]=bestEnd;sequence[i]=append(bq,bg-br,append(bq+1,br,bt));
        }
        StringBuilder result=new StringBuilder();
        for(int i=0;i<n;i=following[i]){int end=following[i],gaps=end-i-1,letters=0;for(int j=i;j<end;j++)letters+=lengths[j];int q=gaps>0?(width-letters)/gaps:0,r=gaps>0?(width-letters)%gaps:0;
            for(int j=i;j<end;j++){if(j>i)result.append(" ".repeat(q+(j-i-1>=gaps-r?1:0)));result.append(words.get(j));}result.append('\n');
        }
        return result.append('\n').toString();
    }
    public static void main(String[] args)throws Exception{
        BufferedReader input=new BufferedReader(new InputStreamReader(System.in));String line;
        while((line=input.readLine())!=null){if(line.trim().isEmpty())continue;int width=Integer.parseInt(line.trim());if(width==0)break;ArrayList<String> words=new ArrayList<>();while((line=input.readLine())!=null&&!line.trim().isEmpty())for(String word:line.trim().split("\\s+"))words.add(word);System.out.print(format(width,words));}
    }
}
