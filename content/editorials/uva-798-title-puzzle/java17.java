import java.io.BufferedInputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Main {
    static BufferedInputStream in=new BufferedInputStream(System.in);
    static int number()throws Exception{int c;do{c=in.read();}while(c>=0&&c<=32);if(c<0)return -1;int x=0;while(c>32){x=x*10+c-'0';c=in.read();}return x;}
    static int area,full;static int[] counts,multiplier;static List<List<int[]>> anchors;static Map<Long,Long> memo;
    static long solve(int occupied,int code){if(occupied==full)return code==0?1:0;long key=((long)code<<area)|occupied;Long old=memo.get(key);if(old!=null)return old;int cell=Integer.numberOfTrailingZeros(full^occupied);long answer=0;for(int[] p:anchors.get(cell)){int mask=p[0],g=p[1];if((occupied&mask)!=0||code/multiplier[g]%(counts[g]+1)==0)continue;answer+=solve(occupied|mask,code-multiplier[g]);}memo.put(key,answer);return answer;}
    public static void main(String[] args)throws Exception{int width;while((width=number())>=0){int height=number(),n=number();area=width*height;full=(1<<area)-1;counts=new int[n];multiplier=new int[n];int[] widths=new int[n],heights=new int[n];int code=0,base=1;for(int g=0;g<n;g++){counts[g]=number();widths[g]=number();heights[g]=number();multiplier[g]=base;code+=counts[g]*base;base*=counts[g]+1;}anchors=new ArrayList<>();for(int cell=0;cell<area;cell++)anchors.add(new ArrayList<>());
        for(int g=0;g<n;g++)for(int turn=0;turn<(widths[g]==heights[g]?1:2);turn++){int w=turn==0?widths[g]:heights[g],h=turn==0?heights[g]:widths[g];for(int row=0;row+h<=height;row++)for(int col=0;col+w<=width;col++){int mask=0;for(int y=row;y<row+h;y++)for(int x=col;x<col+w;x++)mask|=1<<(y*width+x);anchors.get(row*width+col).add(new int[]{mask,g});}}
        memo=new HashMap<>();System.out.println(solve(0,code));memo=null;
    }}
}
