import java.io.BufferedInputStream;
import java.util.Arrays;
public class Main {
    static BufferedInputStream input=new BufferedInputStream(System.in);
    static int next()throws Exception{int c;do{c=input.read();}while(c>=0&&c<=32);if(c<0)return -1;int value=0;while(c>32){value=value*10+c-'0';c=input.read();}return value;}
    static int[]grid=new int[81],row=new int[9],column=new int[9],box=new int[9],empty=new int[81];
    static int count;
    static boolean search(int at){
        if(at==count)return true;
        int pick=at,minimum=10,options=0;
        for(int i=at;i<count;i++){
            int cell=empty[i],r=cell/9,c=cell%9,b=r/3*3+c/3;
            int mask=511&~(row[r]|column[c]|box[b]),bits=Integer.bitCount(mask);
            if(bits<minimum){minimum=bits;pick=i;options=mask;}
            if(minimum==0)return false;
        }
        int swap=empty[at];empty[at]=empty[pick];empty[pick]=swap;
        int cell=empty[at],r=cell/9,c=cell%9,b=r/3*3+c/3;
        while(options!=0){
            int bit=options&-options;options-=bit;grid[cell]=Integer.numberOfTrailingZeros(bit)+1;
            row[r]|=bit;column[c]|=bit;box[b]|=bit;
            if(search(at+1))return true;
            row[r]&=~bit;column[c]&=~bit;box[b]&=~bit;grid[cell]=0;
        }
        swap=empty[at];empty[at]=empty[pick];empty[pick]=swap;return false;
    }
    public static void main(String[]args)throws Exception{
        int tests=next();StringBuilder out=new StringBuilder();
        while(tests-->0){
            Arrays.fill(row,0);Arrays.fill(column,0);Arrays.fill(box,0);count=0;boolean valid=true;
            for(int cell=0;cell<81;cell++){
                int value=next();grid[cell]=value;int r=cell/9,c=cell%9,b=r/3*3+c/3;
                if(value!=0){int bit=1<<(value-1);if(((row[r]|column[c]|box[b])&bit)!=0)valid=false;row[r]|=bit;column[c]|=bit;box[b]|=bit;}
                else empty[count++]=cell;
            }
            if(!valid||!search(0)){out.append("NO\n");continue;}
            for(int r=0;r<9;r++){for(int c=0;c<9;c++){if(c!=0)out.append(' ');out.append(grid[r*9+c]);}out.append('\n');}
        }
        System.out.print(out);
    }
}
